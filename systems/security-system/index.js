/**
 * index.js
 * Location: systems/security-system/index.js
 *
 * Responsibility: Event routing only.
 */

const reactionRole = require("../automation-system/reactionRole");
const autoresponder = require("../automation-system/autoresponder");
const goodbye = require("../automation-system/goodbye");
const welcome = require("../automation-system/welcome");
const autorole = require("../automation-system/autorole");

const antiBot = require("./antiBot");
const { AuditLogEvent } = require("discord.js");

const actionExecutor = require("./actionExecutor");
const antiSpam = require("./antiSpam");
const antiLink = require("./antiLink");
const inviteFilter = require("./inviteFilter");
const antiRaid = require("./antiRaid");
const { getConfig } = require("./config");

module.exports = (client) => {

  // =========================
  // 🔥 MESSAGE CREATE
  // =========================
  client.on("messageCreate", async (message) => {
    try {
      if (!message.guild) return;
      if (message.author.bot) return;

      const config = await getConfig(message.guild.id);
      if (!config) return;

      if (config.ignoredChannels?.includes(message.channel.id)) return;

      const isWhitelisted =
        config.whitelist?.users?.includes(message.author.id) ||
        config.whitelist?.roles?.some(roleId =>
          message.member.roles.cache.has(roleId)
        ) ||
        config.whitelist?.channels?.includes(message.channel.id);

      if (isWhitelisted) return;

      // =========================
      // 🤖 AUTO RESPONDER
      // =========================
      try {
        const autoResult = autoresponder.evaluate(message, config.autoresponder);

        if (autoResult) {
          await message.reply(autoResult.reply);
        }
      } catch (err) {
        console.error("[AUTORESPONDER ERROR]", err);
      }

      // =========================
      // 🔥 ANTI-SPAM
      // =========================
      try {
        const spamResult = antiSpam.evaluate(message, config.antiSpam);

        if (spamResult.triggered) {
          await actionExecutor.execute({
            action: spamResult.action,
            userId: spamResult.userId,
            guild: message.guild,
            reason: "Auto spam detection",
          });
          return;
        }
      } catch (err) {
        console.error("[ANTI-SPAM ERROR]", err);
      }

      // =========================
      // 🔥 ANTI-LINK
      // =========================
      try {
        const linkResult = antiLink.evaluate(message, config.antiLink);

        if (linkResult?.triggered) {
          await actionExecutor.execute({
            action: linkResult.action,
            userId: linkResult.userId,
            guild: message.guild,
            reason: "Auto link detection",
          });
          return;
        }
      } catch (err) {
        console.error("[ANTI-LINK ERROR]", err);
      }

      // =========================
      // 🔥 INVITE FILTER
      // =========================
      try {
        const inviteResult = inviteFilter.evaluate(message, config.inviteFilter);

        if (inviteResult?.triggered) {
          await actionExecutor.execute({
            action: inviteResult.action,
            userId: inviteResult.userId,
            guild: message.guild,
            reason: "Discord invite detected",
          });
          return;
        }
      } catch (err) {
        console.error("[INVITE FILTER ERROR]", err);
      }

    } catch (err) {
      console.error("[MESSAGE CREATE ERROR]", err);
    }
  });

  // =========================
  // 👤 MEMBER JOIN
  // =========================
  client.on("guildMemberAdd", async (member) => {
    try {
      const config = await getConfig(member.guild.id);
      if (!config) return;

      const isWhitelisted =
        config.whitelist?.users?.includes(member.id) ||
        config.whitelist?.roles?.some(roleId =>
          member.roles.cache.has(roleId)
        );

      if (isWhitelisted) return;

      // 🎯 AUTO ROLE
      try {
        if (config.autorole?.enabled) {
          await autorole.assign(member, config.autorole);
        }
      } catch (err) {
        console.error("[AUTOROLE ERROR]", err);
      }

      // 👋 WELCOME
      try {
        if (config.welcome?.enabled) {
          await welcome.send(member, config.welcome);
        }
      } catch (err) {
        console.error("[WELCOME ERROR]", err);
      }

      // 🤖 ANTI-BOT
      const botResult = antiBot.evaluate(member, config.antiBot);

      if (botResult.triggered) {
        if (member.kickable) {
          await member.kick("Unauthorized bot detected");
        }

        await new Promise(res => setTimeout(res, 1500));

        try {
          const logs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.BotAdd,
          });

          const entry = logs.entries.first();
          if (!entry) return;
          if (entry.target.id !== member.id) return;

          const executor = await member.guild.members.fetch(entry.executor.id);

          const executorWhitelisted =
            config.whitelist?.users?.includes(executor.id) ||
            config.whitelist?.roles?.some(roleId =>
              executor.roles.cache.has(roleId)
            );

          if (executorWhitelisted) return;

          if (executor.moderatable) {
            await executor.timeout(60 * 60 * 1000, "Unauthorized bot added");
          }

        } catch (err) {
          console.error("[ANTI-BOT AUDIT ERROR]", err);
        }

        return;
      }

      // 🔥 ANTI-RAID
      const result = antiRaid.evaluate(member, config.antiRaid);

      if (result.triggered) {
        const members = await member.guild.members.fetch();

        const recent = members.filter(
          (m) =>
            m.joinedTimestamp &&
            Date.now() - m.joinedTimestamp < config.antiRaid.interval
        );

        for (const m of recent.values()) {
          if (result.action === "kick" && m.kickable) {
            await m.kick("Raid detected");
          }

          if (result.action === "timeout" && m.moderatable) {
            await m.timeout(5 * 60 * 1000, "Raid detected");
          }
        }
      }

    } catch (err) {
      console.error("[MEMBER JOIN ERROR]", err);
    }
  });

  // =========================
  // 👋 MEMBER LEAVE
  // =========================
  client.on("guildMemberRemove", async (member) => {
    try {
      const config = await getConfig(member.guild.id);
      if (!config) return;

      if (config.goodbye?.enabled) {
        await goodbye.send(member, config.goodbye);
      }

    } catch (err) {
      console.error("[GOODBYE ERROR]", err);
    }
  });

  // =========================
  // 🎯 REACTION ROLE ADD
  // =========================
  client.on("messageReactionAdd", async (reaction, user) => {
    try {
      if (reaction.partial) await reaction.fetch();
      if (!reaction.message.guild) return;

      const config = await getConfig(reaction.message.guild.id);
      if (!config) return;

      await reactionRole.handleAdd(reaction, user, config);

    } catch (err) {
      console.error("[RR ADD ERROR]", err);
    }
  });

  // =========================
  // 🎯 REACTION ROLE REMOVE
  // =========================
  client.on("messageReactionRemove", async (reaction, user) => {
    try {
      if (reaction.partial) await reaction.fetch();
      if (!reaction.message.guild) return;

      const config = await getConfig(reaction.message.guild.id);
      if (!config) return;

      await reactionRole.handleRemove(reaction, user, config);

    } catch (err) {
      console.error("[RR REMOVE ERROR]", err);
    }
  });

};
