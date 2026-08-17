const Warning = require("../../database/models/Warning");

/**
 * Check escalation rules for a user
 *
 * @param {string} userId
 * @param {Object} config
 * @returns {Object|null}
 */
async function checkEscalation(userId, config) {
  // --- Disabled ---
  if (!config?.escalation?.enabled) return null;

  const rules = config.escalation.rules;
  if (!Array.isArray(rules) || rules.length === 0) return null;

  // --- Get warning count (optimized) ---
  const count = await Warning.countDocuments({ userId,  guildId: config.guildId || null });

  // --- Sort rules safely (no mutation of original array) ---
  const sortedRules = [...rules].sort((a, b) => b.count - a.count);

  // --- Find matching rule ---
  const rule = sortedRules.find(r => count >= r.count);
  if (!rule) return null;

  return {
    action: rule.action,
    count,
  };
}

module.exports = { checkEscalation };