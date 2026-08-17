const buildControlEmbed = require("../utils/buildControlEmbed");
const createSecondaryButton = require("../../../ui/buttons/createSecondaryButton");
const createActionRow = require("../../../ui/actionRows/createActionRow");

const modules = {
    warnings: { title: "Warnings", page: 1, description: "Issue, review, and clear member warnings.", commands: [["Warn a member", ".warn @member reason"], ["View history", ".warnings @member"], ["Clear warnings", ".clearwarnings @member [amount]"]] },
    timeouts: { title: "Timeouts", page: 1, description: "Temporarily restrict a member from participating.", commands: [["Timeout a member", ".timeout @member 10m reason"], ["Valid durations", "10s, 10m, 1h, or 1d"]] },
    isolation: { title: "Isolation", page: 1, description: "Place a member in the Quarantine role, then restore them when ready.", commands: [["Isolate a member", ".isolate @member 1h reason"], ["Release early", ".bail @member"]] },
    purge: { title: "Purge", page: 2, description: "Bulk-delete recent messages from the current channel.", commands: [["Delete messages", ".purge 20"], ["Delete bot messages", ".purge bots [amount]"], ["Delete one member's messages", ".purge @member 30"]] },
    locks: { title: "Locks", page: 2, description: "Lock or reopen the current channel, or the full server.", commands: [["Lock this channel", ".lock"], ["Unlock this channel", ".unlock"], ["Lock every text channel", ".lockall"], ["Unlock every text channel", ".unlockall"]] },
    nicknames: { title: "Nicknames", page: 2, description: "Set or reset a member's server nickname.", commands: [["Change nickname", ".nick @member New Name"], ["Reset nickname", ".resetnick @member"]] },
    roles: { title: "Roles", page: 3, description: "Grant or remove manageable server roles.", commands: [["Add a role", ".role add @member @role"], ["Remove a role", ".role remove @member @role"]] },
    slowmode: { title: "Slowmode", page: 3, description: "Set a sending delay for the current channel.", commands: [["Enable slowmode", ".slowmode 10s"], ["Disable slowmode", ".slowmode off"]] },
    bans: { title: "Ban System", page: 3, description: "Remove a member from the server or restore a banned user.", commands: [["Ban a member", ".ban @member reason"], ["Unban by user ID", ".unban user-id reason"], ["Kick a member", ".kick @member reason"]] }
};

async function renderModerationModulePanel({ interaction, moduleId }) {
    const module = modules[moduleId];
    if (!module) {
        return interaction.reply({ content: "That moderation module is unavailable.", ephemeral: true });
    }

    const embed = buildControlEmbed({
        guild: interaction.guild,
        title: `Moderation: ${module.title}`,
        description: `${module.description}\n\n**Available commands**\n${module.commands.map(([label, usage]) => `• **${label}**\n\`${usage}\``).join("\n")}`
    });

    return interaction.update({
        embeds: [embed],
        components: [createActionRow([
            createSecondaryButton({ customId: `control:page:moderation:${module.page}`, label: "Back" }),
            createSecondaryButton({ customId: "control:home:panel", label: "Home" })
        ])]
    });
}

module.exports = { renderModerationModulePanel, modules };
