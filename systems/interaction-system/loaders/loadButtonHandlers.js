const fs = require("fs");
const path = require("path");

const buttonRegistry = require("../registry/buttonRegistry");

/**
 * Automatically loads all button handlers.
 */

function loadButtonHandlers() {

    const handlersPath = path.join(
        __dirname,
        "../handlers/buttons"
    );

    const files = fs
        .readdirSync(handlersPath)
        .filter(file => file.endsWith(".js"));

    for (const file of files) {

        const handler = require(
            path.join(handlersPath, file)
        );

        if (!handler.customId) {
            console.warn(
                `[Button Handler] Missing customId in ${file}`
            );
            continue;
        }

        buttonRegistry.set(
            handler.customId,
            handler.execute
        );

        console.log(
            `[Button Handler Loaded] ${handler.customId}`
        );
    }
}

module.exports = loadButtonHandlers;