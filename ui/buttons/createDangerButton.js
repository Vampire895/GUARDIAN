const {
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

/**
 * Creates a danger styled button.
 */

function createDangerButton({
    customId,
    label,
    emoji = null,
    disabled = false
}) {

    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled);

    if (emoji) {
        button.setEmoji(emoji);
    }

    return button;
}

module.exports = createDangerButton;