const createBaseEmbed = require("./createBaseEmbed");

const colors = require("./colors");

/**
 * Creates a reusable error embed.
 */

function createErrorEmbed({

    title = "Error",
    description = "An unexpected error occurred.",

    fields = []

}) {

    return createBaseEmbed({

        color: colors.ERROR,

        title: `❌ ${title}`,

        description,

        fields
    });
}

module.exports = createErrorEmbed;