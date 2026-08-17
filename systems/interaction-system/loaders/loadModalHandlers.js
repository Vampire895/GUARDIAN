const fs = require("fs");
const path = require("path");

const modalRegistry = require("../registry/modalRegistry");

/**
 * Automatically loads all modal handlers.
 */

function loadModalHandlers() {

    const handlersPath = path.join(
        __dirname,
        "../handlers/modals"
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
                `[Modal Handler] Missing customId in ${file}`
            );
            continue;
        }

        modalRegistry.set(
            handler.customId,
            handler.execute
        );

        console.log(
            `[Modal Handler Loaded] ${handler.customId}`
        );
    }
}

module.exports = loadModalHandlers;