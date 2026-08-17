const {
    EmbedBuilder
} = require("discord.js");

const name =
    "purgebots";

const aliases = [
    "pb"
];

const description =
    "Delete recent messages sent by bots.";


/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    const channel =
        message.channel;


    /**
     * Requested amount
     *
     * Default = 20
     * Hard maximum = 20
     */
    let amount =
        parseInt(
            args[0],
            10
        );


    if (
        isNaN(amount) ||
        amount <= 0
    ) {

        amount = 20;
    }


    amount =
        Math.min(
            amount,
            20
        );


    /**
     * Fetch recent messages
     */
    let messages;

    try {

        messages =
            await channel.messages.fetch({

                limit: 100

            });

    } catch (error) {

        console.error(
            "[PURGEBOTS] Failed to fetch messages:",
            error
        );

        return message.reply(
            "❌ I couldn't read messages in this channel."
        );
    }


    /**
     * Find bot messages
     *
     * Exclude the .pb command itself.
     */
    const botMessages =
        messages.filter(
            msg =>
                msg.author.bot
                &&
                msg.id !== message.id
        );


    /**
     * Select requested amount
     */
    const targets =
        botMessages
            .first(amount);


    /**
     * Nothing found
     */
    if (!targets.length) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "🤖 No Bot Messages Found"
                    )

                    .setDescription(
                        "I couldn't find any recent bot messages to purge."
                    )

            ]

        });

    }


    /**
     * Delete messages individually
     *
     * This avoids bulk-delete edge cases
     * and gives us an exact success count.
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
                `[PURGEBOTS] Failed to delete message ${msg.id}:`,
                error
            );
        }
    }


    /**
     * Remove the command itself
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
                "🧹 Bot Messages Purged"
            )

            .setDescription(
                `🤖 Deleted **${deleted}** bot message${deleted === 1 ? "" : "s"}.`
            )

            .addFields({

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
        await channel.send({

            embeds: [
                embed
            ]

        });


    /**
     * Automatically remove result
     * after 5 seconds.
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