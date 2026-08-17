// systems/moderation-system/banUser.js

/**
 * @param {Object} options
 * @param {import('discord.js').GuildMember} options.moderator
 * @param {import('discord.js').GuildMember} options.target
 * @param {string} options.reason
 * @param {import('discord.js').Guild} options.guild
 * @returns {Promise<{ success: boolean, error: string | null }>}
 */
async function banUser({ moderator, target, reason, guild }) {
  if (!target) {
    return { success: false, error: "Target member does not exist." };
  }

  if (target.id === moderator.id) {
    return { success: false, error: "You cannot ban yourself." };
  }

  if (target.user.bot) {
    return { success: false, error: "You cannot ban a bot." };
  }

  await target.ban({ reason });

  return { success: true, error: null };
}

module.exports = { banUser };