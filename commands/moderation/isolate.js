const { checkPermissions } = require(
    "../../systems/permission-system"
);

const { isolateUser } = require(
    "../../systems/moderation-system/isolateUser"
);

const { confirmAction } = require(
    "../../ui/buttons/confirm"
);

const logAction = require(
    "../../systems/logging-system/logAction"
);

const {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed
} = require("../../ui/embeds");

const name = "isolate";

const aliases = [
    "jail",
    "freeze"
];

const description =
    "Temporarily isolate a user.";

/**
 * Parse duration
 */

function parseDuration(str) {

    const match =
        str?.match(/^(\d+)(s|m|h|d)$/);

    if (!match) return null;

    const num =
        parseInt(match[1]);

    const unit =
        match[2];

    if (unit === "s") {
        return num * 1000;
    }

    if (unit === "m") {
        return num * 60 * 1000;
    }

    if (unit === "h") {
        return num * 60 * 60 * 1000;
    }

    if (unit === "d") {
        return num * 24 * 60 * 60 * 1000;
    }
}

/**
 * Execute command
 */

async function execute(message, args) {

    const target =
        message.mentions.members.first();

    const durationInput =
        args[1];

    const duration =
        parseDuration(durationInput);

    const reason =
        args.slice(2).join(" ")
        || "No reason provided.";

    const botMember =
        message.guild.members.me;

    /**
     * Validate target
     */
    if (!target) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Mention a valid user."
                )
            ]
        });
    }

    /**
     * Validate duration
     */
    if (!duration) {

        return message.reply({

            embeds: [

                createErrorEmbed(

"Provide valid duration (10m, 1h, 1d)."
                )
            ]
        });
    }

    /**
     * Permission check
     */
    const permCheck =
        checkPermissions({

            member:
                message.member,

            botMember,

            requiredPermissions: [
                "ManageRoles"
            ]
        });

    if (!permCheck.success) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Missing permissions."
                )
            ]
        });
    }

    /**
     * Prevent invalid targets
     */
    if (target.id === message.author.id) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot isolate yourself."
                )
            ]
        });
    }

    if (target.id === message.guild.ownerId) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot isolate the server owner."
                )
            ]
        });
    }

    /**
     * Hierarchy checks
     */
    if (

        target.roles.highest.position >=
        message.member.roles.highest.position

    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot isolate this user."
                )
            ]
        });
    }

    if (

        target.roles.highest.position >=
        botMember.roles.highest.position

    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "I cannot isolate this user."
                )
            ]
        });
    }

    /**
     * Find/Create quarantine role
     */
    let quarantineRole =
        message.guild.roles.cache.find(

            role =>
                role.name === "Quarantine"
        );

    /**
     * Create role if missing
     */
    if (!quarantineRole) {

        quarantineRole =
            await message.guild.roles.create({

                name:
                    "Quarantine",

                permissions: []
            });

        /**
         * Lock all channels
         */
        for (const [, channel] of message.guild.channels.cache) {

            try {

                await channel.permissionOverwrites.edit(

                    quarantineRole,

                    {
                        SendMessages: false,
                        AddReactions: false,
                        Speak: false,
                        Connect: false
                    }
                );

            } catch (error) {}
        }
    }

    /**
     * Confirmation
     */
    const confirmed =
        await confirmAction({

            message,

            userId:
                message.author.id,

            content:

`Isolate ${target.user.tag}

for ${durationInput}?`
        });

    if (!confirmed) return;

    /**
     * Execute isolation
     */
    const result =
        await isolateUser({

            target,

            durationMs:
                duration,

            quarantineRole,

            guild:
                message.guild
        });

    /**
     * Already isolated
     */
    if (!result.success) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    result.error
                )
            ]
        });
    }

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`🔒 User Isolated

User:
${target.user.tag}

Duration:
${durationInput}

Reason:
${reason}`
        );

    /**
     * Send success response
     */
    await message.reply({

        embeds: [successEmbed]
    });

    /**
     * Moderation log embed
     */
    const logEmbed =
        createInfoEmbed(

`🔒 User Isolated

User:
${target.user.tag}

Moderator:
${message.author.tag}

Duration:
${durationInput}

Reason:
${reason}`
        );

    /**
     * Dispatch moderation log
     */
    await logAction({

        guild:
            message.guild,

        category:
            "moderation",

        embeds: [logEmbed]
    });
}

module.exports = {

    name,

    aliases,

    description,

    execute
};