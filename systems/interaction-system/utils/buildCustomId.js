/**
 * buildCustomId.js
 * Builds structured custom IDs for Discord interactions.
 *
 * Format:
 * system:type:action:data
 */

function buildCustomId({
    system,
    type,
    action,
    data = "none"
}) {
    return `${system}:${type}:${action}:${data}`;
}

module.exports = buildCustomId;