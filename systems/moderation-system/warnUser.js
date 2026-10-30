
const Warning = require("../../database/models/Warning");

/**
 * @param {Object} options
 * @param {import('discord.js').GuildMember} options.moderator
 * @param {import('discord.js').GuildMember} options.target
 * @param {string} options.reason
 * @param {boolean} options.sendDM
 * @returns {Promise<{ success: boolean, warnings: Array, error?: string }>}
 */
async function warnUser({
  moderator,
  target,
  reason,
  sendDM = false
}) {
  try {
    // 1. Save warning in MongoDB first
    await Warning.create({
      userId: target.id,
      guildId: target.guild.id,
      moderatorId: moderator.id,
      reason
    });

    // 2. Fetch warnings for this user in this server
    const warnings = await Warning.find({
      userId: target.id,
      guildId: target.guild.id
    }).sort({ createdAt: 1 });

    // 3. Send DM only when explicitly requested
    if (sendDM) {
      try {
        await target.send({
          content:
            `⚠️ **Guardian — Automated Warning**\n\n` +
            `You have received a warning in **${target.guild.name}**.\n\n` +
            `**Reason:** ${reason}\n\n` +
            `Please avoid repeating this behaviour. Further violations may result in additional punishment.`
        });
      } catch (dmError) {
        // DM failure does not undo the MongoDB warning
        console.log(
          `[WarnUser] Could not DM ${target.user.tag}. Warning remains saved.`
        );
      }
    }

    return {
      success: true,
      warnings
    };

  } catch (error) {
    console.error("[WarnUser Error]", error);

    return {
      success: false,
      warnings: [],
      error: error.message
    };
  }
}

module.exports = { warnUser };
