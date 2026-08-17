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
         * Get emoji ID
         */
        const emojiId =
            parsed.data;

        if (!emojiId) {

            return interaction.reply({

                content:
                    "❌ Emoji information is missing.",

                ephemeral: true

            });
        }


        /**
         * Find the emoji from
         * the original message data.
         *
         * Discord CDN is used directly.
         */
        const emojiUrl =
            `https://cdn.discordapp.com/emojis/${emojiId}.png?size=256&quality=lossless`;


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

**ID:** \`${emoji.id}\``

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