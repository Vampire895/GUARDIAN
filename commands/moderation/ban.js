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

const { banUser } = require(
    "../../systems/moderation-system/banUser"
);

const {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed
} = require("../../ui/embeds");

const name = "ban";

const aliases = [
    "fuckban",
    "fuckoff"
];

const description =
    "Ban a member from the server.";

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
     * Permission check
     */
    const permissionCheck =
        checkPermissions({

            member:
                message.member,

            requiredPermissions: [
                "BanMembers"
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
     * Confirmation
     */
    const confirmed =
        await confirmAction({

            message,

            userId:
                message.author.id,

            content:
                `Are you sure you want to ban ${target.user.tag}?`
        });

    if (!confirmed) return;

    /**
     * Execute ban
     */
    const result =
        await banUser({

            moderator:
                message.member,

            target,

            reason,

            guild:
                message.guild
        });

    /**
     * Failed
     */
    if (!result.success) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    result.error
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

`🔨 Banned ${target.user.tag}

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

`🔨 Member Banned

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