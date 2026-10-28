/**
 * antiRaid.js
 * Tracks a rolling cohort of joins and emits one enforcement event per burst window.
 */

const joinTracker = new Map();
const lastTriggeredAt = new Map();

function isWhitelisted(member, config) {
  return config?.whitelist?.users?.includes(member.id) || member.roles?.cache?.some(role => config?.whitelist?.roles?.includes(role.id));
}

function evaluate(member, config) {
  if (!config?.enabled || !member?.guild) return { triggered: false };
  if (isWhitelisted(member, config)) return { triggered: false, ignored: true };
  const guildId = member.guild.id;
  const now = Date.now();
  const interval = Number.isFinite(Number(config.interval)) && Number(config.interval) >= 1000 ? Number(config.interval) : 10000;
  const threshold = Number.isInteger(Number(config.joinThreshold)) && Number(config.joinThreshold) >= 2 ? Number(config.joinThreshold) : 5;
  if (!joinTracker.has(guildId)) joinTracker.set(guildId, []);
  const current = joinTracker.get(guildId).filter(join => now - join.at <= interval);
  current.push({ id: member.id, at: now });
  joinTracker.set(guildId, current);
  const last = lastTriggeredAt.get(guildId) || 0;
  if (current.length < threshold || now - last < interval) return { triggered: false, count: current.length };
  lastTriggeredAt.set(guildId, now);
  return { triggered: true, action: config.action === "timeout" ? "timeout" : "kick", members: current.map(join => join.id), count: current.length, interval };
}

function clearGuild(guildId) { joinTracker.delete(guildId); lastTriggeredAt.delete(guildId); }
module.exports = { evaluate, clearGuild };
