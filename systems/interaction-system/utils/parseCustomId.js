/**
 * parseCustomId.js
 * Parses structured interaction custom IDs.
 *
 * Format:
 * system:type:action:data
 */

function parseCustomId(customId) {
    const parts = customId.split(":");

    return {
        system: parts[0] || null,
        type: parts[1] || null,
        action: parts[2] || null,
        data: parts.slice(3).join(":") || null
    };
}

module.exports = parseCustomId;