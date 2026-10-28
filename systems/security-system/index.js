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

      // Automation is independent of security-module whitelist exceptions.
      // Bots are handled by anti-bot first and should not receive human welcome/autorole flows.
      if (!member.user.bot) {
        try { if (config.autorole?.enabled) await autorole.assign(member, config.autorole); }
        catch (err) { console.error("[AUTOROLE ERROR]", err); }
        try { if (config.welcome?.enabled) await welcome.send(member, config.welcome); }
        catch (err) { console.error("[WELCOME ERROR]", err); }
      }

      // ANTI-BOT: the human who added the bot is checked against antiBot whitelist.
      const botResult = antiBot.evaluate(member, config.antiBot);
      if (botResult.triggered) {
        let entry = null;
        // Audit-log entries can lag behind guildMemberAdd; retry briefly and match this exact bot.
        for (let attempt = 0; attempt < 4 && !entry; attempt++) {
          try {
            const logs = await member.guild.fetchAuditLogs({ limit: 6, type: AuditLogEvent.BotAdd });
            entry = logs.entries.find(candidate => candidate.target?.id === member.id && candidate.executor?.id && Date.now() - candidate.createdTimestamp < 15000) || null;
          } catch (err) {
            console.error("[ANTI-BOT AUDIT ERROR]", err);
          }
          if (!entry && attempt < 3) await new Promise(resolve => setTimeout(resolve, 350));
        }

        let executor = null;
        if (entry?.executor?.id) {
          try { executor = await member.guild.members.fetch(entry.executor.id); }
          catch (err) { console.error("[ANTI-BOT EXECUTOR FETCH ERROR]", err); }
        }

        const inviterWhitelisted = !!executor && (
          config.antiBot?.whitelist?.users?.includes(executor.id) ||
          executor.roles.cache.some(role => config.antiBot?.whitelist?.roles?.includes(role.id))
        );

        // A whitelisted inviter is the only exemption; there is no bot-account whitelist.
        if (inviterWhitelisted) return;

        try {
          if (member.kickable) await member.kick("Unauthorized bot detected by Guardian anti-bot protection");
          else console.warn(`[ANTI-BOT] Could not kick bot ${member.id}: missing permission or role hierarchy.`);
        } catch (err) { console.error("[ANTI-BOT KICK ERROR]", err); }

        if (executor) {
          try {
            if (executor.moderatable) await executor.timeout(60 * 60 * 1000, "Added a non-whitelisted bot");
            else console.warn(`[ANTI-BOT] Could not timeout inviter ${executor.id}: missing permission or role hierarchy.`);
          } catch (err) { console.error("[ANTI-BOT INVITER PUNISHMENT ERROR]", err); }
        } else {
          console.warn(`[ANTI-BOT] Could not identify the inviter for bot ${member.id}; bot enforcement attempted, inviter punishment skipped.`);
        }
        return;
      }

      // ANTI-RAID: enforce only against IDs in the detected join cohort.
      const raid = antiRaid.evaluate(member, config.antiRaid);
      if (!raid.triggered) return;

      for (const userId of raid.members || []) {
        let joinedMember = null;
        try { joinedMember = await member.guild.members.fetch(userId); }
        catch { continue; }
        if (config.antiRaid?.whitelist?.users?.includes(userId) || joinedMember.roles.cache.some(role => config.antiRaid?.whitelist?.roles?.includes(role.id))) continue;
        try {
          if (raid.action === "kick" && joinedMember.kickable) await joinedMember.kick("Raid detected by Guardian anti-raid protection");
          else if (raid.action === "timeout" && joinedMember.moderatable) await joinedMember.timeout(5 * 60 * 1000, "Raid detected by Guardian anti-raid protection");
          else console.warn(`[ANTI-RAID] Could not enforce against ${userId}: action unavailable or role hierarchy/permissions prevent it.`);
        } catch (err) { console.error("[ANTI-RAID ACTION ERROR]", err); }
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
