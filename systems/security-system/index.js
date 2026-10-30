
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
  // MESSAGE CREATE
  // =========================
  client.on("messageCreate", async (message) => {
    try {
      if (!message.guild) return;
      if (message.author.bot) return;

      const config = await getConfig(message.guild.id);
      if (!config) return;

      if (config.ignoredChannels?.includes(message.channel.id)) return;

      // GLOBAL WHITELIST
      const isGloballyWhitelisted =
        config.whitelist?.users?.includes(message.author.id) ||
        config.whitelist?.roles?.some(roleId =>
          message.member.roles.cache.has(roleId)
        ) ||
        config.whitelist?.channels?.includes(message.channel.id);

      if (isGloballyWhitelisted) return;

      // =========================
      // AUTO RESPONDER
      // =========================
      try {
        const autoResult = autoresponder.evaluate(
          message,
          config.autoresponder
        );

        if (autoResult) {
          await message.reply(autoResult.reply);
        }
      } catch (err) {
        console.error("[AUTORESPONDER ERROR]", err);
      }

      // =========================
      // ANTI-SPAM
      // =========================
      try {
        const spamResult = antiSpam.evaluate(
          message,
          {
            ...config.antiSpam,
            whitelist: config.whitelist?.antiSpam
          }
        );

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
      // ANTI-LINK
      // =========================
      try {
        const linkResult = antiLink.evaluate(
          message,
          {
            ...config.antiLink,
            whitelist: config.whitelist?.antiLink
          }
        );

        if (linkResult?.triggered) {

          // Delete prohibited link message
          try {
            await message.delete();
          } catch (deleteError) {
            console.error(
              "[ANTI-LINK DELETE ERROR]",
              deleteError
            );
          }

          // Execute configured punishment
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
      // INVITE FILTER
      // =========================
      try {
        const inviteResult = inviteFilter.evaluate(
          message,
          {
            ...config.inviteFilter,
            whitelist: config.whitelist?.inviteFilter
          }
        );

        if (inviteResult?.triggered) {

          // Delete Discord invite message
          try {
            await message.delete();
          } catch (deleteError) {
            console.error(
              "[INVITE FILTER DELETE ERROR]",
              deleteError
            );
          }

          // Execute configured punishment
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
  // MEMBER JOIN
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

      // AUTO ROLE
      try {
        if (config.autorole?.enabled) {
          await autorole.assign(member, config.autorole);
        }
      } catch (err) {
        console.error("[AUTOROLE ERROR]", err);
      }

      // WELCOME
      try {
        if (config.welcome?.enabled) {
          await welcome.send(member, config.welcome);
        }
      } catch (err) {
        console.error("[WELCOME ERROR]", err);
      }

      
      // =========================
      // ANTI-BOT
      // =========================
      if (config.antiBot?.enabled && member.user.bot) {
        try {
          // Get Aegis's own guild member and highest role.
          const aegisMember =
            member.guild.members.me ||
            await member.guild.members.fetch(client.user.id);

          // Audit logs can take time to register.
          let entry = null;

          for (let attempt = 0; attempt < 4; attempt++) {
            if (attempt > 0) {
              await new Promise(res => setTimeout(res, 1000));
            }

            const logs = await member.guild.fetchAuditLogs({
              limit: 10,
              type: AuditLogEvent.BotAdd,
            });

            entry = logs.entries.find(log =>
              log.target?.id === member.id &&
              Date.now() - log.createdTimestamp < 15000
            );

            if (entry) break;
          }

          // Do not punish if the inviter cannot be verified.
          if (!entry?.executor?.id) return;

          // Fetch the human who added the bot.
          const executor = await member.guild.members.fetch(
            entry.executor.id
          );

          const botResult = antiBot.evaluate({
            member,
            config: {
              ...config.antiBot,
              whitelist: config.whitelist?.antiBot
            },
            executor,
            aegisMember
          });

          // Whitelisted or at/above Aegis: allow the bot.
          if (!botResult.triggered) return;

          // Kick ONLY the newly added bot.
          if (member.kickable) {
            await member.kick(
              "Unauthorized bot added by a non-whitelisted member"
            );
          }

        } catch (err) {
          console.error("[ANTI-BOT ERROR]", err);
        }

        return;
      }


      // ANTI-RAID
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
  // MEMBER LEAVE
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
  // REACTION ROLE ADD
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
  // REACTION ROLE REMOVE
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
