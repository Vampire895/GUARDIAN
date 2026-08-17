/**
 * autoresponder.js
 * Handles keyword-based auto responses
 */

function checkMatch(content, trigger, type) {
  const msg = content.toLowerCase();
  const trg = trigger.toLowerCase();

  switch (type) {
    case "exact":
      return msg === trg;

    case "startsWith":
      return msg.startsWith(trg);

    case "endsWith":
      return msg.endsWith(trg);

    case "contains":
    default:
      return msg.includes(trg);
  }
}

function evaluate(message, config) {
  if (!config?.enabled) return null;
  if (!config.responses?.length) return null;

  const content = message.content;

  for (const rule of config.responses) {
    if (!rule.trigger || !rule.reply) continue;

    if (checkMatch(content, rule.trigger, rule.matchType)) {
      return {
        reply: rule.reply
      };
    }
  }

  return null;
}

module.exports = { evaluate };