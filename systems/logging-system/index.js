/**
 * Load the Logging Center interaction handlers.
 * Legacy category handlers are intentionally not registered. The active
 * Logging Center stages one category/channel pair, then saves only that route.
 */
require("./handlers/loggingControls");

console.log("[Logging System] Loaded.");
