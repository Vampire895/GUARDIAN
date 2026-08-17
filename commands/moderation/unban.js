const { checkPermissions } = require(
    "../../systems/permission-system"
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

const name = "unban";

const aliases = [
    "pardon",
    "free"
];

const description =
    "Unban a user by ID.";

/**
 * Execute command
 */

async function execute(message, args) {

    const userId =
        args[0];

    const reason =
        args.slice(1).join(" ")
        || "No reason provided.";

    const botMember =
        message.guild.members.me;

    /**
     * Validate input
     */
    if (!userId) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Provide a valid user ID."
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
                "BanMembers"
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
     * Fetch banned user
     */
    let bannedUser;

    try {

        bannedUser =
            await message.guild.bans.fetch(
                userId
            );

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "User is not banned or invalid ID."
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
                `Unban ${bannedUser.user.tag}?`
        });

    if (!confirmed) return;

    /**
     * Execute unban
     */
    try {

        await message.guild.members.unban(
            userId,
            reason
        );

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to unban user."
                )
            ]
        });
    }

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`🔓 User Unbanned

User:
${bannedUser.user.tag}

Moderator:
${message.author.tag}

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

`🔓 User Unbanned

User:
${bannedUser.user.tag}

Moderator:
${message.author.tag}

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