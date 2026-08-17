const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

module.exports = {
  name: "autoresponderadd",

  async execute(message, args) {
    const config = await getConfig(message.guild.id);

    const [trigger, type, ...replyArr] = args;
    const reply = replyArr.join(" ");

    const validTypes = ["exact", "contains", "startsWith", "endsWith"];

    if (!trigger || !reply || !validTypes.includes(type)) {
      return message.reply({
        embeds: [createErrorEmbed("Usage: .autoresponderadd <trigger> <type> <reply>")]
      });
    }

    config.autoresponder.responses.push({
      trigger,
      reply,
      matchType: type
    });

    config.autoresponder.enabled = true;

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Auto response added.")]
    });
  }
};