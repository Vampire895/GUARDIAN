const validateSession = require("./validateSession");
const refreshSession = require("./refreshSession");
const controlSessions = require("./controlSessions");

/**
 * Validate a control interaction and refresh its inactivity timer.
 * Modal submits don't include interaction.message, so resolve the bound session ID
 * or accept a unique legacy session for backward compatibility.
 */
async function handleSession(interaction) {
    const valid = await validateSession(interaction);
    if (!valid) return false;

    const isModal = typeof interaction.isModalSubmit === "function" && interaction.isModalSubmit();
    let messageId = interaction.message?.id || null;

    if (isModal) {
        const lastPart = String(interaction.customId || "").split(":").at(-1);
        if (lastPart && /^\d{15,22}$/.test(lastPart) && controlSessions.has(lastPart)) {
            messageId = lastPart;
        } else {
            const matches = [...controlSessions.entries()].filter(([, session]) =>
                session.ownerId === interaction.user.id &&
                session.guildId === interaction.guildId &&
                (!session.expiresAt || Date.now() <= session.expiresAt)
            );
            if (matches.length === 1) messageId = matches[0][0];
        }
    }

    if (!messageId) return false;
    refreshSession(messageId);
    return true;
}

module.exports = handleSession;
