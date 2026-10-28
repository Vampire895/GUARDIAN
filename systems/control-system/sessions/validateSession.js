const getSession = require("./getSession");

/**
 * Validate control-session existence and ownership for component and modal interactions.
 * Modal submissions have no interaction.message, so their custom ID carries the dashboard message ID.
 */
async function validateSession(interaction) {
    const isModal = typeof interaction.isModalSubmit === "function" && interaction.isModalSubmit();
    const customIdParts = String(interaction.customId || "").split(":");
    const modalSessionId = isModal ? customIdParts[customIdParts.length - 1] : null;
    const messageId = interaction.message?.id || modalSessionId;

    // Do not accept an arbitrary final custom-ID segment as a session key.
    if (!messageId || !/^\d{15,22}$/.test(messageId)) {
        await interaction.reply({ content: "❌ This control session could not be identified. Reopen .control and try again.", ephemeral: true });
        return false;
    }

    const session = getSession(messageId);
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
