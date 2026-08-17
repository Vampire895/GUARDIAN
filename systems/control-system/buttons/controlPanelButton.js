const buttonRegistry = require(
    "../../interaction-system/registry/buttonRegistry"
);

const panelRegistry = require(
    "../registry/panelRegistry"
);

/**
 * Dynamic control panel handler
 */

async function execute(
    interaction,
    parsed
) {

    const panelId =
        parsed.action;

    /**
     * Resolve panel
     */
    const panel =
        panelRegistry.get(
            panelId
        );

    /**
     * Invalid panel
     */
    if (!panel) {
        return;
    }

    /**
     * Missing render function
     */
    if (!panel.render) {
        return;
    }

    /**
     * Delegate rendering
     */
    await panel.render({

        interaction
    });
}

/**
 * Dynamic registrations
 */

for (const [id] of panelRegistry) {

    buttonRegistry.set(

        `control:panel:${id}`,

        execute
    );
}

console.log(
    "[Control System] Panel buttons loaded."
);