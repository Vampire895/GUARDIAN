const createBaseEmbed = require("./createBaseEmbed");

const colors = require("./colors");

/**
 * Creates a reusable warning embed.
 */

function createWarningEmbed({

    title = "Warning",
    description = "Please review this warning.",

    fields = []

}) {

    return createBaseEmbed({

        color: colors.WARNING,

        title: `⚠️ ${title}`,

        description,

        fields
    });
}

module.exports = createWarningEmbed;