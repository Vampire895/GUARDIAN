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

const name = "purge";

const aliases = [
    "clear",
    "clean",
    "dlt"
];

const description =
    "Delete messages in bulk or from a specific user.";

/**
 * Execute command
 */

async function execute(message, args) {

    const botMember =
        message.guild.members.me;

    /**
     * Permission check
     */
    const permCheck =
        checkPermissions({

            member:
                message.member,

            botMember,

            requiredPermissions: [
                "ManageMessages"
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
     * No arguments
     */
    if (!args[0]) {

        return message.reply({

            embeds: [
                createErrorEmbed(

`Usage Examples:

.purge 20
.purge bots
.purge bots 25
.purge @user 30`
                )
            ]
        });
    }

    /**
     * Fetch messages
     */
    const fetched =
        await message.channel.messages.fetch({

            limit: 100
        });

    let filtered =
        fetched;

    let purgeType =
        "mass";

    /**
     * BOT PURGE
     * .purge bots
     * .purge bots 25
     */
    if (

        args[0].toLowerCase()
        === "bots"

    ) {

        purgeType = "bots";

        const amount =
            parseInt(args[1]);

        const requestedAmount =
            args[1]
                ? amount
                : 50;

        /**
         * Validate amount
         */
        if (

            !Number.isInteger(
                requestedAmount
            )
            ||
            requestedAmount < 1
            ||
            requestedAmount > 100

        ) {

            return message.reply({

                embeds: [
                    createErrorEmbed(
                        "Provide a number between 1-100."
                    )
                ]
            });
        }

        filtered =
            fetched.filter(msg =>
                msg.author.bot
            );

        filtered =
            filtered.first(
                requestedAmount
            );
    }

    /**
     * USER PURGE
     * .purge @user 30
     */
    else if (
        message.mentions.users.first()
    ) {

        purgeType = "user";

        const target =
            message.mentions.users.first();

        const amount =
            parseInt(args[1]);

        /**
         * Validate amount
         */
        if (

            !Number.isInteger(amount)
            ||
            amount < 1
            ||
            amount > 100

        ) {

            return message.reply({

                embeds: [
                    createErrorEmbed(
                        "Provide a number between 1-100."
                    )
                ]
            });
        }

        filtered =
            fetched.filter(msg =>
                msg.author.id === target.id
            );

        filtered =
            filtered.first(
                amount
            );
    }

    /**
     * MASS PURGE
     * .purge 20
     */
    else {

        const amount =
            parseInt(args[0]);

        /**
         * Validate amount
         */
        if (

            !Number.isInteger(amount)
            ||
            amount < 1
            ||
            amount > 100

        ) {

            return message.reply({

                embeds: [
                    createErrorEmbed(
                        "Provide a number between 1-100."
                    )
                ]
            });
        }

        filtered =
            fetched.first(
                amount
            );
    }

    /**
     * Filter messages older than 14 days
     *
     * Discord bulk deletion cannot delete
     * messages older than 14 days.
     */
    const fourteenDaysAgo =
        Date.now()
        - (
            14
            * 24
            * 60
            * 60
            * 1000
        );

    filtered =
        filtered.filter(
            msg =>
                msg.createdTimestamp
                > fourteenDaysAgo
        );

    const deleteAmount =
        filtered.length;

    /**
     * Nothing found
     */
    if (!deleteAmount) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "No deletable messages found. Messages older than 14 days cannot be bulk deleted."
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
                `Delete ${deleteAmount} messages?`
        });

    if (!confirmed) return;

    /**
     * Execute purge
     */
    try {

        /**
         * Discord bulk deletion requires
         * at least 2 messages.
         */
        if (deleteAmount === 1) {

            const singleMessage =
                filtered.first();

            await singleMessage.delete();

        } else {

            await message.channel.bulkDelete(
                filtered,
                true
            );
        }

    } catch (error) {

        console.error(
            "[Purge Error]",
            error
        );

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to delete messages."
                )
            ]
        });
    }

    /**
     * Success embed
     */
    let successMessage =
        `🧹 Deleted ${deleteAmount} messages`;

    if (purgeType === "bots") {

        successMessage =
            `🤖 Deleted ${deleteAmount} bot messages`;
    }

    if (purgeType === "user") {

        const target =
            message.mentions.users.first();

        successMessage =
            `🧹 Deleted ${deleteAmount} messages from ${target.tag}`;
    }

    const successEmbed =
        createSuccessEmbed(
            successMessage
        );

    /**
     * Send success response
     */
    await message.channel.send({

        embeds: [successEmbed]
    });

    /**
     * Moderation log embed
     */
    const logEmbed =
        createInfoEmbed(

`🧹 Messages Purged

Moderator:
${message.author.tag}

Type:
${purgeType}

Deleted:
${deleteAmount}

Channel:
${message.channel}`
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