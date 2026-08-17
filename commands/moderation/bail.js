const IsolatedUser = require(
    "../../database/models/IsolatedUser"
);

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

const name = "bail";

const aliases = [
    "unfreeze"
];

const description =
    "Remove user isolation early.";

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
                    "Mention a valid user."
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
     * Find isolation data
     */
    const isolationData =
        await IsolatedUser.findOne({

            userId:
                target.id,

            guildId:
                message.guild.id
        });

    /**
     * Not isolated
     */
    if (!isolationData) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "User is not isolated."
                )
            ]
        });
    }

    /**
     * Find quarantine role
     */
    const quarantineRole =
        message.guild.roles.cache.find(

            role =>
                role.name === "Quarantine"
        );

    /**
     * Confirmation
     */
    const confirmed =
        await confirmAction({

            message,

            userId:
                message.author.id,

            content:
                `Remove isolation from ${target.user.tag}?`
        });

    if (!confirmed) return;

    /**
     * Remove quarantine role
     */
    try {

        if (

            quarantineRole
            &&
            target.roles.cache.has(
                quarantineRole.id
            )

        ) {

            await target.roles.remove(
                quarantineRole
            );
        }

        /**
         * Restore original roles
         */
        await target.roles.add(
            isolationData.roles
        );

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to restore user roles."
                )
            ]
        });
    }

    /**
     * Delete isolation entry
     */
    await IsolatedUser.deleteOne({

        userId:
            target.id,

        guildId:
            message.guild.id
    });

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`🔓 User Released

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
     * Moderation log embed
     */
    const logEmbed =
        createInfoEmbed(

`🔓 Isolation Removed

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