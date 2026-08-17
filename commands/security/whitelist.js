const { checkPermissions } = require("../../systems/permission-system");
const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "whitelist";
const description = "Manage security whitelist (users, roles, channels).";

async function execute(message, args) {
  const sub = args[0];
  const guildId = message.guild.id;

  const permCheck = checkPermissions({
    member: message.member,
    botMember: message.guild.members.me,
    requiredPermissions: ["ManageGuild"],
  });

  if (!permCheck.success) {
    return message.reply({
      embeds: [createErrorEmbed("Missing permissions.")]
    });
  }

  const config = await getConfig(guildId);

  // Ensure structure exists
  if (!config.whitelist) {
    config.whitelist = { users: [], roles: [], channels: [] };
  }

  // ADD
  if (sub === "add") {
    const user = message.mentions.users.first();
    const role = message.mentions.roles.first();
    const channel = message.mentions.channels.first();

    if (!user && !role && !channel) {
      return message.reply({
        embeds: [createErrorEmbed("Mention a user, role, or channel.")]
      });
    }

    if (user && !config.whitelist.users.includes(user.id)) {
      config.whitelist.users.push(user.id);
    }

    if (role && !config.whitelist.roles.includes(role.id)) {
      config.whitelist.roles.push(role.id);
    }

    if (channel && !config.whitelist.channels.includes(channel.id)) {
      config.whitelist.channels.push(channel.id);
    }

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Added to whitelist.")]
    });
  }

  // REMOVE
  if (sub === "remove") {
    const user = message.mentions.users.first();
    const role = message.mentions.roles.first();
    const channel = message.mentions.channels.first();

    if (!user && !role && !channel) {
      return message.reply({
        embeds: [createErrorEmbed("Mention a user, role, or channel.")]
      });
    }

    if (user) {
      config.whitelist.users =
        config.whitelist.users.filter(id => id !== user.id);
    }

    if (role) {
      config.whitelist.roles =
        config.whitelist.roles.filter(id => id !== role.id);
    }

    if (channel) {
      config.whitelist.channels =
        config.whitelist.channels.filter(id => id !== channel.id);
    }

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Removed from whitelist.")]
    });
  }

  // VIEW
  return message.reply({
    embeds: [
      createSuccessEmbed(
        `Whitelist Status:\n\nUsers: ${config.whitelist.users.length}\nRoles: ${config.whitelist.roles.length}\nChannels: ${config.whitelist.channels.length}`
      )
    ]
  });
}

module.exports = { name, description, execute };