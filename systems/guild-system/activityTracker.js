
const GuildActivity = require("../../database/models/GuildActivity");

const {
  getGuildConfig,
  deleteGuildData
} = require("./guildConfig");

module.exports = (client) => {

  async function initializeGuild(guildId) {
    try {
      await getGuildConfig(guildId);
    } catch (error) {
      console.error("[GUILD TRACKER INIT ERROR]", error);
    }
  }

  async function recordActivity(guildId, eventType) {
    try {
      await getGuildConfig(guildId);

      await GuildActivity.create({
        guildId,
        eventType,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("[GUILD ACTIVITY ERROR]", error);
    }
  }

  // Initialize tracking for servers already connected.
  client.once("clientReady", async () => {
    for (const guild of client.guilds.cache.values()) {
      await initializeGuild(guild.id);
    }
  });

  // Initialize tracking for newly joined servers.
  client.on("guildCreate", async (guild) => {
    await initializeGuild(guild.id);
  });

  // Record member joins.
  client.on("guildMemberAdd", async (member) => {
    await recordActivity(member.guild.id, "join");
  });

  // Record member departures.
  client.on("guildMemberRemove", async (member) => {
    await recordActivity(member.guild.id, "leave");
  });

  // Permanently delete this server's data when Guardian leaves.
  client.on("guildDelete", async (guild) => {
    try {
      await deleteGuildData(guild.id);
    } catch (error) {
      console.error("[GUILD DATA CLEANUP ERROR]", error);
    }
  });
};
