const {
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

/**
 * Creates a success styled button.
 */

function createSuccessButton({
    customId,
    label,
    emoji = null,
    disabled = false
}) {

    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Success)
        .setDisabled(disabled);

    if (emoji) {
        button.setEmoji(emoji);
    }

    return button;
}

module.exports = createSuccessButton;