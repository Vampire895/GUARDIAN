
const { EmbedBuilder } = require("discord.js");
const { checkPermissions } = require("../../systems/permission-system");
const { getConfig } = require("../../systems/security-system/config");
const {
  createSuccessEmbed,
  createErrorEmbed
} = require("../../ui/embeds");

const name = "whitelist";
const aliases = ["whitelists", "wl", "whitelisted"];
const description = "View and manage security whitelists.";

const MODULES = {
  antispam: { key: "antiSpam", name: "Anti-Spam" },
  antilink: { key: "antiLink", name: "Anti-Link" },
  invitefilter: { key: "inviteFilter", name: "Invite Filter" },
  antiraid: { key: "antiRaid", name: "Anti-Raid" },
  antibot: { key: "antiBot", name: "Anti-Bot" }
};

const COLOR = 0x5865F2;

function createEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(title)
    .setDescription(description || null)
    .setTimestamp();
}

function getModuleWhitelist(config, moduleKey) {
  const whitelist = config.whitelist?.[moduleKey];

  return {
    users: Array.isArray(whitelist?.users) ? whitelist.users : [],
    roles: Array.isArray(whitelist?.roles) ? whitelist.roles : []
  };
}

function uniqueIds(arrays) {
  return [...new Set(arrays.flat().filter(Boolean))];
}

function formatCount(value) {
  return String(value).padStart(3, "0");
}

function splitItems(items, maxLength = 850) {
  const chunks = [];
  let current = [];

  for (const item of items) {
    const candidate = [...current, item].join("\n");

    if (candidate.length > maxLength && current.length) {
      chunks.push(current);
      current = [item];
    } else {
      current.push(item);
    }
  }

  if (current.length) chunks.push(current);

  return chunks;
}

async function sendEmbeds(message, embeds) {
  for (let i = 0; i < embeds.length; i += 10) {
    const batch = embeds.slice(i, i + 10);

    if (i === 0) {
      await message.reply({ embeds: batch });
    } else {
      await message.channel.send({ embeds: batch });
    }
  }
}

// =========================
// GLOBAL OVERVIEW
// =========================
function createOverview(config) {
  const modules = Object.values(MODULES).map(module => {
    const data = getModuleWhitelist(config, module.key);

    return {
      name: module.name,
      users: data.users.length,
      roles: data.roles.length
    };
  });

  const globalUsers = Array.isArray(config.whitelist?.users)
    ? config.whitelist.users
    : [];

  const globalRoles = Array.isArray(config.whitelist?.roles)
    ? config.whitelist.roles
    : [];

  const globalChannels = Array.isArray(config.whitelist?.channels)
    ? config.whitelist.channels
    : [];

  const allModuleUsers = modules.length
    ? uniqueIds(
        Object.values(MODULES).map(module =>
          getModuleWhitelist(config, module.key).users
        )
      )
    : [];

  const allModuleRoles = uniqueIds(
    Object.values(MODULES).map(module =>
      getModuleWhitelist(config, module.key).roles
    )
  );

  const totalUsers = uniqueIds([globalUsers, allModuleUsers]).length;
  const totalRoles = uniqueIds([globalRoles, allModuleRoles]).length;

  const rows = [
    "MODULE          USERS   ROLES",
    "─────────────────────────────",
    ...modules.map(module =>
      `${module.name.padEnd(16)}${formatCount(module.users).padStart(3)}     ${formatCount(module.roles)}`
    ),
    "─────────────────────────────",
    `${"GLOBAL".padEnd(16)}${formatCount(globalUsers.length).padStart(3)}     ${formatCount(globalRoles.length)}`
  ];

  const embed = createEmbed(
    "🛡️ GUARDIAN • WHITELIST OVERVIEW",
    [
      "Complete security whitelist directory.",
      "",
      "```",
      `  USERS       ROLES      CHANNELS`,
      `    ${String(totalUsers).padEnd(10)}${String(totalRoles).padEnd(11)}${globalChannels.length}`,
      "```",
      "**MODULE BREAKDOWN**",
      "```",
      ...rows,
      "```"
    ].join("\n")
  );

  embed.setFooter({
    text: "GUARDIAN SECURITY • .wl <module> to view entries"
  });

  return embed;
}

