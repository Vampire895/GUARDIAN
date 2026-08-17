const { StringSelectMenuBuilder } = require("discord.js");
const buildControlEmbed = require("../utils/buildControlEmbed");
const createSecondaryButton = require("../../../ui/buttons/createSecondaryButton");
const createActionRow = require("../../../ui/actionRows/createActionRow");

const moderationPages = {
    1: [["Warnings", "warnings", "Warn, review, or clear member warnings"], ["Timeouts", "timeouts", "Temporarily restrict a member"], ["Isolation", "isolation", "Quarantine a member and restore them later"]],
    2: [["Purge", "purge", "Delete recent messages"], ["Locks", "locks", "Lock and unlock channels"], ["Nicknames", "nicknames", "Manage member nicknames"]],
    3: [["Roles", "roles", "Grant or remove roles"], ["Slowmode", "slowmode", "Set channel rate limits"], ["Ban System", "bans", "Kick, ban, and unban members"]]
};

async function renderModerationPanel({ interaction, page = 1 }) {
    const modules = moderationPages[page] || moderationPages[1];
    const embed = buildControlEmbed({
        guild: interaction.guild,
        title: "Moderation Center",
        description: `Choose a module to see every available command and its exact usage.\n\n**Modules**\n${modules.map(([label, , description]) => `• **${label}** — ${description}`).join("\n")}\n\nPage ${page}/3`
    });

    const moderationSelect = new StringSelectMenuBuilder()
        .setCustomId(`control:select:moderation:${page}`)
        .setPlaceholder("Choose a moderation module")
        .addOptions(modules.map(([label, value, description]) => ({ label, value, description })));

    return interaction.update({
        embeds: [embed],
        components: [
            createActionRow([moderationSelect]),
            createActionRow([
                createSecondaryButton({ customId: `control:page:moderation:${page - 1}`, label: "Previous", disabled: page <= 1 }),
                createSecondaryButton({ customId: "control:home:panel", label: "Home" }),
                createSecondaryButton({ customId: `control:page:moderation:${page + 1}`, label: "Next", disabled: page >= 3 })
            ])
        ]
    });
}

module.exports = renderModerationPanel;
