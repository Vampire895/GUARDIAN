const {
    EmbedBuilder
} = require("discord.js");

const name =
    "emoji";

const aliases = [];

const description =
    "View information about custom server emojis.";


/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    const guild =
        message.guild;

    if (!guild) {

        return message.reply(
            "❌ This command can only be used inside a server."
        );
    }


    /**
     * Fetch emojis
     */
    const emojis =
        guild.emojis.cache;


    /**
     * No emojis
     */
    if (!emojis.size) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "😶 No Custom Emojis"
                    )

                    .setDescription(
                        "This server doesn't have any custom emojis."
                    )

            ]

        });
    }


    /**
     * Check whether user requested
     * a specific emoji.
     */
    const input =
        args[0];


    if (input) {

        /**
         * Try to extract emoji ID
         *
         * Supports:
         * <:name:id>
         * <a:name:id>
         * raw ID
         */
        const match =
            input.match(
                /<a?:\w+:(\d+)>/
            );


        const emojiId =
            match
                ? match[1]
                : /^\d{17,20}$/.test(input)
                    ? input
                    : null;


        /**
         * Search by emoji name
         */
        let emoji =
            emojiId
                ? emojis.get(emojiId)
                : emojis.find(
                    e =>
                        e.name?.toLowerCase()
                        ===
                        input.toLowerCase()
                );


        if (!emoji) {

            return message.reply({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "❌ Emoji Not Found"
                        )

                        .setDescription(
                            `I couldn't find the custom emoji \`${input}\` in this server.`
                        )

                ]

            });
        }


        /**
         * Emoji URL
         */
        const emojiUrl =
            emoji.imageURL({

                extension:
                    emoji.animated
                        ? "gif"
                        : "png",

                size:
                    1024
            });


        /**
         * Creation date
         */
        const createdAt =
            emoji.createdAt;


        const timestamp =
            createdAt
                ? `<t:${Math.floor(
                    createdAt.getTime() / 1000
                )}:F>`
                : "Unknown";


        /**
         * Build detailed embed
         */
        const embed =
            new EmbedBuilder()

                .setTitle(
                    `😀 ${emoji.name}`
                )

                .setThumbnail(
                    emojiUrl
                )

                .setDescription(
                    `${emoji}\n\n` +
                    `**Emoji:** \`${emoji.name}\`\n` +
                    `**ID:** \`${emoji.id}\``
                )

                .addFields(

                    {
                        name:
                            "🎞️ Type",

                        value:
                            emoji.animated
                                ? "Animated GIF"
                                : "Static PNG",

                        inline:
                            true
                    },

                    {
                        name:
                            "⚙️ Managed",

                        value:
                            emoji.managed
                                ? "Yes"
                                : "No",

                        inline:
                            true
                    },

                    {
                        name:
                            "📅 Created",

                        value:
                            timestamp,

                        inline:
                            true
                    },

                    {
                        name:
                            "🔗 Emoji URL",

                        value:
                            `[Open Emoji](${emojiUrl})`,

                        inline:
                            false
                    }

                )

                .setFooter({

                    text:
                        `Requested by ${message.author.tag}`

                })

                .setTimestamp();


        return message.reply({

            embeds: [
                embed
            ]

        });
    }


    /**
     * Server emoji overview
     */

    const staticEmojis =
        emojis.filter(
            emoji =>
                !emoji.animated
        );

    const animatedEmojis =
        emojis.filter(
            emoji =>
                emoji.animated
        );


    /**
     * Discord has a practical embed
     * description size limit.
     *
     * Keep the overview compact.
     */
    const emojiList =
        emojis

            .map(
                emoji =>
                    `${emoji} \`:${emoji.name}:\``
            )

            .slice(0, 50);


    let description =
        emojiList.join("  ");


    if (emojis.size > 50) {

        description +=
            `\n\n…and **${emojis.size - 50}** more.`;
    }


    const embed =
        new EmbedBuilder()

            .setTitle(
                `😀 ${guild.name} — Custom Emojis`
            )

            .setDescription(
                description
            )

            .addFields(

                {
                    name:
                        "📊 Total",

                    value:
                        `\`${emojis.size}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🖼️ Static",

                    value:
                        `\`${staticEmojis.size}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🎞️ Animated",

                    value:
                        `\`${animatedEmojis.size}\``,

                    inline:
                        true
                }

            )

            .setFooter({

                text:
                    `Use .emoji <name> or .emoji <ID> for detailed information • ${message.author.tag}`

            })

            .setTimestamp();


    return message.reply({

        embeds: [
            embed
        ]

    });
}


module.exports = {

    name,

    aliases,

    description,

    execute

};