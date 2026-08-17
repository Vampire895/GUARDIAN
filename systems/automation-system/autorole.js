/**
 * autorole.js
 * Assigns roles on member join
 */

async function assign(member, config) {
  if (!config?.enabled) return;

  if (!config.roles || config.roles.length === 0) return;

  for (const roleId of config.roles) {
    const role = member.guild.roles.cache.get(roleId);
    if (!role) continue;

    try {
      await member.roles.add(role);
    } catch (err) {
      console.error(`[AUTOROLE ERROR] ${err.message}`);
    }
  }
}

module.exports = { assign };