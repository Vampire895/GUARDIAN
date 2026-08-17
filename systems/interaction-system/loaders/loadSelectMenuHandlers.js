const fs = require("fs");
const path = require("path");

const selectMenuRegistry = require("../registry/selectMenuRegistry");

/**
 * Automatically loads all select menu handlers.
 */

function loadSelectMenuHandlers() {

    const handlersPath = path.join(
        __dirname,
        "../handlers/selectMenus"
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
                `[Select Menu Handler] Missing customId in ${file}`
            );
            continue;
        }

        selectMenuRegistry.set(
            handler.customId,
            handler.execute
        );

        console.log(
            `[Select Menu Handler Loaded] ${handler.customId}`
        );
    }
}

module.exports = loadSelectMenuHandlers;