const { checkPermissions } = require(
    "../../systems/permission-system"
);

const { confirmAction } = require(
    "../../ui/buttons/confirm"
);

const Warning = require(
    "../../database/models/Warning"
);

const logAction = require(
    "../../systems/logging-system/logAction"
);

const {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed
} = require("../../ui/embeds");

const name = "clearwarnings";

const aliases = [
    "clearwarns"
];

const description =
    "Clear warnings of a member.";

/**
 * Execute command
 */

async function execute(message, args) {

    const target =
        message.mentions.members.first();

    const amount =
        parseInt(args[1]);

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
    const permCheck =
        checkPermissions({

            member:
                message.member,

            botMember,

            requiredPermissions: [
                "ManageGuild"
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
     * Fetch warnings
     */
    const warnings =
        await Warning.find({

            userId:
                target.id
        })

        .sort({
            createdAt: -1
        });

    /**
     * No warnings
     */
    if (!warnings.length) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "This user has no warnings."
                )
            ]
        });
    }

    let removedCount = 0;

    /**
     * CLEAR SPECIFIC AMOUNT
     */
    if (amount) {

        /**
         * Validate amount
         */
        if (

            amount < 1
            ||
            amount > warnings.length

        ) {

            return message.reply({

                embeds: [

                    createErrorEmbed(

`Provide a number between 1 and ${warnings.length}.`
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

`Clear ${amount} warnings from ${target.user.tag}?`
            });

        if (!confirmed) return;

        /**
         * Select warnings
         */
        const warningsToDelete =
            warnings.slice(0, amount);

        /**
         * Delete warnings
         */
        for (const warn of warningsToDelete) {

            await Warning.deleteOne({

                _id:
                    warn._id
            });
        }

        removedCount =
            warningsToDelete.length;
    }

    /**
     * CLEAR ALL WARNINGS
     */
    else {

        /**
         * Confirmation
         */
        const confirmed =
            await confirmAction({

                message,

                userId:
                    message.author.id,

                content:

`Clear ALL warnings from ${target.user.tag}?`
            });

        if (!confirmed) return;

        /**
         * Delete all warnings
         */
        await Warning.deleteMany({

            userId:
                target.id
        });

        removedCount =
            warnings.length;
    }

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`⚠️ Warnings Cleared

User:
${target.user.tag}

Removed:
${removedCount}

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

`⚠️ Warnings Cleared

User:
${target.user.tag}

Removed:
${removedCount}

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