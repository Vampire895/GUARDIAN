/**
 * Load the Logging Center interaction handlers.
 * Legacy category handlers are intentionally not registered: logging now
 * uses one staged type/channel configuration saved only by an explicit Save.
 */
require("./handlers/loggingControls");

console.log("[Logging System] Loaded.");
