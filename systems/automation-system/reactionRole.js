async function handleAdd(reaction, user, config) {
  if (user.bot) return;

  const rr = config.reactionRoles?.find(
    r => r.messageId === reaction.message.id
  );
  if (!rr) return;

  const emoji = reaction.emoji.id
    ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  const match = rr.roles.find(r => r.emoji === emoji);
  if (!match) return;

  const member = await reaction.message.guild.members.fetch(user.id);

  // 🔥 LIMIT SYSTEM (pick 1)
  if (rr.limit === 1) {
    for (const r of rr.roles) {
      if (r.roleId !== match.roleId && member.roles.cache.has(r.roleId)) {
        await member.roles.remove(r.roleId);
      }
    }
  }

  // 🔥 TOGGLE SYSTEM
  if (member.roles.cache.has(match.roleId)) {
    await member.roles.remove(match.roleId);
  } else {
    await member.roles.add(match.roleId);
  }
}

async function handleRemove() {
  // ❌ do nothing (toggle already handled)
}

module.exports = { handleAdd, handleRemove };