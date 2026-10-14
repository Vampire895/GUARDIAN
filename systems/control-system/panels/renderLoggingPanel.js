const buildControlEmbed = require("../utils/buildControlEmbed");
const createPrimaryButton = require("../../../ui/buttons/createPrimaryButton");
const createSecondaryButton = require("../../../ui/buttons/createSecondaryButton");
const createActionRow = require("../../../ui/actionRows/createActionRow");
const getLogConfig = require("../../logging-system/services/getLogConfig");
const { PermissionsBitField } = require("discord.js");

/**
 * Render the Logging Center home panel with every saved independent route.
 */
async function renderLoggingPanel({ interaction }) {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
            content: "❌ You need Administrator permission to manage logging.",
            ephemeral: true
        });
    }

    const config = await getLogConfig(interaction.guild.id);
    const enabled = config.enabled === true;
    const categories = config.categories && typeof config.categories === "object"
        ? config.categories
        : {};

    const typeLabels = {
        all: "All Commands",
        moderation: "Moderation",
        security: "Security",
        verification: "Verification",
        automation: "Automation",
        utility: "Utility",
        test: "Test",
        nick: "Nick Command"
    };

    const configuredRoutes = Object.entries(categories)
        .filter(([, route]) => route?.channelId)
        .sort(([a], [b]) => a.localeCompare(b));

    const routeSummary = configuredRoutes.length
        ? configuredRoutes.map(([type, route]) =>
            `• **${typeLabels[type] || type}** → <#${route.channelId}>`
        ).join("\n")
        : "No category routes configured yet.";

    const description = `**Status:** ${enabled ? "🟢 Enabled" : "🔴 Disabled"}\n\n**Saved logging routes**\n${routeSummary}\n\n${enabled
        ? "Matching GUARDIAN command usage will be sent to every configured destination."
        : "Logging is globally disabled. Your saved routes are kept and will not be deleted when you enable or configure logging again."}`;

    const embed = buildControlEmbed({
        guild: interaction.guild,
        title: "📜 Logging Center",
        description
    });

    const buttons = [
        enabled
            ? createPrimaryButton({
                customId: "control:logging:disable",
                label: "Disable All"
            })
            : createPrimaryButton({
                customId: "control:logging:enable",
                label: "Configure / Enable"
            }),
        createSecondaryButton({
            customId: "control:logging:config",
            label: "Add / Edit Route"
        }),
        createSecondaryButton({
            customId: "control:home:panel",
            label: "Back"
        })
    ];

    return interaction.update({
        embeds: [embed],
        components: [createActionRow(buttons)]
    });
}

module.exports = renderLoggingPanel;
