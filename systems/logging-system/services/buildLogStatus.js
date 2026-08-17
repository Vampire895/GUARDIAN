/**
 * Builds human-readable logging status.
 */

function buildLogStatus(config) {

    return config.enabled
        ? "🟢 Enabled"
        : "🔴 Disabled";
}

module.exports = buildLogStatus;