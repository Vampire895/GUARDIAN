const buttonRegistry = require(
    "../../../interaction-system/registry/buttonRegistry"
);

const renderHomePanel = require(
    "../../panels/homePanel"
);

/**
 * Home button
 */

async function execute(
    interaction
) {

    await renderHomePanel({
        interaction
    });
}

/**
 * Register
 */

buttonRegistry.set(

    "control:home:panel",

    execute
);

console.log(
    "[Control System] Home button loaded."
);