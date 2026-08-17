/**
 * antiRaid.js
 * Tracks joins and detects raid behavior
 */

const joinTracker = new Map();

/**
 * @param {GuildMember} member
 * @param {Object} config
 */
function evaluate(member, config) {
  if (!config?.enabled) return { triggered: false };

  const guildId = member.guild.id;

  if (!joinTracker.has(guildId)) {
    joinTracker.set(guildId, []);
  }

  const now = Date.now();
  const joins = joinTracker.get(guildId);

  joins.push(now);

  // Remove old joins
  const filtered = joins.filter(time => now - time <= config.interval);
  joinTracker.set(guildId, filtered);

  if (filtered.length >= config.joinThreshold) {
    return {
      triggered: true,
      action: config.action,
      members: filtered.length,
    };
  }

  return { triggered: false };
}

module.exports = { evaluate };