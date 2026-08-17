const createBaseEmbed = require("./createBaseEmbed");

const colors = require("./colors");

/**
 * Creates a reusable success embed.
 */

function createSuccessEmbed({

    title = "Success",
    description = "Operation completed successfully.",

    fields = []

}) {

    return createBaseEmbed({

        color: colors.SUCCESS,

        title: `✅ ${title}`,

        description,

        fields
    });
}

module.exports = createSuccessEmbed;