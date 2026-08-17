const createInfoEmbed = require("../../../ui/embeds/createInfoEmbed");

const createPrimaryButton = require("../../../ui/buttons/createPrimaryButton");

const createActionRow = require("../../../ui/actionRows/createActionRow");

const logCategories = require("../utils/logCategories");

/**
 * Builds log setup panel.
 */

function buildLogSetupPanel() {

    const embed = createInfoEmbed({

        title: "Logging Setup",

        description:
            "Configure Guardian logging categories below."
    });

    const buttons = logCategories.map(category => {

        return createPrimaryButton({

            customId:
                `logs:button:${category}`,

            label:
                category.charAt(0).toUpperCase()
                + category.slice(1)
        });
    });

    /**
     * Split buttons into rows
     */
    const rows = [];

    for (let i = 0; i < buttons.length; i += 5) {

        rows.push(
            createActionRow(
                buttons.slice(i, i + 5)
            )
        );
    }

    return {
        embeds: [embed],
        components: rows
    };
}

module.exports = buildLogSetupPanel;