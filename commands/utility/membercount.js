
const { EmbedBuilder } = require("discord.js");
const GuildActivity = require("../../database/models/GuildActivity");
const { getGuildConfig } = require("../../systems/guild-system/guildConfig");

module.exports = {
  name: "membercount",
  aliases: ["mc"],

  async execute(message) {
    const guild = message.guild;
    if (!guild) return;

    try {
      // Fetch members and their available presence information.
      const members = await guild.members.fetch({
        withPresences: true
      });

      const snapshotAvailable = members.size === guild.memberCount;

      const humans = snapshotAvailable
        ? members.filter(member => !member.user.bot).size
        : null;

      const bots = snapshotAvailable
        ? members.filter(member => member.user.bot).size
        : null;

      let active = null;
      let inactive = null;

      if (snapshotAvailable) {
        const humanMembers = members.filter(
          member => !member.user.bot
        );

        active = humanMembers.filter(member =>
          ["online", "idle", "dnd"].includes(
            member.presence?.status
          )
        ).size;

        // Members without an active presence are counted as offline/invisible.
        inactive = humans - active;
      }

      // Activity tracking.
      const guildConfig = await getGuildConfig(guild.id);
      const trackingStartedAt =
        guildConfig.activityTrackingStartedAt;

      const now = new Date();
      const sevenDaysAgo = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      );

      const trackingReady =
        trackingStartedAt &&
        new Date(trackingStartedAt) <= sevenDaysAgo;

      const activityStart = trackingReady
        ? sevenDaysAgo
        : trackingStartedAt || now;

      const [joins, leaves] = await Promise.all([
        GuildActivity.countDocuments({
          guildId: guild.id,
          eventType: "join",
          createdAt: { $gte: activityStart, $lte: now }
        }),

        GuildActivity.countDocuments({
          guildId: guild.id,
          eventType: "leave",
          createdAt: { $gte: activityStart, $lte: now }
        })
      ]);

      const format = value =>
        value === null ? "—" : value.toLocaleString();

      const activityLabel = trackingReady
        ? "LAST 7 DAYS"
        : "SINCE TRACKING STARTED";

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({
          name: `${guild.name}  /  COMMUNITY DASHBOARD`,
          iconURL: guild.iconURL({ dynamic: true }) || undefined
        })
        .setThumbnail(
          guild.iconURL({ dynamic: true, size: 256 }) || null
        )
        .setDescription(
          [
            "A quick look at the community's current statistics.",
            "",
            `**TOTAL COMMUNITY**`,
            `\`${format(guild.memberCount)}\` members`
          ].join("\n")
        )

        // COMMUNITY SECTION
        .addFields(
          {
            name: "━━━  👥  COMMUNITY  ━━━",
            value: "Member breakdown",
            inline: false
          },
          {
            name: "👤 HUMANS",
            value: `**${format(humans)}**`,
            inline: true
          },
          {
            name: "🤖 BOTS",
            value: `**${format(bots)}**`,
            inline: true
          },
          {
            name: "📊 TOTAL",
            value: `**${format(guild.memberCount)}**`,
            inline: true
          },

          // PRESENCE SECTION
          {
            name: "━━━  🟢  PRESENCE  ━━━",
            value: "Current member availability",
            inline: false
          },
          {
            name: "🟢 ACTIVE",
            value: `**${format(active)}**\nOnline • Idle • DND`,
            inline: true
          },
          {
            name: "⚫ INACTIVE",
            value: `**${format(inactive)}**\nOffline • Invisible`,
            inline: true
          },

          // GROWTH SECTION
          {
            name: "━━━  📈  COMMUNITY GROWTH  ━━━",
            value: `**${activityLabel}**`,
            inline: false
          },
          {
            name: "📥 JOINS",
            value: `**${joins.toLocaleString()}**\nMembers joined`,
            inline: true
          },
          {
            name: "📤 LEAVES",
            value: `**${leaves.toLocaleString()}**\nMembers left`,
            inline: true
          }
        )
        .setFooter({
          text: trackingReady
            ? "GUARDIAN • Community Analytics"
            : "GUARDIAN • Activity tracking is still collecting data"
        })
        .setTimestamp();

      if (!snapshotAvailable) {
        embed.addFields({
          name: "ℹ️ MEMBER DATA",
          value:
            "A complete member snapshot wasn't available. Some member statistics are hidden to avoid displaying inaccurate figures.",
          inline: false
        });
      }

      if (!trackingReady) {
        embed.addFields({
          name: "⏳ TRACKING STATUS",
          value:
            `Activity tracking started <t:${Math.floor(
              new Date(activityStart).getTime() / 1000
            )}:R>.\nFull 7-day statistics will be available after seven days of continuous tracking.`,
          inline: false
        });
      }

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error("[MEMBERCOUNT ERROR]", error);

      await message.reply({
        content: "❌ Unable to retrieve member statistics right now."
      }).catch(() => {});
    }
  }
};
