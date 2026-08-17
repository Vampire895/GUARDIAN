const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed } = require("../../ui/embeds");

module.exports = {
  name: "autoresponderview",

  async execute(message) {
    const config = await getConfig(message.guild.id);

    const list = config.autoresponder.responses
      .map(r => `${r.trigger} → (${r.matchType})`)
      .join("\n") || "No responses set.";

    return message.reply({
      embeds: [createSuccessEmbed(list)]
    });
  }
};
