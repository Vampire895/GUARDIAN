module.exports = {
    name: "logsetup",
    description: "Directs administrators to the Logging Center.",

    async execute(message) {
        return message.reply({
            content: "📜 Logging is now managed from `.control` → **Logging**. Use that panel to configure command logging."
        });
    }
};
