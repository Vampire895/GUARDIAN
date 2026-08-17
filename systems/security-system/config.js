const SecurityConfig = require("../../database/models/SecurityConfig");
const defaultConfig = require("./defaultSecurityConfig");

/**
 * Get config (ensures defaults exist)
 */
async function getConfig(guildId) {
  let config = await SecurityConfig.findOne({ guildId });

  // If no config → create with defaults
  if (!config) {
    config = await SecurityConfig.create({
      guildId,
      ...defaultConfig,
    });
    return config;
  }

  // Ensure missing fields are added (future-proofing)
  let needsUpdate = false;

  for (const key in defaultConfig) {
    if (config[key] === undefined) {
      config[key] = defaultConfig[key];
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    await config.save();
  }

  return config;
}

/**
 * Update config
 */
async function updateConfig(guildId, data) {
  return await SecurityConfig.findOneAndUpdate(
    { guildId },
    data,
    { new: true, upsert: true }
  );
}

/**
 * Reset config to default
 */
async function resetConfig(guildId) {
  return await SecurityConfig.findOneAndUpdate(
    { guildId },
    {
      guildId,
      ...defaultConfig,
    },
    { new: true, upsert: true }
  );
}

module.exports = {
  getConfig,
  updateConfig,
  resetConfig,
};