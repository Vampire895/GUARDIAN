const {
    ActionRowBuilder
} = require("discord.js");

/**
 * Creates a reusable action row.
 */

function createActionRow(components = []) {

    return new ActionRowBuilder()
        .addComponents(components);
}

module.exports = createActionRow;