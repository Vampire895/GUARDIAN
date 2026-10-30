
const SecurityConfig = require("../../database/models/SecurityConfig");
const defaultConfig = require("./defaultSecurityConfig");

const whitelistModules = [
  "antiSpam",
  "antiLink",
  "inviteFilter",
  "antiRaid",
  "antiBot"
];

async function getConfig(guildId) {
  let config = await SecurityConfig.findOne({ guildId });

  if (!config) {
    return await SecurityConfig.create({
      guildId,
      ...defaultConfig
    });
  }

  let needsUpdate = false;

  // Ensure top-level defaults
  for (const key in defaultConfig) {
    if (config[key] === undefined || config[key] === null) {
      config[key] = defaultConfig[key];
      needsUpdate = true;
    }
  }

  // Ensure legacy global whitelist
  if (!config.whitelist) {
    config.whitelist = {};
    needsUpdate = true;
  }

  for (const key of ["users", "roles", "channels"]) {
    if (!Array.isArray(config.whitelist[key])) {
      config.whitelist[key] = [];
      needsUpdate = true;
    }
  }

  // Ensure dashboard per-module whitelist
  for (const module of whitelistModules) {
    if (!config.whitelist[module]) {
      config.whitelist[module] = {
        users: [],
        roles: []
      };
      needsUpdate = true;
    }

    for (const type of ["users", "roles"]) {
      if (!Array.isArray(config.whitelist[module][type])) {
        config.whitelist[module][type] = [];
        needsUpdate = true;
      }
    }
  }

  if (needsUpdate) {
    await config.save();
  }

  return config;
}

async function updateConfig(guildId, data) {
  return await SecurityConfig.findOneAndUpdate(
    { guildId },
    { $set: data },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );
}

async function resetConfig(guildId) {
  return await SecurityConfig.findOneAndUpdate(
    { guildId },
    {
      $set: {
        ...defaultConfig,
        guildId
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );
}

module.exports = {
  getConfig,
  updateConfig,
  resetConfig
};
