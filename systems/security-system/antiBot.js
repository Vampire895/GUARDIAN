/**
 * antiBot.js
 * Detection only (no Discord actions here)
 */

function evaluate(member, config) {
  // Ignore humans
  if (!member.user.bot) return { triggered: false };

  if (!config?.enabled) return { triggered: false };

  return {
    triggered: true,
    botId: member.id,
  };
}

module.exports = { evaluate };