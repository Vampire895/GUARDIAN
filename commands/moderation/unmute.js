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

const name = "unmute";

const aliases = [
    "bol"
];

const description =
    "Remove a user's timeout.";

/**
 * Command execute
 */

async function execute(message, args) {

    const target =
        message.mentions.members.first();

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
     * Check timeout status
     */

    if (!target.communicationDisabledUntilTimestamp) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "This user is not timed out."
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
                `Remove timeout from ${target.user.tag}?`
        });

    if (!confirmed) return;

    /**
     * Remove timeout
     */

    try {

        await target.timeout(
            null,
            `Timeout removed by ${message.author.tag}`
        );

    } catch (error) {

        console.error(
            "[UNMUTE COMMAND ERROR]",
            error
        );

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to remove timeout."
                )
            ]
        });
    }

    /**
     * Success embed
     */

    const successEmbed =
        createSuccessEmbed(

`🔊 Timeout Removed

User:
${target.user.tag}

Moderator:
${message.author.tag}`
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

`🔊 Member Unmuted

User:
${target.user.tag}

Moderator:
${message.author.tag}`
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