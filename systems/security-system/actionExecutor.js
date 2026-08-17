/**
 * actionExecutor.js
 * Executes moderation actions
 */

const { warnUser } = require("../moderation-system/warnUser");
const { checkEscalation } = require("./escalation");
const { getConfig } = require("./config");

/**
 * Execute action
 */
async function execute({ action, userId, guild, reason = "Auto moderation" }) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
      return { success: false, error: "Member not found" };
    }

    // =========================
    // 🔥 WARN
    // =========================
    if (action === "warn") {
      warnUser({
        moderator: guild.members.me,
        target: member,
        reason,
      });

      

      // 🔥 CHECK ESCALATION
      const config = await getConfig(guild.id);
      const escalation = await checkEscalation(userId, config);

      if (escalation) {
        // TIMEOUT
        if (escalation.action === "timeout") {
          if (!member.moderatable) return;
          await member.timeout(5 * 60 * 1000, "Escalation punishment");
        }

        // KICK
        if (escalation.action === "kick") {
            if (!member.kickable) return;
          await member.kick("Escalation punishment");
        }
      }

      return { success: true };
    }

    // =========================
    // 🔥 TIMEOUT
    // =========================
    if (action === "timeout") {
        if (!member.moderatable) return;
      await member.timeout(5 * 60 * 1000, reason);
      return { success: true };
    }

    // =========================
    // 🔥 KICK
    // =========================
    if (action === "kick") {
        if (!member.kickable) return;
      await member.kick(reason);
      return { success: true };
    }

    return { success: false, error: "Invalid action type" };
  } catch (err) {
    console.error("[ACTION EXECUTOR ERROR]", err);
    return { success: false, error: err.message };
  }
}

module.exports = { execute };