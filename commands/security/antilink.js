const { checkPermissions } = require("../../systems/permission-system");
const { getConfig, updateConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "antilink";
const description = "Manage anti-link settings.";

async function execute(message, args) {
  const sub = args[0];
  const guildId = message.guild.id;

  const permCheck = checkPermissions({
    member: message.member,
    botMember: message.guild.members.me,
    requiredPermissions: ["ManageGuild"],
  });

  if (!permCheck.success) {
    return message.reply({
      embeds: [createErrorEmbed("Missing permissions.")]
    });
  }

  const config = await getConfig(guildId);

  // ENABLE
  if (sub === "enable") {
    await updateConfig(guildId, { "antiLink.enabled": true });

    return message.reply({
      embeds: [createSuccessEmbed("Anti-link enabled.")]
    });
  }

  // DISABLE
  if (sub === "disable") {
    await updateConfig(guildId, { "antiLink.enabled": false });

    return message.reply({
      embeds: [createSuccessEmbed("Anti-link disabled.")]
    });
  }

  // ADD ALLOWED DOMAIN
  if (sub === "allow") {
    const domain = args[1];

    if (!domain) {
      return message.reply({
        embeds: [createErrorEmbed("Provide a domain (e.g. youtube.com).")]
      });
    }

    if (!config.antiLink.allowedDomains.includes(domain)) {
      config.antiLink.allowedDomains.push(domain);
      await config.save();
    }

    return message.reply({
      embeds: [createSuccessEmbed(`Allowed domain: ${domain}`)]
    });
  }

  // REMOVE DOMAIN
  if (sub === "remove") {
    const domain = args[1];

    if (!domain) {
      return message.reply({
        embeds: [createErrorEmbed("Provide a domain.")]
      });
    }

    config.antiLink.allowedDomains =
      config.antiLink.allowedDomains.filter(d => d !== domain);

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed(`Removed domain: ${domain}`)]
    });
  }

  // STATUS
  return message.reply({
    embeds: [
      createSuccessEmbed(
        `Anti-link:\nEnabled: ${config.antiLink.enabled}\nAllowed: ${
          config.antiLink.allowedDomains.join(", ") || "None"
        }`
      )
    ]
  });
}

module.exports = { name, description, execute };