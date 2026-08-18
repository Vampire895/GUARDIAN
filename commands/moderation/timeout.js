const { checkPermissions } = require(
    "../../systems/permission-system"
);

const { confirmAction } = require(
    "../../ui/buttons/confirm"
);

const {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed
} = require("../../ui/embeds");

const logAction = require(
    "../../systems/logging-system/logAction"
);

const name = "timeout";

const aliases = [
    "mute",
    "chup"
];

const description =
    "Temporarily mute a user.";

const MAX_TIMEOUT =
    28 * 24 * 60 * 60 * 1000;

/**
 * Parse timeout duration
 */

function parseDuration(str) {

    if (!str) return null;

    const match =
        str.match(/^(\d+)(s|m|h|d)$/);

    if (!match) return null;

    const num =
        Number(match[1]);

    if (
        !Number.isSafeInteger(num)
        ||
        num <= 0
    ) {

        return null;
    }

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

    return null;
}

/**
 * Command execute
 */

async function execute(message, args) {

    const target =
        message.mentions.members.first();

    const durationStr =
        args[1];

    const reason =
        args.slice(2).join(" ")
        || "No reason provided.";

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

    const duration =
        parseDuration(durationStr);

    if (!duration) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Provide valid duration (10s, 10m, 1h, 1d)."
                )
            ]
        });
    }

    /**
     * Maximum Discord timeout duration
     */

    if (duration > MAX_TIMEOUT) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Timeout cannot be longer than 28 days."
                )
            ]
        });
    }

    /**
     * Permission checks
     */

    const permCheck =
        checkPermissions({

            member:
                message.member,

            botMember:
                message.guild.members.me,

            requiredPermissions: [
                "ModerateMembers"
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
     * Invalid targets
     */

    if (target.id === message.author.id) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot timeout yourself."
                )
            ]
        });
    }

    if (target.id === message.guild.ownerId) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot timeout the server owner."
                )
            ]
        });
    }

    if (target.user.bot) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot timeout bots."
                )
            ]
        });
    }

    /**
     * Role hierarchy
     */

    if (
        target.roles.highest.position >=
        message.member.roles.highest.position
    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot timeout this user."
                )
            ]
        });
    }

    if (
        target.roles.highest.position >=
        message.guild.members.me.roles.highest.position
    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "I cannot timeout this user."
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
                `Timeout ${target.user.tag} for ${durationStr}?`
        });

    if (!confirmed) return;

    /**
     * Execute timeout
     */

    try {

        await target.timeout(
            duration,
            reason
        );

    } catch (error) {

        console.error(
            "[TIMEOUT COMMAND ERROR]",
            error
        );

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to timeout user."
                )
            ]
        });
    }

    /**
     * Success embed
     */

    const successEmbed =
        createSuccessEmbed(

`Timed out ${target.user.tag}

Duration: ${durationStr}

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
     * Logging embed
     */

    const logEmbed =
        createInfoEmbed(

`🔨 Member Timed Out

User: ${target.user.tag}

Moderator: ${message.author.tag}

Duration: ${durationStr}

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