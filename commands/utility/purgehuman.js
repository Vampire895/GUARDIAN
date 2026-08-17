const {
    EmbedBuilder
} = require("discord.js");

const name =
    "purgehuman";

const aliases = [
    "ph"
];

const description =
    "Delete recent messages from a specific user.";


/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    /**
     * Administrator only
     */
    if (
        !message.member.permissions.has(
            "Administrator"
        )
    ) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "🔒 Administrator Only"
                    )

                    .setDescription(
                        "You need the **Administrator** permission to use this command."
                    )

            ]

        });
    }


    /**
     * Target user
     *
     * Accept:
     * @mention
     * User ID
     */
    const target =
        message.mentions.users.first()
        ||
        (
            args[0]
            ? await message.client.users
                .fetch(args[0])
                .catch(() => null)
            : null
        );


    /**
     * Target is required
     */
    if (!target) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "❌ User Required"
                    )

                    .setDescription(
                        "You must mention a user or provide their User ID.\n\n" +
                        "Example:\n" +
                        "`.ph @User 10`"
                    )

            ]

        });
    }


    /**
     * Requested amount
     *
     * Default = 30
     * Hard maximum = 30
     */
    let amount =
        parseInt(
            args[1],
            10
        );


    if (
        isNaN(amount)
        ||
        amount <= 0
    ) {

        amount = 30;
    }


    amount =
        Math.min(
            amount,
            30
        );


    /**
     * Fetch recent messages
     */
    let messages;

    try {

        messages =
            await message.channel.messages.fetch({

                limit: 100

            });

    } catch (error) {

        console.error(
            "[PURGEHUMAN] Failed to fetch messages:",
            error
        );

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "❌ Fetch Failed"
                    )

                    .setDescription(
                        "I couldn't read messages in this channel."
                    )

            ]

        });
    }


    /**
     * Find messages belonging
     * only to the selected user.
     *
     * Exclude the purge command itself.
     */
    const targetMessages =
        messages.filter(

            msg =>
                msg.author.id === target.id
                &&
                msg.id !== message.id

        );


    /**
     * Select requested amount
     */
    const targets =
        targetMessages.first(
            amount
        );


    /**
     * Nothing found
     */
    if (!targets.length) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "🧹 No Messages Found"
                    )

                    .setDescription(
                        `I couldn't find any recent messages from <@${target.id}> to purge.`
                    )

            ]

        });
    }


    /**
     * Delete individually
     *
     * Maximum 30 messages.
     */
    let deleted = 0;
    let failed = 0;


    for (
        const msg
        of targets
    ) {

        try {

            await msg.delete();

            deleted++;

        } catch (error) {

            failed++;

            console.error(

                `[PURGEHUMAN] Failed to delete message ${msg.id}:`,

                error

            );
        }
    }


    /**
     * Delete command itself
     */
    try {

        await message.delete();

    } catch {
        // Ignore if Guardian cannot delete the command
    }


    /**
     * Result embed
     */
    const embed =
        new EmbedBuilder()

            .setTitle(
                "🧹 User Messages Purged"
            )

            .setDescription(
                `🗑️ Deleted **${deleted}** message${deleted === 1 ? "" : "s"} from <@${target.id}>.`
            )

            .addFields({

                name:
                    "👤 User",

                value:
                    `<@${target.id}>`,

                inline:
                    true

            }, {

                name:
                    "📊 Requested",

                value:
                    `\`${amount}\``,

                inline:
                    true

            }, {

                name:
                    "🗑️ Deleted",

                value:
                    `\`${deleted}\``,

                inline:
                    true

            });


    /**
     * Failed deletions
     */
    if (failed) {

        embed.addFields({

            name:
                "⚠️ Failed",

            value:
                `\`${failed}\``,

            inline:
                true

        });
    }


    /**
     * Send result
     */
    const response =
        await message.channel.send({

            embeds: [
                embed
            ]

        });


    /**
     * Remove result after 5 seconds
     */
    setTimeout(

        () => {

            response
                .delete()
                .catch(
                    () => null
                );

        },

        5000

    );
}


module.exports = {

    name,

    aliases,

    description,

    execute

};