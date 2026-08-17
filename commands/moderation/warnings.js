const { checkPermissions } = require("../../systems/permission-system");
const Warning = require("../../database/models/Warning");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");
const { sendPaginatedEmbed } = require("../../ui/buttons/pagination");

const name = "warnings";
const description = "View warning history of a member.";

async function execute(message, args) {
  const target = message.mentions.members.first();

  if (!target) {
    return message.reply({
      embeds: [createErrorEmbed("Please mention a valid member.")]
    });
  }

  // Permission check
  const permCheck = checkPermissions({
    member: message.member,
    botMember: message.guild.members.me,
    requiredPermissions: ["ManageMessages"]
  });

  if (!permCheck.success) {
    return message.reply({
      embeds: [createErrorEmbed("Missing permissions.")]
    });
  }

  // Fetch warnings
  const warnings = await Warning.find({ userId: target.id }).sort({ createdAt: -1 });

  if (warnings.length === 0) {
    return message.reply({
      embeds: [createErrorEmbed("This user has no warnings.")]
    });
  }

  // Pagination logic (NO UI here)
  const perPage = 5;
  const pages = [];

  for (let i = 0; i < warnings.length; i += perPage) {
    const chunk = warnings.slice(i, i + perPage);

    const formatted = chunk.map((w) => {
      return `**Case #${w.caseId}**\nReason: ${w.reason}\nModerator: <@${w.moderatorId}>\nTime: <t:${Math.floor(new Date(w.createdAt).getTime() / 1000)}:R>`;
    }).join("\n\n");

    pages.push(
      createSuccessEmbed(
        `**Warnings for ${target.user.tag}**\n\n${formatted}\n\nPage ${Math.floor(i / perPage) + 1}/${Math.ceil(warnings.length / perPage)}`
      )
    );
  }

  // Send via central UI system
  return sendPaginatedEmbed({
    message,
    userId: message.author.id,
    pages
  });
}

module.exports = { name, description, execute };