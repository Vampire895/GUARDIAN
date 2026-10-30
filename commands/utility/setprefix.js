
const { checkPermissions } = require("../../systems/permission-system");
const {
  getGuildConfig,
  setGuildPrefix
} = require("../../systems/guild-system/guildConfig");
const { getPrefix } = require("../../systems/guild-system/guildConfig");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");
const botConfig = require("../../config/config");

const name = "setprefix";
const aliases = ["prefix", "sp"];
const description = "Change the server's command prefix.";

async function execute(message, args) {
  if (!message.guild) return;

  const permCheck = checkPermissions({
    member: message.member,
    botMember: message.guild.members.me,
    requiredPermissions: ["ManageGuild"]
  });

  if (!permCheck.success) {
    return message.reply({
      embeds: [createErrorEmbed("You need Manage Server permission to change the prefix.")]
    });
  }

  const newPrefix = args[0];

  if (!newPrefix) {
    const currentPrefix = await getPrefix(message.guild.id);

    return message.reply({
      embeds: [
        createErrorEmbed(
          `Please provide a new prefix.\n\nCurrent prefix: \`${currentPrefix}\`\nExample: \`${currentPrefix}setprefix !\``
        )
      ]
    });
  }

  if (args.length > 1 || !/^[^\s]{1,5}$/u.test(newPrefix)) {
    return message.reply({
      embeds: [
        createErrorEmbed(
          "Invalid prefix. Use 1–5 characters without spaces.\nExample: `!setprefix ?`"
        )
      ]
    });
  }

  try {
    const guildId = message.guild.id;
    const guildConfig = await getGuildConfig(guildId);
    const previousPrefix = guildConfig.prefix || botConfig.prefix || "!";

    if (previousPrefix === newPrefix) {
      return message.reply({
        embeds: [
          createErrorEmbed("That prefix is already configured for this server.")
        ]
      });
    }

    await setGuildPrefix(guildId, newPrefix);

    return message.reply({
      embeds: [
        createSuccessEmbed(
          [
            "## Prefix Updated Successfully",
            "",
            `**Previous prefix:** \`${previousPrefix}\``,
            `**New prefix:** \`${newPrefix}\``,
            "",
            "Your server's custom prefix has been saved permanently.",
            "It will remain active across bot restarts."
          ].join("\n")
        )
      ]
    });

  } catch (error) {
    console.error("[SET PREFIX ERROR]", error);

    return message.reply({
      embeds: [
        createErrorEmbed("Unable to update the server prefix.")
      ]
    });
  }
}

module.exports = {
  name,
  aliases,
  description,
  execute
};
