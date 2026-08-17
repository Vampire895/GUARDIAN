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

const name = "resetnick";

const aliases = [
    "unnick",
    "defaultnick"
];

const description =
    "Reset a user's nickname.";

/**
 * Execute command
 */

async function execute(message, args) {

    const target =
        message.mentions.members.first();

    const botMember =
        message.guild.members.me;

    /**
     * Validate target
     */
    if (!target) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Please mention a valid user."
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
     * Prevent invalid targets
     */
    if (target.id === message.author.id) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot reset your own nickname."
                )
            ]
        });
    }

    if (target.id === message.guild.ownerId) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot reset the server owner's nickname."
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
                    "You cannot reset this user's nickname."
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
                    "I cannot reset this user's nickname."
                )
            ]
        });
    }

    /**
     * Current nickname
     */
    const oldNick =
        target.nickname
        || target.user.username;

    /**
     * Confirmation
     */
    const confirmed =
        await confirmAction({

            message,

            userId:
                message.author.id,

            content:

`Reset ${target.user.tag}'s nickname

back to default profile name?`
        });

    if (!confirmed) return;

    /**
     * Execute reset
     */
    try {

        /**
         * NULL resets nickname
         * back to Discord profile name
         */
        await target.setNickname(
            null
        );

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to reset nickname."
                )
            ]
        });
    }

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`🏷️ Nickname Reset

User:
${target.user.tag}

Previous Nickname:
${oldNick}

Current Name:
${target.user.username}`
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

`🏷️ Nickname Reset

User:
${target.user.tag}

Moderator:
${message.author.tag}

Previous Nickname:
${oldNick}

Reset To:
${target.user.username}`
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