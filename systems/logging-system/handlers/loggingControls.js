const {
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    PermissionsBitField
} = require("discord.js");

const buttonRegistry = require("../../interaction-system/registry/buttonRegistry");
const selectMenuRegistry = require("../../interaction-system/registry/selectMenuRegistry");
const getSession = require("../../control-system/sessions/getSession");
const createPrimaryButton = require("../../../ui/buttons/createPrimaryButton");
const createSecondaryButton = require("../../../ui/buttons/createSecondaryButton");
const createActionRow = require("../../../ui/actionRows/createActionRow");
const buildControlEmbed = require("../../control-system/utils/buildControlEmbed");
const getLogConfig = require("../services/getLogConfig");
const saveLogConfig = require("../services/saveLogConfig");
const renderLoggingPanel = require("../../control-system/panels/renderLoggingPanel");

const TYPE_OPTIONS = [
    { label: "All Commands", value: "all", description: "Log every command used through GUARDIAN." },
    { label: "Moderation", value: "moderation", description: "Log commands in the moderation category." },
    { label: "Security", value: "security", description: "Log commands in the security category." },
    { label: "Automation", value: "automation", description: "Log commands in the automation category." },
    { label: "Utility", value: "utility", description: "Log commands in the utility category." },
    { label: "Test", value: "test", description: "Log commands in the test category." },
    { label: "Nick Command", value: "nick", description: "Log only the nick command." }
];

function isAdministrator(interaction) {
    return Boolean(interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator));
}

async function requireAdministrator(interaction) {
    if (isAdministrator(interaction)) return true;
    await interaction.reply({
        content: "❌ You need Administrator permission to manage logging.",
        ephemeral: true
    });
    return false;
}

function getDraft(interaction) {
    return getSession(interaction.message.id)?.loggingDraft || null;
}

async function renderSetup(interaction) {
    if (!await requireAdministrator(interaction)) return;

    const session = getSession(interaction.message.id);
    if (!session) {
        return interaction.reply({ content: "❌ Control session expired. Reopen `.control` and try again.", ephemeral: true });
    }

    if (!session.loggingDraft) {
        const current = await getLogConfig(interaction.guild.id);
        session.loggingDraft = {
            type: current.type || null,
            channelId: current.channelId || null
        };
    }

    const draft = session.loggingDraft;
    const selectedType = TYPE_OPTIONS.find(option => option.value === draft.type);
    const channelLabel = draft.channelId ? `<#${draft.channelId}>` : "Not selected";
    const typeLabel = selectedType?.label || "Not selected";

    const embed = buildControlEmbed({
        guild: interaction.guild,
        title: "📜 Configure Command Logging",
        description: `Choose which GUARDIAN commands to log and where to send them.\n\n**Logging type:** ${typeLabel}\n**Channel:** ${channelLabel}\n\nChanges stay temporary until you click **Save**.`
    });

    const typeSelect = new StringSelectMenuBuilder()
        .setCustomId("control:logging:type")
        .setPlaceholder("Select logging type")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(TYPE_OPTIONS.map(option => ({
            ...option,
            default: option.value === draft.type
        })));

    const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId("control:logging:channel")
        .setPlaceholder("Select logging channel")
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);

    const actionButtons = [];
    if (draft.type && draft.channelId) {
        actionButtons.push(createPrimaryButton({
            customId: "control:logging:save",
            label: "Save"
        }));
    }
    actionButtons.push(createSecondaryButton({
        customId: "control:logging:back",
        label: "Back"
    }));

    return interaction.update({
        embeds: [embed],
        components: [
            createActionRow([typeSelect]),
            createActionRow([channelSelect]),
            createActionRow(actionButtons)
        ]
    });
}

async function openEnableSetup(interaction) {
    if (!await requireAdministrator(interaction)) return;
    const session = getSession(interaction.message.id);
    if (!session) {
        return interaction.reply({ content: "❌ Control session expired. Reopen `.control` and try again.", ephemeral: true });
    }
    // Enabling starts with a blank draft; the Save button appears only after
    // the administrator explicitly chooses both fields.
    session.loggingDraft = { type: null, channelId: null };
    return renderSetup(interaction);
}

