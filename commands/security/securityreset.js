const { PermissionsBitField } = require("discord.js");
const configService = require("../../systems/security-system/config");

module.exports = {
  name: "securityreset",
  description: "Resets all security configurations to default",

  async execute(message, args) {
    // 🔒 Permission Check (Administrator ONLY)
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You need Administrator permission to use this command.");
    }

    // ⚠️ Confirmation Required
    if (!args[0] || args[0].toLowerCase() !== "confirm") {
      return message.reply(
        "⚠️ This will reset ALL security settings.\n\nType:\n`!securityreset confirm` to proceed."
      );
    }

    try {
      await configService.resetConfig(message.guild.id);

      return message.reply("✅ Security configuration has been reset to default.");
    } catch (error) {
      console.error("Security Reset Command Error:", error);
      return message.reply("❌ Failed to reset security configuration.");
    }
  },
};