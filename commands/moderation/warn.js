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

const { warnUser } = require(
    "../../systems/moderation-system/warnUser"
);

const {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed
} = require("../../ui/embeds");

const name = "warn";

const aliases = [
    "check"
];

const description =
    "Warn a member in the server.";

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
     * Permission check
     */
    const permissionCheck =
        checkPermissions({

            member:
                message.member,

            requiredPermissions: [
                "ManageMessages"
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
     * Validate target
     */
    if (!target) {

        return message.reply({

            embeds: [

                createErrorEmbed(
                    "Please mention a valid member to warn."
                )
            ]
        });
    }

    /**
     * Prevent self warn
     */
    if (target.id === message.author.id) {

        return message.reply({

            embeds: [

                createErrorEmbed(
                    "You cannot warn yourself."
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
                `Warn ${target.user.tag}?`
        });

    if (!confirmed) return;

    /**
     * Execute warning
     */
    const result =
        await warnUser({

            moderator:
                message.member,

            target,

            reason
        });

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

`⚠️ Warned ${target.user.tag}

Moderator: ${message.author.tag}

Reason:
${reason}

Case ID:
${caseId}

Total Warnings:
${result.warnings.length}`
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

`⚠️ Member Warned

User: ${target.user.tag}

Moderator: ${message.author.tag}

Reason:
${reason}

Case ID:
${caseId}

Total Warnings:
${result.warnings.length}`
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