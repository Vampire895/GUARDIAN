
/**
 * actionExecutor.js
 * Executes automated moderation actions
 */

const { warnUser } = require("../moderation-system/warnUser");
const { checkEscalation } = require("./escalation");
const { getConfig } = require("./config");

/**
 * Execute automated moderation action
 */
async function execute({
  action,
  userId,
  guild,
  reason = "Auto moderation"
}) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
      return {
        success: false,
        error: "Member not found"
      };
    }

    // =========================
    // WARN
    // =========================
    if (action === "warn") {
      const warnResult = await warnUser({
        moderator: guild.members.me,
        target: member,
        reason,
        sendDM: true
      });

      // Stop if warning could not be saved
      if (!warnResult.success) {
        return {
          success: false,
          error: warnResult.error || "Failed to issue warning"
        };
      }

      // Check escalation only after warning is saved
      const config = await getConfig(guild.id);
      const escalation = await checkEscalation(userId, config);

      if (escalation) {
        if (escalation.action === "timeout") {
          if (!member.moderatable) {
            return {
              success: false,
              error: "Cannot timeout member due to permissions or role hierarchy"
            };
          }

          await member.timeout(
            5 * 60 * 1000,
            "Escalation punishment"
          );
        }

        if (escalation.action === "kick") {
          if (!member.kickable) {
            return {
              success: false,
              error: "Cannot kick member due to permissions or role hierarchy"
            };
          }

          await member.kick("Escalation punishment");
        }
      }

      return {
        success: true
      };
    }

    // =========================
    // TIMEOUT
    // =========================
    if (action === "timeout") {
      if (!member.moderatable) {
        return {
          success: false,
          error: "Cannot timeout member due to permissions or role hierarchy"
        };
      }

      await member.timeout(5 * 60 * 1000, reason);

      return {
        success: true
      };
    }

    // =========================
    // KICK
    // =========================
    if (action === "kick") {
      if (!member.kickable) {
        return {
          success: false,
          error: "Cannot kick member due to permissions or role hierarchy"
        };
      }

      await member.kick(reason);

      return {
        success: true
      };
    }

    return {
      success: false,
      error: "Invalid action type"
    };

  } catch (err) {
    console.error("[ACTION EXECUTOR ERROR]", err);

    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { execute };
