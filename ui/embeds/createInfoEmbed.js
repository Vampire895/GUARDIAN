const createBaseEmbed = require("./createBaseEmbed");

const colors = require("./colors");

/**
 * Creates a reusable info embed.
 */

function createInfoEmbed({

    title = "Information",
    description = "No additional information provided.",

    fields = []

}) {

    return createBaseEmbed({

        color: colors.INFO,

        title: `ℹ️ ${title}`,

        description,

        fields
    });
}

module.exports = createInfoEmbed;