const {
    ChannelType
} = require("discord.js");

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

const MAX_DURATION =
    12 * 60 * 60 * 1000;

/**
 * Parse duration
 */

function parseDuration(str) {

    const match =
        str?.match(/^(\d+)(s|m|h|d)$/);

    if (!match) return null;

    const num =
        parseInt(match[1]);

    if (num <= 0) return null;

    const unit =
        match[2];

    let duration;

    if (unit === "s") {

        duration =
            num * 1000;
    }

    if (unit === "m") {

        duration =
            num * 60 * 1000;
    }

    if (unit === "h") {

        duration =
            num * 60 * 60 * 1000;
    }

    if (unit === "d") {

        duration =
            num * 24 * 60 * 60 * 1000;
    }

    if (!duration) return null;

    if (duration > MAX_DURATION) {

        return null;
    }

    return duration;
}

/**
 * Find/Create and configure
 * Quarantine role
 */

async function getQuarantineRole(
    guild,
    botMember
) {

    let quarantineRole =
        guild.roles.cache.find(

            role =>
                role.name === "Quarantine"
        );

    /**
     * Create role if missing
     */

    if (!quarantineRole) {

        try {

            quarantineRole =
                await guild.roles.create({

                    name:
                        "Quarantine",

                    permissions: []
                });

        } catch (error) {

            console.error(
                "[Isolation] Failed to create Quarantine role:",
                error
            );

            return {

                success: false,

                error:
                    "I could not create the Quarantine role."
            };
        }
    }

    /**
     * Ensure bot can manage role
     */

    if (

        quarantineRole.managed
        ||
        quarantineRole.position >=
        botMember.roles.highest.position

    ) {

        return {

            success: false,

            error:
                "I cannot manage the Quarantine role."
        };
    }

    /**
     * Configure only normal public
     * text channels.
     *
     * Threads are intentionally skipped.
     * Private channels are intentionally skipped.
     * Voice channels are intentionally skipped.
     * Categories are intentionally skipped.
     */

    for (
        const [, channel]
        of guild.channels.cache
    ) {

        /**
         * Only normal guild text channels
         */

        if (
            channel.type !==
            ChannelType.GuildText
        ) {

            continue;
        }

        /**
         * Check @everyone permissions
         *
         * Only channels where everyone can
         * actually view and send messages
         * should be affected.
         */

        const everyonePermissions =
            channel.permissionsFor(
                guild.roles.everyone
            );

        if (!everyonePermissions) {

            continue;
        }

        if (
            !everyonePermissions.has(
                "ViewChannel"
            )
            ||
            !everyonePermissions.has(
                "SendMessages"
            )
        ) {

            continue;
        }

        try {

            await channel.permissionOverwrites.edit(

                quarantineRole,

                {

                    SendMessages:
                        false,

                    AddReactions:
                        false
                }
            );

        } catch (error) {

            console.error(

                `[Isolation] Failed to configure Quarantine in #${channel.name}:`,

                error
            );

            return {

                success: false,

                error:
                    `I could not configure Quarantine permissions in #${channel.name}.`
            };
        }
    }

    return {

        success: true,

        role:
            quarantineRole
    };
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

                    "Provide a valid duration from 1s up to 12h."
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
     * Guardian needs Manage Channels
     * to configure Quarantine overwrites.
     */

    if (
        !botMember.permissions.has(
            "ManageChannels"
        )
    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "I need Manage Channels permission to isolate users."
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
     * Find/Create and configure
     * Quarantine role
     */

    const quarantineResult =
        await getQuarantineRole(

            message.guild,

            botMember
        );

    if (!quarantineResult.success) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    quarantineResult.error
                )
            ]
        });
    }

    const quarantineRole =
        quarantineResult.role;

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
     * Isolation failed
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