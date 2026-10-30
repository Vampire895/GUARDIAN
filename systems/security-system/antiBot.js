
/**
 * antiBot.js
 * Detection only (no Discord actions here)
 *
 * Checks whether the human who added a bot is:
 * 1. Below Aegis's highest role.
 * 2. Not whitelisted under Anti-Bot.
 */

function evaluate({ member, config, executor, aegisMember }) {
  // Ignore human members
  if (!member?.user?.bot) {
    return { triggered: false };
  }

  if (!config?.enabled) {
    return { triggered: false };
  }

  // Cannot verify the inviter or role hierarchy
  if (!executor || !aegisMember) {
    return { triggered: false };
  }

  // Compare the inviter's highest role with Aegis's highest role.
  // Administrator permission does not bypass this comparison.
  const roleComparison = executor.roles.highest.comparePositionTo(
    aegisMember.roles.highest
  );

  // Members at or above Aegis are exempt.
  if (roleComparison >= 0) {
    return { triggered: false };
  }

  // Check the dashboard's Anti-Bot whitelist.
  const whitelist = config.whitelist;

  const isWhitelisted =
    whitelist?.users?.includes(executor.id) ||
    whitelist?.roles?.some(roleId =>
      executor.roles.cache.has(roleId)
    );

  if (isWhitelisted) {
    return { triggered: false };
  }

  return {
    triggered: true,
    botId: member.id,
    executorId: executor.id,
    action: "kick"
  };
}

module.exports = { evaluate };