// =========================
// MODULE-SPECIFIC LIST
// =========================
function createModuleEmbeds(module, data) {
  const userItems = data.users.map(
    (id, index) => `${String(index + 1).padStart(2, "0")}. <@${id}>`
  );

  const roleItems = data.roles.map(
    (id, index) => `${String(index + 1).padStart(2, "0")}. <@&${id}>`
  );

  const userChunks = splitItems(userItems);
  const roleChunks = splitItems(roleItems);

  const totalPages = Math.max(
    1,
    userChunks.length,
    roleChunks.length
  );

  const embeds = [];

  for (let i = 0; i < totalPages; i++) {
    const embed = createEmbed(
      `🛡️ GUARDIAN • ${module.name.toUpperCase()}`,
      [
        "**WHITELIST DIRECTORY**",
        "",
        `👤 Users: **${data.users.length}**`,
        `🛡️ Roles: **${data.roles.length}**`,
        `📑 Page: **${i + 1}/${totalPages}**`
      ].join("\n")
    );

    embed.addFields(
      {
        name: `👤 USERS • ${data.users.length}`,
        value: userChunks[i]
          ? userChunks[i].join("\n")
          : "```No users whitelisted.```",
        inline: false
      },
      {
        name: `🛡️ ROLES • ${data.roles.length}`,
        value: roleChunks[i]
          ? roleChunks[i].join("\n")
          : "```No roles whitelisted.```",
        inline: false
      }
    );

    embed.setFooter({
      text: `GUARDIAN SECURITY • ${module.name} WHITELIST`
    });

    embeds.push(embed);
  }

  return embeds;
}

async function showModuleWhitelist(message, config, module) {
  const data = getModuleWhitelist(config, module.key);

  return sendEmbeds(
    message,
    createModuleEmbeds(module, data)
  );
}

// =========================
// COMMAND
// =========================
async function execute(message, args) {
  if (!message.guild) return;

  const sub = args[0]?.toLowerCase();

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

  const config = await getConfig(message.guild.id);

  // MODULE LISTING
  if (sub && MODULES[sub]) {
    return showModuleWhitelist(message, config, MODULES[sub]);
  }

  // ADD TO GLOBAL WHITELIST
  if (sub === "add") {
    const user = message.mentions.users.first();
    const role = message.mentions.roles.first();
    const channel = message.mentions.channels.first();

    if (!user && !role && !channel) {
      return message.reply({
        embeds: [
          createErrorEmbed("Mention a user, role, or channel.")
        ]
      });
    }

    if (user && !config.whitelist.users.includes(user.id)) {
      config.whitelist.users.push(user.id);
    }

    if (role && !config.whitelist.roles.includes(role.id)) {
      config.whitelist.roles.push(role.id);
    }

    if (channel && !config.whitelist.channels.includes(channel.id)) {
      config.whitelist.channels.push(channel.id);
    }

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Added to the global whitelist.")]
    });
  }

  // REMOVE FROM GLOBAL WHITELIST
  if (sub === "remove") {
    const user = message.mentions.users.first();
    const role = message.mentions.roles.first();
    const channel = message.mentions.channels.first();

    if (!user && !role && !channel) {
      return message.reply({
        embeds: [
          createErrorEmbed("Mention a user, role, or channel.")
        ]
      });
    }

    if (user) {
      config.whitelist.users =
        config.whitelist.users.filter(id => id !== user.id);
    }

    if (role) {
      config.whitelist.roles =
        config.whitelist.roles.filter(id => id !== role.id);
    }

    if (channel) {
      config.whitelist.channels =
        config.whitelist.channels.filter(id => id !== channel.id);
    }

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Removed from the global whitelist.")]
    });
  }

  // GLOBAL OVERVIEW
  return message.reply({
    embeds: [createOverview(config)]
  });
}

module.exports = {
  name,
  aliases,
  description,
  execute
};
