const Warning = require("../../database/models/Warning");

/**
 * @param {Object} options
 * @param {import('discord.js').GuildMember} options.moderator
 * @param {import('discord.js').GuildMember} options.target
 * @param {string} options.reason
 * @returns {Promise<{ success: boolean, warnings: Array }>}
 */
async function warnUser({ moderator, target, reason }) {
  try {
    // Save warning to DB
    await Warning.create({
      userId: target.id,
      guildId: guild.id,
      moderatorId: moderator.id,
      reason
    });

    // Fetch all warnings for that user
    const warnings = await Warning.find({ userId: target.id }).sort({ createdAt: 1 });

    return {
      success: true,
      warnings
    };
  } catch (error) {
    console.error("WarnUser Error:", error);

    return {
      success: false,
      warnings: [],
      error: "Failed to store warning"
    };
  }
}

module.exports = { warnUser };