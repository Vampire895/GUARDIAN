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

const name = "role";

const aliases = [
    "give",
    "take",
    "remove"
];

const description =
    "Add or remove a role.";

/**
 * Resolve role
 */

function resolveRole(message, args) {

    /**
     * Mentioned role
     */
    let role =
        message.mentions.roles.first();

    if (role) return role;

    /**
     * Role ID
     */
    role =
        message.guild.roles.cache.get(
            args[1]
        );

    if (role) return role;

    /**
     * Role name
     */
    const roleName =
        args.slice(1).join(" ").toLowerCase();

    if (!roleName) return null;

    role =
        message.guild.roles.cache.find(

            r =>
                r.name.toLowerCase()
                === roleName
        );

    return role || null;
}

/**
 * Execute command
 */

async function execute(message, args) {

    /**
     * Determine invoked command
     *
     * .role   = add
     * .give   = add
     * .take   = remove
     * .remove = remove
     */

    const commandName =
        message.content
            .trim()
            .split(/ +/)[0]
            .replace(/^[^\w]*/, "")
            .toLowerCase();

    let action = null;

    if (
        commandName === "role"
        ||
        commandName === "give"
    ) {

        action = "add";

    }

    if (
        commandName === "take"
        ||
        commandName === "remove"
    ) {

        action = "remove";

    }

    const target =
        message.mentions.members.first();

    const role =
        resolveRole(message, args);

    const botMember =
        message.guild.members.me;

    /**
     * Validate usage
     */

    if (
        !action
        ||
        !target
        ||
        !role
    ) {

        return message.reply({

            embeds: [

                createErrorEmbed(

`Usage Examples:

.role @user @role
.give @user @role
.take @user @role
.remove @user @role
.role @user roleid
.give @user Role Name`
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
     * Managed role check
     */

    if (role.managed) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "I cannot manage this role."
                )
            ]
        });
    }

    /**
     * Bot hierarchy check
     */

    if (
        role.position >=
        botMember.roles.highest.position
    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "I cannot manage this role."
                )
            ]
        });
    }

    /**
     * User hierarchy check
     */

    if (
        role.position >=
        message.member.roles.highest.position
    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot manage this role."
                )
            ]
        });
    }

    /**
     * Prevent duplicate actions
     */

    if (
        action === "add"
        &&
        target.roles.cache.has(role.id)
    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "User already has this role."
                )
            ]
        });
    }

    if (
        action === "remove"
        &&
        !target.roles.cache.has(role.id)
    ) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "User does not have this role."
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

`${action === "add" ? "Add" : "Remove"}

${role.name}

${action === "add" ? "to" : "from"}

${target.user.tag}?`
        });

    if (!confirmed) return;

    /**
     * Execute action
     */

    try {

        if (action === "add") {

            await target.roles.add(
                role
            );
        }

        if (action === "remove") {

            await target.roles.remove(
                role
            );
        }

    } catch (error) {

        console.error(
            "[ROLE COMMAND ERROR]",
            error
        );

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to modify role."
                )
            ]
        });
    }

    /**
     * Success embed
     */

    const successEmbed =
        createSuccessEmbed(

`${action === "add" ? "✅ Role Added" : "❌ Role Removed"}

User:
${target.user.tag}

Role:
${role.name}

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

`${action === "add" ? "✅ Role Added" : "❌ Role Removed"}

User:
${target.user.tag}

Role:
${role.name}

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