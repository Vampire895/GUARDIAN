const { generateCase } = require(
    "../../systems/moderation-system/caseManager"
);

const logAction = require(
    "../../systems/logging-system/logAction"
);

const { confirmAction } = require(
    "../../ui/buttons/confirm"
);

const { checkPermissions } = require(
    "../../systems/permission-system"
);

const {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed
} = require("../../ui/embeds");

const name = "kick";

const aliases = [
    "fuckkick",
    "boot",
    "gtfo"
];

const description =
    "Kick a member from the server.";

/**
 * Execute command
 */

async function execute(message, args) {

    const target =
        message.mentions.members.first();

    const reason =
        args.slice(1).join(" ")
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
                    "Please mention a valid member."
                )
            ]
        });
    }

    /**
     * Prevent self kick
     */
    if (target.id === message.author.id) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "You cannot kick yourself."
                )
            ]
        });
    }

    /**
     * Permission check
     */
    const permissionCheck =
        checkPermissions({

            member:
                message.member,

            requiredPermissions: [
                "KickMembers"
            ],

            botMember
        });

    if (!permissionCheck.success) {

        const label =

            permissionCheck.error.type
            === "USER_MISSING_PERMISSIONS"

                ? "You are"

                : "I am";

        return message.reply({

            embeds: [

                createErrorEmbed(

`${label} missing the following permissions:

${permissionCheck.error.missing.join(", ")}`
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
                    "You cannot kick this user."
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
                    "I cannot kick this user."
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
                `Are you sure you want to kick ${target.user.tag}?`
        });

    if (!confirmed) return;

    /**
     * Execute kick
     */
    try {

        await target.kick(reason);

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to kick the user."
                )
            ]
        });
    }

    /**
     * Generate case ID
     */
    const caseId =
        generateCase();

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`👢 Kicked ${target.user.tag}

Moderator: ${message.author.tag}

Reason:
${reason}

Case ID:
${caseId}`
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

`👢 Member Kicked

User: ${target.user.tag}

Moderator: ${message.author.tag}

Reason:
${reason}

Case ID:
${caseId}`
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