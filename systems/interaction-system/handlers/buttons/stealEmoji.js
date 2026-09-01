const {
    EmbedBuilder
} = require("discord.js");

/**
 * Steal expression as emoji
 */

module.exports = {

    customId:
        "utility:steal:emoji",

    async execute(
        interaction,
        parsed
    ) {

        /**
         * Get emoji information
         *
         * Format:
         * utility:steal:emoji:ID:animated
         * utility:steal:emoji:ID:static
         */
        const data =
            parsed.data;

        if (!data) {

            return interaction.reply({

                content:
                    "❌ Emoji information is missing.",

                ephemeral: true

            });
        }


        /**
         * Separate emoji ID
         * from animation type
         */
        const parts =
            data.split(":");

        const emojiId =
            parts[0];

        const animationType =
            parts[1];


        if (!emojiId) {

            return interaction.reply({

                content:
                    "❌ Emoji information is missing.",

                ephemeral: true

            });
        }


        /**
         * Preserve original emoji format
         */
        const extension =
            animationType === "animated"
                ? "gif"
                : "png";


        /**
         * Discord CDN
         */
        const emojiUrl =
            `https://cdn.discordapp.com/emojis/${emojiId}.${extension}?size=256&quality=lossless`;


        /**
         * Create emoji
         */
        try {

            const emoji =
                await interaction.guild.emojis.create({

                    attachment:
                        emojiUrl,

                    name:
                        `stolen_${emojiId}`

                });


            /**
             * Success
             */
            return interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "✅ Emoji Stolen Successfully"
                        )

                        .setDescription(

`**${emoji}** has been added to this server.

**Name:** \`${emoji.name}\`

**ID:** \`${emoji.id}\`

**Type:** ${
    animationType === "animated"
        ? "✨ Animated"
        : "Static"
}`

                        )

                        .setThumbnail(
                            emoji.url
                        )

                ],

                components: []

            });

        } catch (error) {

            console.error(
                "[STEAL EMOJI ERROR]",
                error
            );


            /**
             * Permission / limit / invalid
             * emoji error
             */
            return interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "❌ Failed to Steal Emoji"
                        )

                        .setDescription(

`I couldn't add this emoji to the server.

Possible reasons:

• Guardian cannot manage emojis
• The server has reached its emoji limit
• The source emoji is unavailable
• Guardian's role lacks the required permission`

                        )

                ],

                components: []

            });

        }

    }

};