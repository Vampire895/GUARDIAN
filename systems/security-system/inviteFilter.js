/**
 * inviteFilter.js
 * Detects Discord invite links specifically
 */

const inviteRegex = /(discord\.gg\/|discord\.com\/invite\/)/i;

function evaluate(message, config) {
  if (!message.guild) return { triggered: false };
  if (!config?.enabled) return { triggered: false };
  if (message.author.bot) return { triggered: false };

  const content = message.content;

  if (!inviteRegex.test(content)) {
    return { triggered: false };
  }

  const userId = message.author.id;

  // Whitelist
  if (
    config.whitelist?.users?.includes(userId) ||
    message.member.roles.cache.some(role =>
      config.whitelist?.roles?.includes(role.id)
    )
  ) {
    return { triggered: false };
  }

  return {
    triggered: true,
    action: config.action || "timeout",
    userId
  };
}

module.exports = { evaluate };