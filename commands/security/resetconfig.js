const { PermissionsBitField } = require("discord.js");
const configService = require("../../systems/security-system/config");

module.exports = {
  name: "resetconfig",
  description: "Resets all configurations to default",

  async execute(message, args) {
    // 🔒 Permission Check (Administrator ONLY)
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You need Administrator permission to use this command.");
    }

    // ⚠️ Confirmation Required
    if (!args[0] || args[0].toLowerCase() !== "confirm") {
      return message.reply(
        "⚠️ This will reset ALL configurations to default.\n\nType:\n`!resetconfig confirm` to proceed."
      );
    }

    try {
      // Reset configuration
      await configService.resetToDefault(message.guildId);
      return message.reply("✅ All configurations have been reset to default.");
    } catch (error) {
      console.error("Error resetting config:", error);
      return message.reply("❌ An error occurred while resetting configurations.");
    }
  },
};
