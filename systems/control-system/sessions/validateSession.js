const getSession = require("./getSession");
const controlSessions = require("./controlSessions");

/**
 * Validate control-session existence and ownership for component and modal interactions.
 * Security modals carry an exact dashboard message ID. Legacy control modals are accepted
 * only when exactly one active session matches this user and server.
 */
async function validateSession(interaction) {
    const isModal = typeof interaction.isModalSubmit === "function" && interaction.isModalSubmit();
    const customIdParts = String(interaction.customId || "").split(":");
    const lastPart = isModal ? customIdParts[customIdParts.length - 1] : null;
    let messageId = interaction.message?.id || null;
    let session = messageId ? getSession(messageId) : null;

    if (isModal && !session && lastPart && /^\d{15,22}$/.test(lastPart)) {
        messageId = lastPart;
        session = getSession(messageId);
    }

    // Compatibility for older Control Centre modals that predate message-ID binding.
    if (isModal && !session) {
        const matches = [...controlSessions.entries()].filter(([, candidate]) =>
            candidate.ownerId === interaction.user.id &&
            candidate.guildId === interaction.guildId &&
            (!candidate.expiresAt || Date.now() <= candidate.expiresAt)
        );
        if (matches.length === 1) {
            [messageId, session] = matches[0];
        } else {
            await interaction.reply({
                content: matches.length > 1
                    ? "❌ Multiple Control Centre sessions are open. Close them and reopen .control before submitting this form."
                    : "❌ This control session could not be identified. Reopen .control and try again.",
                ephemeral: true
            });
            return false;
        }
    }

    if (!session) {
        await interaction.reply({ content: "❌ This control session no longer exists.", ephemeral: true });
        return false;
    }

    if (interaction.user.id !== session.ownerId) {
        await interaction.reply({ content: "❌ This control session belongs to another user.", ephemeral: true });
        return false;
    }

    if (interaction.guildId && interaction.guildId !== session.guildId) {
        await interaction.reply({ content: "❌ This control session belongs to another server.", ephemeral: true });
        return false;
    }

    if (session.expiresAt && Date.now() > session.expiresAt) {
        await interaction.reply({ content: "❌ This control session expired. Reopen .control and try again.", ephemeral: true });
        return false;
    }

    return true;
}

module.exports = validateSession;
