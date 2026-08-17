const { EmbedBuilder } = require("discord.js");

function replaceVars(text, member) {
  if (!text) return text;

  return text
    .replace(/{user}/g, `${member.user.tag}`)
    .replace(/{server}/g, member.guild.name);
}

async function send(member, config) {
  if (!config?.enabled) return;
  if (!config.channelId) return;

  const channel = member.guild.channels.cache.get(config.channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(replaceVars(config.embed.title, member))
    .setDescription(replaceVars(config.embed.description, member))
    .setColor(config.embed.color || "#ED4245");

  if (config.embed.thumbnail) {
    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
  }

  if (config.embed.image) {
    embed.setImage(config.embed.image);
  }

  await channel.send({ embeds: [embed] });
}

module.exports = { send };