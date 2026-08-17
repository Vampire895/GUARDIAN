// systems/permission-system/index.js

/**
 * Checks whether a guild member and the bot have the required Discord permissions.
 *
 * @param {Object} options
 * @param {import('discord.js').GuildMember} options.member - The guild member to check.
 * @param {string[]} options.requiredPermissions - Array of Discord permission flag strings.
 * @param {import('discord.js').GuildMember} options.botMember - The bot's guild member instance.
 * @returns {{ success: boolean, error: null | { type: string, missing: string[] } }}
 */
function checkPermissions({ member, requiredPermissions, botMember }) {
  if (!member || !botMember || !Array.isArray(requiredPermissions)) {
    throw new TypeError(
      "checkPermissions requires: member (GuildMember), botMember (GuildMember), and requiredPermissions (string[])."
    );
  }

  const userMissing = requiredPermissions.filter(
    (perm) => !member.permissions.has(perm)
  );

  if (userMissing.length > 0) {
    return {
      success: false,
      error: {
        type: "USER_MISSING_PERMISSIONS",
        missing: userMissing,
      },
    };
  }

  const botMissing = requiredPermissions.filter(
    (perm) => !botMember.permissions.has(perm)
  );

  if (botMissing.length > 0) {
    return {
      success: false,
      error: {
        type: "BOT_MISSING_PERMISSIONS",
        missing: botMissing,
      },
    };
  }

  return {
    success: true,
    error: null,
  };
}

module.exports = { checkPermissions };