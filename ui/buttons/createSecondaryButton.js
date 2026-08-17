const {
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

/**
 * Creates a secondary styled button.
 */

function createSecondaryButton({
    customId,
    label,
    emoji = null,
    disabled = false
}) {

    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);

    if (emoji) {
        button.setEmoji(emoji);
    }

    return button;
}

module.exports = createSecondaryButton;