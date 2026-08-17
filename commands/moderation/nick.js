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

const name = "nick";

const aliases = [
    "name",
    "call"
];

const description =
    "Change a user's nickname.";

/**
 * Execute command
 */

async function execute(message, args) {

    const target =
        message.mentions.members.first();

    const newNick =
        args.slice(1).join(" ");

    const botMember =
        message.guild.members.me;

    /**
     * Validate input
     */
    if (!target || !newNick) {

        return message.reply({

            embeds: [

                createErrorEmbed(

`Usage:

.nick @user new_name`
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
                "ManageNicknames"
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
     * Prevent self nickname change
     */
    if (target.id === message.author.id) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot change your own nickname."
                )
            ]
        });
    }

    /**
     * Role hierarchy checks
     */
    if (

        target.roles.highest.position >=
        message.member.roles.highest.position

    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot change this user's nickname."
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
                    "I cannot change this user's nickname."
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
                `Change ${target.user.tag}'s nickname to "${newNick}"?`
        });

    if (!confirmed) return;

    /**
     * Store old nickname
     */
    const oldNick =
        target.nickname
        || target.user.username;

    /**
     * Execute nickname change
     */
    try {

        await target.setNickname(
            newNick
        );

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to change nickname."
                )
            ]
        });
    }

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`🏷️ Nickname Updated

User:
${target.user.tag}

Old Nickname:
${oldNick}

New Nickname:
${newNick}`
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

`🏷️ Nickname Changed

User:
${target.user.tag}

Moderator:
${message.author.tag}

Old Nickname:
${oldNick}

New Nickname:
${newNick}`
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