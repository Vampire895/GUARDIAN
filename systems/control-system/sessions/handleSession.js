const validateSession = require("./validateSession");
const refreshSession = require("./refreshSession");

/**
 * Validate a control interaction and refresh its inactivity timer.
 * Modal submits don't include interaction.message, so use the dashboard message ID
 * encoded as the final segment of the modal custom ID.
 */
async function handleSession(interaction) {
    const valid = await validateSession(interaction);
    if (!valid) return false;

    const isModal = typeof interaction.isModalSubmit === "function" && interaction.isModalSubmit();
    const modalSessionId = isModal
        ? String(interaction.customId || "").split(":").at(-1)
        : null;
    const messageId = interaction.message?.id || modalSessionId;

    if (!messageId) return false;
    refreshSession(messageId);
    return true;
}

module.exports = handleSession;