async function openConfigSetup(interaction) {
    if (!await requireAdministrator(interaction)) return;
    const session = getSession(interaction.message.id);
    if (!session) {
        return interaction.reply({ content: "❌ Control session expired. Reopen `.control` and try again.", ephemeral: true });
    }
    // Reconfiguration also starts a fresh draft. The live saved config remains
    // untouched until both fields are selected and Save is clicked.
    session.loggingDraft = { type: null, channelId: null };
    return renderSetup(interaction);
}

async function selectType(interaction) {
    if (!await requireAdministrator(interaction)) return;
    const session = getSession(interaction.message.id);
    if (!session) {
        return interaction.reply({ content: "❌ Control session expired. Reopen `.control` and try again.", ephemeral: true });
    }
    if (!TYPE_OPTIONS.some(option => option.value === interaction.values[0])) {
        return interaction.reply({ content: "❌ Unknown logging type.", ephemeral: true });
    }
    session.loggingDraft = session.loggingDraft || { type: null, channelId: null };
    session.loggingDraft.type = interaction.values[0];
    return renderSetup(interaction);
}

async function selectChannel(interaction) {
    if (!await requireAdministrator(interaction)) return;
    const session = getSession(interaction.message.id);
    if (!session) {
        return interaction.reply({ content: "❌ Control session expired. Reopen `.control` and try again.", ephemeral: true });
    }

    const channelId = interaction.values[0];
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    const botMember = interaction.guild.members.me;
    const permissions = channel?.permissionsFor(botMember);

    if (!channel || !channel.isTextBased() || !channel.send
        || !permissions
        || !permissions.has(PermissionsBitField.Flags.ViewChannel)
        || !permissions.has(PermissionsBitField.Flags.SendMessages)) {
        return interaction.reply({
            content: "❌ I can't send logs to that channel. Choose a text channel where GUARDIAN has View Channel and Send Messages permissions.",
            ephemeral: true
        });
    }

    session.loggingDraft = session.loggingDraft || { type: null, channelId: null };
    session.loggingDraft.channelId = channel.id;
    return renderSetup(interaction);
}

async function saveSetup(interaction) {
    if (!await requireAdministrator(interaction)) return;
    const session = getSession(interaction.message.id);
    const draft = session?.loggingDraft;

    if (!draft?.type || !draft?.channelId) {
        return interaction.reply({ content: "❌ Select both a logging type and a channel before saving.", ephemeral: true });
    }

    const channel = await interaction.guild.channels.fetch(draft.channelId).catch(() => null);
    const permissions = channel?.permissionsFor(interaction.guild.members.me);
    if (!channel || !channel.isTextBased() || !channel.send
        || !permissions
        || !permissions.has(PermissionsBitField.Flags.ViewChannel)
        || !permissions.has(PermissionsBitField.Flags.SendMessages)) {
        return interaction.reply({
            content: "❌ GUARDIAN no longer has permission to send logs to that channel. Choose another channel.",
            ephemeral: true
        });
    }

    await saveLogConfig({
        guildId: interaction.guild.id,
        type: draft.type,
        channelId: draft.channelId,
        enabled: true
    });

    session.loggingDraft = null;
    session.stagedConfig = {};
    session.dirty = false;
    return renderLoggingPanel({ interaction });
}

async function disableLogging(interaction) {
    if (!await requireAdministrator(interaction)) return;
    const config = await getLogConfig(interaction.guild.id);
    await saveLogConfig({
        guildId: interaction.guild.id,
        type: config.type || "all",
        channelId: config.channelId || null,
        enabled: false
    });
    const session = getSession(interaction.message.id);
    if (session) session.loggingDraft = null;
    return renderLoggingPanel({ interaction });
}

async function backToPanel(interaction) {
    if (!await requireAdministrator(interaction)) return;
    const session = getSession(interaction.message.id);
    if (session) session.loggingDraft = null;
    return renderLoggingPanel({ interaction });
}

buttonRegistry.set("control:logging:enable", openEnableSetup);
buttonRegistry.set("control:logging:config", openConfigSetup);
buttonRegistry.set("control:logging:disable", disableLogging);
buttonRegistry.set("control:logging:save", saveSetup);
buttonRegistry.set("control:logging:back", backToPanel);

selectMenuRegistry.set("control:logging:type", selectType);
selectMenuRegistry.set("control:logging:channel", selectChannel);

console.log("[Logging System] Logging Center controls loaded.");
