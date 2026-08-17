const { getConfig } = require("../../systems/security-system/config");

function findTargetMessage(message, args, config) {
  // 1. Reply
  if (message.reference) {
    return message.channel.messages.fetch(message.reference.messageId);
  }

  // 2. Last RR in channel
  const rr = config.reactionRoles
    ?.filter(r => r.channelId === message.channel.id)
    .slice(-1)[0];

  if (rr) {
    return message.channel.messages.fetch(rr.messageId);
  }

  // 3. Fallback ID
  if (args[0] && /^\d+$/.test(args[0])) {
    return message.channel.messages.fetch(args[0]);
  }

  return null;
}

async function updateEmbed(msg, rr, guild) {
  const lines = [];

  for (const r of rr.roles) {
    const role = guild.roles.cache.get(r.roleId);
    if (!role) continue;

    lines.push(`${r.emoji} → ${role.name}`);
  }

  await msg.edit({
    embeds: [{
      title: "🎯 Choose Your Roles",
      description: lines.join("\n") || "No roles configured.",
      color: 0x5865F2
    }],
    content: null
  });
}

module.exports = {
  name: "rr",
  aliases: ["reactionrole"],

  async execute(message, args) {
    const sub = args[0];
    const config = await getConfig(message.guild.id);

    if (!config.reactionRoles) config.reactionRoles = [];

    // =====================
    // CREATE
    // =====================
    if (sub === "create") {
      const msg = await message.channel.send({
        embeds: [{
          title: "🎯 Choose Your Roles",
          description: "No roles configured.",
          color: 0x5865F2
        }]
      });

      config.reactionRoles.push({
        messageId: msg.id,
        channelId: msg.channel.id,
        limit: 0,
        roles: []
      });

      await config.save();

      return message.reply(`✅ RR created`);
    }

    // =====================
    // ADD
    // =====================
    if (sub === "add") {
      const emoji = args[1];
      const role = message.mentions.roles.first();

      if (!emoji || !role) {
        return message.reply("Usage: .rr add 😄 @role");
      }

      const msg = await findTargetMessage(message, args.slice(1), config);
      if (!msg) return message.reply("❌ No RR message found.");

      const rr = config.reactionRoles.find(r => r.messageId === msg.id);
      if (!rr) return message.reply("❌ Not a RR panel.");

      if (rr.roles.some(r => r.emoji === emoji)) {
        return message.reply("❌ Emoji already used.");
      }

      rr.roles.push({ emoji, roleId: role.id });

      await config.save();

      const fresh = await getConfig(message.guild.id);
      const freshRR = fresh.reactionRoles.find(r => r.messageId === msg.id);

      await msg.react(emoji);
      await updateEmbed(msg, freshRR, message.guild);

      return message.reply(`✅ Added ${emoji} → ${role.name}`);
    }

    // =====================
    // REMOVE
    // =====================
    if (sub === "remove") {
      const emoji = args[1];

      const msg = await findTargetMessage(message, args.slice(1), config);
      if (!msg) return message.reply("❌ No RR message found.");

      const rr = config.reactionRoles.find(r => r.messageId === msg.id);
      if (!rr) return message.reply("❌ Not a RR panel.");

      rr.roles = rr.roles.filter(r => r.emoji !== emoji);

      await config.save();

      const fresh = await getConfig(message.guild.id);
      const freshRR = fresh.reactionRoles.find(r => r.messageId === msg.id);

      await msg.reactions.resolve(emoji)?.remove();
      await updateEmbed(msg, freshRR, message.guild);

      return message.reply(`✅ Removed ${emoji}`);
    }

    // =====================
    // LIMIT
    // =====================
    if (sub === "limit") {
      const value = parseInt(args[1]);

      const msg = await findTargetMessage(message, args.slice(1), config);
      if (!msg) return message.reply("❌ No RR message found.");

      const rr = config.reactionRoles.find(r => r.messageId === msg.id);

      rr.limit = value;

      await config.save();

      return message.reply(`✅ Limit set to ${value}`);
    }

    // =====================
    // DELETE
    // =====================
    if (sub === "delete") {
      const msg = await findTargetMessage(message, args.slice(1), config);
      if (!msg) return message.reply("❌ No RR message found.");

      config.reactionRoles =
        config.reactionRoles.filter(r => r.messageId !== msg.id);

      await config.save();

      return message.reply("✅ RR deleted");
    }

    return message.reply("Usage: .rr create | add | remove | limit | delete");
  }
};