/**
 * interaction-system/index.js
 * Registers centralized interaction handling.
 */

const interactionRouter = require("./interactionRouter");

const loadButtonHandlers = require("./loaders/loadButtonHandlers");
const loadSelectMenuHandlers = require("./loaders/loadSelectMenuHandlers");
const loadModalHandlers = require("./loaders/loadModalHandlers");

module.exports = (client) => {

    /**
     * Load handlers
     */
    loadButtonHandlers();
    loadSelectMenuHandlers();
    loadModalHandlers();

    /**
     * Interaction listener
     */
    client.on("interactionCreate", async (interaction) => {

        if (interaction.isChatInputCommand()) return;

        await interactionRouter(interaction);
    });

    console.log("[Interaction System] Loaded.");
};