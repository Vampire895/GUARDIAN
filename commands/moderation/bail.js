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
     * Resolve saved roles
     *
     * Only restore roles that:
     *
     * 1. Still exist
     * 2. Are not managed roles
     * 3. Are below Guardian's highest role
     */
    const rolesToRestore = [];

    for (
        const roleId
        of isolationData.roles
    ) {

        const role =
            message.guild.roles.cache.get(
                roleId
            );

        /**
         * Role was deleted
         */
        if (!role) {

            continue;
        }

        /**
         * Managed roles cannot be
         * manually restored
         */
        if (role.managed) {

            continue;
        }

        /**
         * Guardian cannot manage
         * roles at or above its highest role
         */
        if (

            role.position >=
            botMember.roles.highest.position

        ) {

            continue;
        }

        /**
         * Restore valid role
         */
        rolesToRestore.push(
            role
        );
    }

    /**
     * Restore original roles
     *
     * Do this before removing
     * Quarantine so the user is not
     * released without their valid roles.
     */
    try {

        if (rolesToRestore.length) {

            await target.roles.add(
                rolesToRestore
            );
        }

    } catch (error) {

        console.error(
            "[Bail] Failed to restore user roles:",
            error
        );

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to restore the user's roles. Isolation was not removed."
                )
            ]
        });
    }

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

    } catch (error) {

        console.error(
            "[Bail] Failed to remove Quarantine:",
            error
        );

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to remove the Quarantine role. Isolation data was kept."
                )
            ]
        });
    }

    /**
     * Delete isolation entry
     *
     * Discord restoration succeeded,
     * so the isolation record can now
     * safely be removed.
     */
    try {

        await IsolatedUser.deleteOne({

            userId:
                target.id,

            guildId:
                message.guild.id
        });

    } catch (error) {

        console.error(
            "[Bail] Failed to delete isolation data:",
            error
        );

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "User was released, but isolation data could not be removed from the database."
                )
            ]
        });
    }

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