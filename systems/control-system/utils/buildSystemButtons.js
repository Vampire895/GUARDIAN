const panelRegistry = require(
    "../registry/panelRegistry"
);

const createPrimaryButton = require(
    "../../../ui/buttons/createPrimaryButton"
);

const createActionRow = require(
    "../../../ui/actionRows/createActionRow"
);

/**
 * Build dynamic system buttons
 */

function buildSystemButtons() {

    const buttons = [];

    /**
     * Build buttons dynamically
     */
    for (const [id, panel] of panelRegistry) {

        buttons.push(

            createPrimaryButton({

                customId:
                    `control:panel:${id}`,

                label:
                    `${panel.emoji} ${panel.label}`
            })
        );
    }

    /**
     * Split rows
     */
    const rows = [];

    for (let i = 0; i < buttons.length; i += 5) {

        rows.push(

            createActionRow(
                buttons.slice(i, i + 5)
            )
        );
    }

    return rows;
}

module.exports =
    buildSystemButtons;