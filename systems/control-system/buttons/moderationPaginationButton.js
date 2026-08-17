const buttonRegistry = require(
    "../../interaction-system/registry/buttonRegistry"
);

const renderModerationPanel = require(
    "../panels/renderModerationPanel"
);

/**
 * Pagination handler
 */

async function execute(
    interaction,
    parsed
) {

    const page =
        Number(parsed.data);

    await renderModerationPanel({

        interaction,

        page
    });
}

/**
 * Register handlers
 */

buttonRegistry.set(
    "control:page:moderation",
    execute
);

console.log(
    "[Control System] Moderation pagination loaded."
);