const {
    EmbedBuilder
} = require("discord.js");

/**
 * Steal expression as sticker
 */

module.exports = {

    customId:
        "utility:steal:sticker",

    async execute(
        interaction,
        parsed
    ) {

        /**
         * Get sticker information
         *
         * Format:
         * utility:steal:sticker:ID:format
         */
        const data =
            parsed.data;

        if (!data) {

            return interaction.reply({

                content:
                    "❌ Sticker information is missing.",

                ephemeral: true

            });
        }


        /**
         * Separate sticker ID
         * from sticker format
         */
        const parts =
            data.split(":");

        const stickerId =
            parts[0];

        const stickerFormat =
            parts[1];


        if (!stickerId) {

            return interaction.reply({

                content:
                    "❌ Sticker information is missing.",

                ephemeral: true

            });
        }


        /**
         * Determine sticker format
         *
         * Discord:
         *
         * PNG  = 1
         * APNG = 2
         * LOTTIE = 3
         * GIF = 4
         */
        let formatType =
            1;

        let extension =
            "png";


        if (
            stickerFormat === "2" ||
            stickerFormat === "apng"
        ) {

            formatType =
                2;

            extension =
                "png";

        } else if (
            stickerFormat === "4" ||
            stickerFormat === "gif"
        ) {

            formatType =
                4;

            extension =
                "gif";
        }


        /**
         * Discord sticker CDN
         */
        const stickerUrl =
            `https://cdn.discordapp.com/stickers/${stickerId}.${extension}?size=320`;


        /**
         * Create sticker
         */
        try {

            const sticker =
                await interaction.guild.stickers.create({

                    file:
                        stickerUrl,

                    name:
                        `stolen_${stickerId}`,

                    tags:
                        "😀",

                    description:
                        `Stolen sticker ${stickerId}`,

                    formatType:
                        formatType

                });


            /**
             * Success
             */
            return interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "✅ Sticker Stolen Successfully"
                        )

                        .setDescription(

`**${sticker.name}** has been added to this server.

**Name:** \`${sticker.name}\`

**ID:** \`${sticker.id}\`

**Type:** ${
    formatType === 2 ||
    formatType === 4
        ? "✨ Animated"
        : "Static"
}`

                        )

                        .setThumbnail(
                            sticker.url
                        )

                ],

                components: []

            });

        } catch (error) {

            console.error(
                "[STEAL STICKER ERROR]",
                error
            );


            /**
             * Permission / limit / invalid
             * sticker error
             */
            return interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "❌ Failed to Steal Sticker"
                        )

                        .setDescription(

`I couldn't add this sticker to the server.

Possible reasons:

• Guardian cannot manage stickers
• The server has reached its sticker limit
• Guardian lacks the required permission
• The source sticker format is unsupported
• The sticker is unavailable`

                        )

                ],

                components: []

            });

        }

    }

};