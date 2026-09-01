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
 * Extract emoji from Discord CDN URL
 *
 * Supports:
 * /emojis/ID.png
 * /emojis/ID.gif
 * /emojis/ID.webp
 */
function extractEmojiUrl(
    text
) {

    if (!text) {
        return null;
    }

    const match =
        text.match(
            /https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/emojis\/(\d+)\.(gif|png|webp)(?:\?[^\s]*)?/i
        );

    if (!match) {
        return null;
    }

    return {

        id:
            match[1],

        name:
            `stolen_${match[1]}`,

        animated:
            match[2].toLowerCase() === "gif",

        type:
            "emoji"
    };
}


/**
 * Extract sticker from Discord CDN URL
 *
 * Supports:
 * /stickers/ID.png
 * /stickers/ID.gif
 * /stickers/ID.webp
 * /stickers/ID.json
 */
function extractStickerUrl(
    text
) {

    if (!text) {
        return null;
    }

    const match =
        text.match(
            /https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/stickers\/(\d+)\.(png|gif|webp|json)(?:\?[^\s]*)?/i
        );

    if (!match) {
        return null;
    }

    const extension =
        match[2].toLowerCase();

    return {

        id:
            match[1],

        name:
            `stolen_${match[1]}`,

        url:
            text,

        format:
            extension,

        type:
            "sticker"
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
    const input =
        args.join(" ").trim();

    let expression =
        extractEmoji(
            input
        );


    /**
     * Direct emoji URL
     */
    if (!expression) {

        expression =
            extractEmojiUrl(
                input
            );
    }


    /**
     * Direct sticker URL
     */
    if (!expression) {

        expression =
            extractStickerUrl(
                input
            );
    }


    /**
     * Reply detection
     */
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

or send its Discord CDN URL.

You can also **reply to a custom emoji/sticker** with:

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
     * Format text
     */
    let formatText =
        "Static";


    if (
        expression.type === "emoji"
    ) {

        formatText =
            expression.animated
                ? "✨ Animated"
                : "Static";

    } else {

        formatText =
            expression.format === 2 ||
            expression.format === "gif" ||
            expression.format === "apng"

                ? "✨ Animated"

                : "Static";
    }


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

**Format:** ${formatText}

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
     */
    const row = {

        type: 1,

        components: [

            {

                type: 2,

                style: 1,

                custom_id:
                    `utility:steal:emoji:${expression.id}:${expression.animated ? "animated" : "static"}`,

                label:
                    "😀 Steal as Emoji"

            },

            {

                type: 2,

                style: 2,

                custom_id:
                    `utility:steal:sticker:${expression.id}:${expression.format || "unknown"}`,

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