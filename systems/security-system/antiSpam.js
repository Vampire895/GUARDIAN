/**
 * antiSpam.js
 * Location: systems/security-system/antiSpam.js
 *
 * Responsibility: Detection only.
 * - Tracks message frequency per user per guild using in-memory Maps
 * - Evaluates against config-based thresholds
 * - Returns a structured result object
 *
 * Does NOT: send messages, execute actions, build embeds, or reply to users.
 */

/**
 * Structure:
 * messageTracker = Map<guildId, Map<userId, { count: number, timer: NodeJS.Timeout }>>
 */
const messageTracker = new Map();

/**
 * Evaluates an incoming message against the spam config for the guild.
 *
 * @param {import('discord.js').Message} message
 * @param {Object} config
 * @param {boolean} config.enabled
 * @param {number}  config.maxMessages
 * @param {number}  config.interval
 * @param {string}  config.action  // 'warn' | 'timeout' | 'kick'
 * @param {Object}  config.whitelist
 * @param {string[]} config.whitelist.users
 * @param {string[]} config.whitelist.roles
 *
 * @returns {{ triggered: boolean, action: string|null, userId: string|null }}
 */
function evaluate(message, config) {
  // --- Guard: ignore DMs ---
  if (!message.guild) {
    return { triggered: false, action: null, userId: null };
  }

  // --- Guard: module disabled ---
  if (!config?.enabled) {
    return { triggered: false, action: null, userId: null };
  }

  // --- Guard: ignore bots ---
  if (message.author.bot) {
    return { triggered: false, action: null, userId: null };
  }

  const guildId = message.guild.id;
  const userId = message.author.id;

  // --- Guard: whitelist (users + roles) ---
  if (
    config.whitelist?.users?.includes(userId) ||
    message.member?.roles?.cache?.some(role =>
      config.whitelist?.roles?.includes(role.id)
    )
  ) {
    return { triggered: false, action: null, userId: null };
  }

  // --- Ensure guild-level tracker exists ---
  if (!messageTracker.has(guildId)) {
    messageTracker.set(guildId, new Map());
  }

  const guildTracker = messageTracker.get(guildId);

  // --- Ensure user-level tracker exists ---
  if (!guildTracker.has(userId)) {
    guildTracker.set(userId, { count: 0, timer: null });
  }

  const userRecord = guildTracker.get(userId);

  // --- Increment message count ---
  userRecord.count += 1;

  // --- Safe interval fallback ---
  const interval = config.interval || 5000;

  // --- Start interval reset timer on first message ---
  if (userRecord.count === 1) {
    userRecord.timer = setTimeout(() => {
      guildTracker.delete(userId);

      // Cleanup empty guild map
      if (guildTracker.size === 0) {
        messageTracker.delete(guildId);
      }
    }, interval);
  }

  // --- Evaluate threshold ---
  if (userRecord.count >= (config.maxMessages || 5)) {
    clearTimeout(userRecord.timer);
    guildTracker.delete(userId);

    // Cleanup empty guild map
    if (guildTracker.size === 0) {
      messageTracker.delete(guildId);
    }

    return {
      triggered: true,
      action: config.action || "warn",
      userId,
    };
  }

  return { triggered: false, action: null, userId: null };
}

/**
 * Clears all tracking data for a specific guild.
 */
function clearGuild(guildId) {
  if (messageTracker.has(guildId)) {
    const guildTracker = messageTracker.get(guildId);

    for (const record of guildTracker.values()) {
      clearTimeout(record.timer);
    }

    messageTracker.delete(guildId);
  }
}

/**
 * Clears tracking data for a specific user.
 */
function clearUser(guildId, userId) {
  if (messageTracker.has(guildId)) {
    const guildTracker = messageTracker.get(guildId);

    if (guildTracker.has(userId)) {
      clearTimeout(guildTracker.get(userId).timer);
      guildTracker.delete(userId);

      if (guildTracker.size === 0) {
        messageTracker.delete(guildId);
      }
    }
  }
}

module.exports = { evaluate, clearGuild, clearUser };