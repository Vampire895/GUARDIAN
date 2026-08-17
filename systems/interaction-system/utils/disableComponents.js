const {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

/**
 * Disables all components in action rows.
 */

function disableComponents(rows = []) {

    return rows.map(row => {

        const newRow = new ActionRowBuilder();

        const disabledComponents =
            row.components.map(component => {

                /**
                 * BUTTONS
                 */
                if (component.data.style) {

                    return ButtonBuilder
                        .from(component)
                        .setDisabled(true);
                }

                /**
                 * SELECT MENUS
                 */
                return StringSelectMenuBuilder
                    .from(component)
                    .setDisabled(true);
            });

        newRow.addComponents(disabledComponents);

        return newRow;
    });
}

module.exports = disableComponents;