const {
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

/**
 * Creates a primary styled button.
 */

function createPrimaryButton({
    customId,
    label,
    emoji = null,
    disabled = false
}) {

    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled);

    if (emoji) {
        button.setEmoji(emoji);
    }

    return button;
}

module.exports = createPrimaryButton;