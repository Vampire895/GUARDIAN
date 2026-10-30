
const { EmbedBuilder } = require("discord.js");
const { checkPermissions } = require("../../systems/permission-system");
const { getConfig } = require("../../systems/security-system/config");
const { createErrorEmbed } = require("../../ui/embeds");

const name = "securitystatus";
const description = "View security system status.";

const COLOR = 0x5865F2;

const MODULES = [
  { key: "antiSpam", name: "Anti-Spam" },
  { key: "antiLink", name: "Anti-Link" },
  { key: "inviteFilter", name: "Invite Filter" },
  { key: "antiRaid", name: "Anti-Raid" },
  { key: "antiBot", name: "Anti-Bot" },
  { key: "escalation", name: "Escalation" }
];

function status(enabled) {
  if (enabled === true) return "🟢 **ENABLED**";
  if (enabled === false) return "🔴 **DISABLED**";
  return "⚪ **NOT CONFIGURED**";
}

function uniqueIds(arrays) {
  return [...new Set(arrays.flat().filter(Boolean))];
}

function getWhitelistStats(config) {
  const whitelist = config.whitelist || {};

  const globalUsers = Array.isArray(whitelist.users)
    ? whitelist.users
    : [];

  const globalRoles = Array.isArray(whitelist.roles)
    ? whitelist.roles
    : [];

  const globalChannels = Array.isArray(whitelist.channels)
    ? whitelist.channels
    : [];

  const moduleKeys = [
    "antiSpam",
    "antiLink",
    "inviteFilter",
    "antiRaid",
    "antiBot"
  ];

  const moduleUsers = moduleKeys.map(key =>
    Array.isArray(whitelist[key]?.users)
      ? whitelist[key].users
      : []
  );

  const moduleRoles = moduleKeys.map(key =>
    Array.isArray(whitelist[key]?.roles)
      ? whitelist[key].roles
      : []
  );

  return {
    users: uniqueIds([globalUsers, ...moduleUsers]).length,
    roles: uniqueIds([globalRoles, ...moduleRoles]).length,
    channels: uniqueIds([globalChannels]).length
  };
}

function createStatusEmbed(config) {
  const modules = MODULES.map(module => ({
    ...module,
    enabled: config[module.key]?.enabled
  }));

  const enabledCount = modules.filter(
    module => module.enabled === true
  ).length;

  const configuredCount = modules.filter(
    module => typeof module.enabled === "boolean"
  ).length;

  const whitelist = getWhitelistStats(config);

  const protectionRows = [
    "MODULE             STATUS",
    "────────────────────────────",
    ...modules.map(module => {
      const label = module.name.padEnd(19);
      const state =
        module.enabled === true ? "🟢 ON" :
        module.enabled === false ? "🔴 OFF" :
        "⚪ N/A";

      return `${label}${state}`;
    })
  ];

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle("🔐 GUARDIAN • SECURITY DASHBOARD")
    .setDescription(
      [
        "Live configuration overview for this server.",
        "",
        "```",
        `PROTECTION     ${enabledCount}/${modules.length} ENABLED`,
        `CONFIGURED     ${configuredCount}/${modules.length}`,
        "```",
        "**PROTECTION MODULES**",
        "```",
        ...protectionRows,
        "```",
        "**WHITELIST STATISTICS**",
        "```",
        "CATEGORY             TOTAL",
        "──────────────────────────",
        `${"Users".padEnd(21)}${String(whitelist.users).padStart(3)}`,
        `${"Roles".padEnd(21)}${String(whitelist.roles).padStart(3)}`,
        `${"Channels".padEnd(21)}${String(whitelist.channels).padStart(3)}`,
        "```"
      ].join("\n")
    )
    .setFooter({
      text: "GUARDIAN SECURITY • Configuration overview"
    })
    .setTimestamp();

  return embed;
}

async function execute(message) {
  if (!message.guild) return;

  const permCheck = checkPermissions({
    member: message.member,
    botMember: message.guild.members.me,
    requiredPermissions: ["ManageGuild"]
  });

  if (!permCheck.success) {
    return message.reply({
      embeds: [createErrorEmbed("Missing permissions.")]
    });
  }

  try {
    const config = await getConfig(message.guild.id);

    if (!config) {
      return message.reply({
        embeds: [createErrorEmbed("Security configuration could not be loaded.")]
      });
    }

    const embed = createStatusEmbed(config);

    return message.reply({ embeds: [embed] });

  } catch (error) {
    console.error("[SECURITY STATUS ERROR]", error);

    return message.reply({
      embeds: [
        createErrorEmbed("Unable to retrieve security status.")
      ]
    });
  }
}

module.exports = {
  name,
  description,
  execute
};
