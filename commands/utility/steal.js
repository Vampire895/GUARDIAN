const {
    EmbedBuilder
} = require("discord.js");

const name =
    "steal";

const aliases = [];

const description =
    "Steal a custom emoji or sticker into this server.";


/**
 * Extract custom emoji from text
 *
 * Supports:
 * <:name:id>
 * <a:name:id>
 */
function extractEmoji(
    text
) {

    if (!text) {
        return null;
    }

    const match =
        text.match(
            /<(a?):([a-zA-Z0-9_]+):(\d+)>/
        );

    if (!match) {
        return null;
    }

    return {

        id:
            match[3],

        name:
            match[2],

        animated:
            match[1] === "a",

        type:
            "emoji"
    };
}


/**
 * Get emoji/sticker from
 * the replied message.
 */
function getReplyExpression(
    message
) {

    const replied =
        message.reference?.messageId;

    if (!replied) {
        return null;
    }

    const referencedMessage =
        message.channel.messages.cache.get(
            replied
        );

    if (!referencedMessage) {
        return null;
    }


    /**
     * Custom emoji in message content
     */
    const emoji =
        extractEmoji(
            referencedMessage.content
        );

    if (emoji) {
        return emoji;
    }


    /**
     * Sticker
     */
    const sticker =
        referencedMessage.stickers.first();

    if (sticker) {

        return {

            id:
                sticker.id,

            name:
                sticker.name,

            url:
                sticker.url,

            format:
                sticker.format,

            type:
                "sticker"
        };
    }


    return null;
}


/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    /**
     * Permission check
     */
    if (
        !message.member.permissions.has(
            "ManageGuildExpressions"
        )
    ) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "🔒 Permission Denied"
                    )

                    .setDescription(
                        "You need the **Manage Expressions** permission to use `.steal`."
                    )

            ]

        });
    }


    /**
     * Find expression
     *
     * Priority:
     * 1. Command argument
     * 2. Replied message
     */
    let expression =
        extractEmoji(
            args.join(" ")
        );


    if (!expression) {

        expression =
            getReplyExpression(
                message
            );
    }


    /**
     * Nothing detected
     */
    if (!expression) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "❌ Nothing to Steal"
                    )

                    .setDescription(

`Send a custom emoji with the command:

\`.steal <:emoji:ID>\`

or **reply to a custom emoji/sticker** with:

\`.steal\``

                    )

            ]

        });
    }


    /**
     * Expression type
     */
    const typeText =
        expression.type === "emoji"

            ? "😀 Custom Emoji"

            : "🖼️ Sticker";


    /**
     * Preview embed
     */
    const embed =
        new EmbedBuilder()

            .setTitle(
                "🛠️ Expression Detected"
            )

            .setDescription(

`Guardian detected the following expression:

**Name:** \`${expression.name}\`

**Type:** ${typeText}

Choose how you want to add it to this server.`

            );


    /**
     * Actual expression preview
     */
    if (
        expression.type === "emoji"
    ) {

        const extension =
            expression.animated
                ? "gif"
                : "png";

        const emojiUrl =
            `https://cdn.discordapp.com/emojis/${expression.id}.${extension}?size=256&quality=lossless`;

        embed.setImage(
            emojiUrl
        );

    } else if (
        expression.type === "sticker"
    ) {

        embed.setImage(
            expression.url
        );
    }


    /**
     * Temporary preview buttons
     *
     * Actual handlers will be added
     * in the next step.
     */
    const row = {

        type: 1,

        components: [

            {

                type: 2,

                style: 1,

                custom_id:
                    `utility:steal:emoji:${expression.id}`,

                label:
                    "😀 Steal as Emoji"

            },

            {

                type: 2,

                style: 2,

                custom_id:
                    `utility:steal:sticker:${expression.id}`,

                label:
                    "🖼️ Steal as Sticker"

            }

        ]

    };


    return message.reply({

        embeds: [
            embed
        ],

        components: [
            row
        ]

    });
}


module.exports = {

    name,

    aliases,

    description,

    execute

};