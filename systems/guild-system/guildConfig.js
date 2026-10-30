
const GuildConfig = require("../../database/models/GuildConfig");
const GuildActivity = require("../../database/models/GuildActivity");
const botConfig = require("../../config/config");

const cache = new Map();

async function getGuildConfig(guildId) {
  if (cache.has(guildId)) {
    return cache.get(guildId);
  }

  let config = await GuildConfig.findOneAndUpdate(
  { guildId },
  { $setOnInsert: { guildId } },
  {
    returnDocument: "after",
    upsert: true,
    setDefaultsOnInsert: true
  }
);

  // Migration for records created before activity tracking existed.
  if (!config.activityTrackingStartedAt) {
    config.activityTrackingStartedAt = new Date();
    await config.save();
  }

  cache.set(guildId, config);

  return config;
}

async function getPrefix(guildId) {
  if (!guildId) return botConfig.prefix || "!";

  const config = await getGuildConfig(guildId);

  return config.prefix || botConfig.prefix || "!";
}

async function setGuildPrefix(guildId, prefix) {
  const config = await getGuildConfig(guildId);

  config.prefix = prefix;

  await config.save();

  cache.set(guildId, config);

  return config;
}

async function deleteGuildData(guildId) {
  cache.delete(guildId);

  await Promise.all([
    GuildConfig.deleteOne({ guildId }),
    GuildActivity.deleteMany({ guildId })
  ]);
}

async function resetActivityTracking(guildId) {
  const config = await getGuildConfig(guildId);

  config.activityTrackingStartedAt = new Date();

  await config.save();

  cache.set(guildId, config);

  return config;
}

module.exports = {
  getGuildConfig,
  getPrefix,
  setGuildPrefix,
  resetActivityTracking,
  deleteGuildData
};
