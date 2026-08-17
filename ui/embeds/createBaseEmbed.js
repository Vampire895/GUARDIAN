const {
    EmbedBuilder
} = require("discord.js");

const colors = require("./colors");

/**
 * Universal base embed factory.
 */

function createBaseEmbed({

    color = colors.INFO,

    title = null,
    description = null,

    fields = [],

    footer = null,
    footerIcon = null,

    thumbnail = null,
    image = null,

    author = null,
    authorIcon = null

}) {

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTimestamp();

    /**
     * Title
     */
    if (title) {
        embed.setTitle(title);
    }

    /**
     * Description
     */
    if (description) {
        embed.setDescription(description);
    }

    /**
     * Fields
     */
    if (fields.length) {
        embed.addFields(fields);
    }

    /**
     * Footer
     */
    if (footer) {

        embed.setFooter({
            text: footer,
            iconURL: footerIcon || null
        });
    }

    /**
     * Thumbnail
     */
    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }

    /**
     * Image
     */
    if (image) {
        embed.setImage(image);
    }

    /**
     * Author
     */
    if (author) {

        embed.setAuthor({
            name: author,
            iconURL: authorIcon || null
        });
    }

    return embed;
}

module.exports = createBaseEmbed;