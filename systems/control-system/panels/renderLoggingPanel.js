const buildControlEmbed = require("../utils/buildControlEmbed");
const createPrimaryButton = require("../../../ui/buttons/createPrimaryButton");
const createSecondaryButton = require("../../../ui/buttons/createSecondaryButton");
const createActionRow = require("../../../ui/actionRows/createActionRow");
const getLogConfig = require("../../logging-system/services/getLogConfig");
const { PermissionsBitField } = require("discord.js");

/**
 * Render the Logging Center home panel.
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

    const typeLabels = {
        all: "All Commands",
        moderation: "Moderation",
        security: "Security",
        automation: "Automation",
        utility: "Utility",
        test: "Test",
        nick: "Nick Command"
    };

    const description = enabled
        ? `**Status:** 🟢 Enabled\n**Logging type:** ${typeLabels[config.type] || config.type || "Not configured"}\n**Channel:** ${config.channelId ? `<#${config.channelId}>` : "Not configured"}\n\nGUARDIAN command usage will be sent to the selected channel.`
        : `**Status:** 🔴 Disabled\n\nEnable command logging to choose a command type and a channel.\n\nOnly commands used through GUARDIAN are logged in this version.`;

    const embed = buildControlEmbed({
        guild: interaction.guild,
        title: "📜 Logging Center",
        description
    });

    const backButton = createSecondaryButton({
        customId: "control:home:panel",
        label: "Back"
    });

    const buttons = enabled
        ? [
            createPrimaryButton({
                customId: "control:logging:disable",
                label: "Disable"
            }),
            createSecondaryButton({
                customId: "control:logging:config",
                label: "Config"
            }),
            backButton
        ]
        : [
            createPrimaryButton({
                customId: "control:logging:enable",
                label: "Enable"
            }),
            backButton
        ];

    return interaction.update({
        embeds: [embed],
        components: [createActionRow(buttons)]
    });
}

module.exports = renderLoggingPanel;
