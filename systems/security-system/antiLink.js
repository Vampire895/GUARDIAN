/**
 * antiLink.js
 * Detection only
 */

const urlRegex = /(https?:\/\/[^\s]+)/gi;

function evaluate(message, config) {
  if (!message.guild) return { triggered: false };
  if (!config?.enabled) return { triggered: false };
  if (message.author.bot) return { triggered: false };

  const content = message.content;

  const links = content.match(urlRegex);
  if (!links) return { triggered: false };

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

  // Check allowed domains
  const blocked = links.some(link => {
    return !config.allowedDomains.some(domain =>
      link.includes(domain)
    );
  });

  if (!blocked) return { triggered: false };

  return {
    triggered: true,
    action: config.action || "timeout",
    userId
  };
}

module.exports = { evaluate };