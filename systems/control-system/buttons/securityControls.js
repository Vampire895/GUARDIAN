const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder
} = require("discord.js");

const controlSessions = require(
    "../sessions/controlSessions"
);

const getSession = require(
    "../sessions/getSession"
);

const stageConfig = require(
    "../sessions/stageConfig"
);

const createActionRow = require(
    "../../../ui/actionRows/createActionRow"
);

const createPrimaryButton = require(
    "../../../ui/buttons/createPrimaryButton"
);

const createSecondaryButton = require(
    "../../../ui/buttons/createSecondaryButton"
);

const buildControlEmbed = require(
    "../utils/buildControlEmbed"
);

const buttonRegistry = require("../../interaction-system/registry/buttonRegistry");
const selectMenuRegistry = require("../../interaction-system/registry/selectMenuRegistry");
const modalRegistry = require("../../interaction-system/registry/modalRegistry");
const { checkPermissions } = require("../../permission-system");
const { getConfig, updateConfig } = require("../../security-system/config");
const {
    modules,
    renderSecurityPanel,
    renderSecurityModulePanel
} = require("../panels/securityModulePanel");

const actions = ["warn", "timeout", "kick"];

function input(customId, label, value, { required = true, placeholder = "" } = {}) {
    return new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId(customId)
            .setLabel(label)
            .setStyle(TextInputStyle.Short)
            .setRequired(required)
            .setValue(String(value ?? ""))
            .setPlaceholder(placeholder)
    );
}

async function allowed(interaction) {
    const result = checkPermissions({
        member: interaction.member,
        botMember: interaction.guild.members.me,
        requiredPermissions: ["ManageGuild"]
    });
    if (!result.success) {
        await interaction.reply({ content: "You need Manage Server permission to change security settings.", ephemeral: true });
        return false;
    }
    return true;
}

function securityModal(moduleId, config) {
    const module = config[moduleId];
    const modal = new ModalBuilder()
        .setCustomId(`control:modal:security-config:${moduleId}`)
        .setTitle(`Configure ${modules[moduleId].label}`);

    if (moduleId === "antiSpam") {
        return modal.addComponents(
            input("primary", "Messages before action", module.maxMessages, { placeholder: "5" }),
            input("secondary", "Window in milliseconds", module.interval, { placeholder: "5000" }),
            input("action", "Action: warn, timeout, or kick", module.action, { placeholder: "timeout" })
        );
    }
    if (moduleId === "antiLink") {
        return modal.addComponents(
            input("action", "Action: warn, timeout, or kick", module.action, { placeholder: "timeout" }),
            input("domains", "Allowed domains, comma-separated", module.allowedDomains.join(", "), { required: false, placeholder: "youtube.com, github.com" })
        );
    }
    if (moduleId === "inviteFilter") {
        return modal.addComponents(input("action", "Action: warn, timeout, or kick", module.action, { placeholder: "timeout" }));
    }
    return modal.addComponents(
        input("primary", "Joins before action", module.joinThreshold, { placeholder: "5" }),
        input("secondary", "Window in milliseconds", module.interval, { placeholder: "10000" }),
        input("action", "Action: timeout or kick", module.action, { placeholder: "kick" })
    );
}

async function selectModule(interaction) {
    if (!await allowed(interaction)) return;
    return renderSecurityModulePanel({ interaction, moduleId: interaction.values[0] });
}

async function toggleModule(interaction, parsed) {

    if (!await allowed(interaction)) return;

    const moduleId = parsed.data;

    if (!modules[moduleId]) {
        return interaction.reply({
            content: "Unknown security module.",
            ephemeral: true
        });
    }

    const config =
        await getConfig(
            interaction.guild.id
        );

    const current =
        config[moduleId].enabled;

    const staged =
        stageConfig(
            interaction.message.id,
            {
                [`${moduleId}.enabled`]:
                    !current
            }
        );

    if (!staged) {
        return interaction.reply({
            content:
                "❌ Control session expired.",
            ephemeral: true
        });
    }

   

    return renderSecurityModulePanel({
        interaction,
        moduleId
    });
}


async function saveChanges(
    interaction
) {

    const session =
        getSession(
            interaction.message.id
        );

    if (
        !session ||
        !session.dirty
    ) {

        return interaction.reply({
            content:
                "No pending changes.",
            ephemeral: true
        });
    }

    await updateConfig(
        interaction.guild.id,
        session.stagedConfig
    );

    session.stagedConfig = {};

    session.dirty = false;

    return renderSecurityPanel({
        interaction
    });
}


async function openConfig(interaction, parsed) {

    if (!await allowed(interaction)) return;

    const moduleId =
        parsed.data;

    if (
        !modules[moduleId] ||
        moduleId === "antiBot"
    ) {

        return interaction.reply({

            content:
                "This module has no additional settings.",

            ephemeral: true
        });
    }

    const config =
        await getConfig(
            interaction.guild.id
        );

    const session =
        getSession(
            interaction.message.id
        );

    if (session) {

        session.activeModule =
            moduleId;
    }

    return interaction.showModal(

        securityModal(
            moduleId,
            config
        )
    );
}



async function selectWhitelistModule(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const moduleId =
        interaction.values[0];

    const session =
        getSession(
            interaction.message.id
        );

    if (!session) {

        return interaction.reply({

            content:
                "Control session expired.",

            ephemeral: true
        });
    }

    session.whitelistModule =
        moduleId;

    return renderSecurityModulePanel({

        interaction,

       moduleId: "whitelist"
    });
}


async function openWhitelistAdd(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const session =
        getSession(
            interaction.message.id
        );

    if (!session?.whitelistModule) {

        return interaction.reply({

            content:
                "Select a protection module first.",

            ephemeral: true
        });
    }

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "Add Whitelist Entry",

            description:
                `Protection: **${
                    modules[
                        session.whitelistModule
                    ].label
                }**\n\nChoose what to whitelist.`
        });

    return interaction.update({

        embeds: [embed],

        components: [

            createActionRow([

                new StringSelectMenuBuilder()

                    .setCustomId(
                        "control:select:whitelist-add"
                    )

                    .setPlaceholder(
                        "Choose whitelist type"
                    )

                    .addOptions([

                        {
                            label:
                                "Users",

                            value:
                                "users"
                        },

                        {
                            label:
                                "Roles",

                            value:
                                "roles"
                        }
                    ])
            ]),

            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:security:back:none",

                    label:
                        "Back"
                })
            ])
        ]
    });
}

async function openWhitelistRemove(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const session =
        getSession(
            interaction.message.id
        );

    if (
        !session?.whitelistModule
    ) {

        return interaction.reply({

            content:
                "Select a protection module first.",

            ephemeral: true
        });
    }

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "Remove Whitelist Entry",

            description:
                `Protection: **${
                    modules[
                        session.whitelistModule
                    ].label
                }**\n\nChoose what to remove.`
        });

    return interaction.update({

        embeds: [embed],

        components: [

            createActionRow([

                new StringSelectMenuBuilder()

                    .setCustomId(
                        "control:select:whitelist-remove"
                    )

                    .setPlaceholder(
                        "Choose whitelist type"
                    )

                    .addOptions([

                        {
                            label:
                                "Users",

                            value:
                                "users"
                        },

                        {
                            label:
                                "Roles",

                            value:
                                "roles"
                        }
                    ])
            ]),

            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:security:back:none",

                    label:
                        "Back"
                })
            ])
        ]
    });
}

async function selectWhitelistRemoveType(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const session =
        getSession(
            interaction.message.id
        );

    if (
        !session?.whitelistModule
    ) {

        return interaction.reply({

            content:
                "Select a protection module first.",

            ephemeral: true
        });
    }

    const type =
        interaction.values[0];

    const module =
        session.whitelistModule;

    const config =
        await getConfig(
            interaction.guild.id
        );

    const whitelist =
        config.whitelist?.[module] || {};

    const entries =
        whitelist[type] || [];

    if (!entries.length) {

        return interaction.reply({

            content:
                `No ${type} are currently whitelisted for ${modules[module].label}.`,

            ephemeral: true
        });
    }

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "Remove Whitelist Entry",

            description:
                `Protection: **${modules[module].label}**\n\nSelect ${type} to remove.`
        });

    const selector =
        type === "users"

            ? new UserSelectMenuBuilder()

                .setCustomId(
                    "control:whitelist:remove:users"
                )

                .setPlaceholder(
                    "Select users to remove"
                )

                .setMinValues(1)

                .setMaxValues(
                    Math.min(entries.length, 25)
                )

            : new RoleSelectMenuBuilder()

                .setCustomId(
                    "control:whitelist:remove:roles"
                )

                .setPlaceholder(
                    "Select roles to remove"
                )

                .setMinValues(1)

                .setMaxValues(
                    Math.min(entries.length, 25)
                );

    return interaction.update({

        embeds: [embed],

        components: [

            createActionRow([
                selector
            ]),

            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:security:back:none",

                    label:
                        "Back"
                })
            ])
        ]
    });
}

async function removeWhitelistUsers(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const session =
        getSession(
            interaction.message.id
        );

    if (
        !session?.whitelistModule
    ) {

        return interaction.reply({

            content:
                "Select a protection module first.",

            ephemeral: true
        });
    }

    const module =
        session.whitelistModule;

    const current =
        session.stagedConfig?.[
            `whitelist.${module}.users`
        ];

    const config =
        await getConfig(
            interaction.guild.id
        );

    const existing =
        Array.isArray(current)
            ? current
            : (
                config.whitelist?.[module]?.users || []
            );

    const updated =
        existing.filter(
            id =>
                !interaction.values.includes(id)
        );

    stageConfig(

        interaction.message.id,

        {
            [`whitelist.${module}.users`]:
                updated
        }
    );

    return renderSecurityModulePanel({

        interaction,

        moduleId:
            "whitelist"
    });
}


async function removeWhitelistRoles(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const session =
        getSession(
            interaction.message.id
        );

    if (
        !session?.whitelistModule
    ) {

        return interaction.reply({

            content:
                "Select a protection module first.",

            ephemeral: true
        });
    }

    const module =
        session.whitelistModule;

    const current =
        session.stagedConfig?.[
            `whitelist.${module}.roles`
        ];

    const config =
        await getConfig(
            interaction.guild.id
        );

    const existing =
        Array.isArray(current)
            ? current
            : (
                config.whitelist?.[module]?.roles || []
            );

    const updated =
        existing.filter(
            id =>
                !interaction.values.includes(id)
        );

    stageConfig(

        interaction.message.id,

        {
            [`whitelist.${module}.roles`]:
                updated
        }
    );

    return renderSecurityModulePanel({

        interaction,

        moduleId:
            "whitelist"
    });
}

async function selectWhitelistAddType(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const session =
        getSession(
            interaction.message.id
        );

    if (
        !session?.whitelistModule
    ) {

        return interaction.reply({

            content:
                "Select a protection module first.",

            ephemeral: true
        });
    }

    const type =
        interaction.values[0];

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "Add Whitelist Entry",

            description:
                `Protection: **${
                    modules[
                        session.whitelistModule
                    ].label
                }**\n\nSelect ${
                    type === "users"
                        ? "users"
                        : "roles"
                } to whitelist.`
        });

    const selector =
        type === "users"

            ? new UserSelectMenuBuilder()

                .setCustomId(
                    "control:whitelist:users"
                )

                .setPlaceholder(
                    "Select users"
                )

                .setMinValues(1)

                .setMaxValues(25)

            : new RoleSelectMenuBuilder()

                .setCustomId(
                    "control:whitelist:roles"
                )

                .setPlaceholder(
                    "Select roles"
                )

                .setMinValues(1)

                .setMaxValues(25);

    return interaction.update({

        embeds: [embed],

        components: [

            createActionRow([
                selector
            ]),

            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:security:back:none",

                    label:
                        "Back"
                })
            ])
        ]
    });
}

async function saveWhitelistUsers(interaction) {

    const session =
        getSession(
            interaction.message.id
        );

    if (
        !session?.whitelistModule
    ) return;

    const module =
        session.whitelistModule;

    stageConfig(

        interaction.message.id,

        {
            [`whitelist.${module}.users`]:
                interaction.values
        }
    );

    return renderSecurityModulePanel({

        interaction,

        moduleId: "whitelist"
    });
}


async function saveWhitelistRoles(interaction) {

    const session =
        getSession(
            interaction.message.id
        );

    if (
        !session?.whitelistModule
    ) return;

    const module =
        session.whitelistModule;

    stageConfig(

        interaction.message.id,

        {
            [`whitelist.${module}.roles`]:
                interaction.values
        }
    );

    return renderSecurityModulePanel({

        interaction,

        moduleId: "whitelist"
    });
}

async function saveConfig(interaction, parsed) {
    if (!await allowed(interaction)) return;
    const moduleId = parsed.data;
    const value = id => interaction.fields.getTextInputValue(id).trim();
    const action = interaction.fields.fields.has("action") ? value("action").toLowerCase() : null;
    if (action && !actions.includes(action)) {
        return interaction.reply({ content: "Action must be warn, timeout, or kick.", ephemeral: true });
    }

    let changes;
    if (moduleId === "antiSpam") {
        const maxMessages = Number(value("primary"));
        const interval = Number(value("secondary"));
        if (!Number.isInteger(maxMessages) || maxMessages < 2 || !Number.isInteger(interval) || interval < 1000) {
            return interaction.reply({ content: "Use a whole message count of at least 2 and a window of at least 1000ms.", ephemeral: true });
        }
        changes = { "antiSpam.maxMessages": maxMessages, "antiSpam.interval": interval, "antiSpam.action": action };
    } else if (moduleId === "antiLink") {
        const domains = value("domains").split(",").map(domain => domain.trim().toLowerCase()).filter(Boolean);
        changes = { "antiLink.action": action, "antiLink.allowedDomains": [...new Set(domains)] };
    } else if (moduleId === "inviteFilter") {
        changes = { "inviteFilter.action": action };
    } else if (moduleId === "antiRaid") {
        const joinThreshold = Number(value("primary"));
        const interval = Number(value("secondary"));
        if (!Number.isInteger(joinThreshold) || joinThreshold < 2 || !Number.isInteger(interval) || interval < 1000) {
            return interaction.reply({ content: "Use a whole join threshold of at least 2 and a window of at least 1000ms.", ephemeral: true });
        }
        if (action === "warn") return interaction.reply({ content: "Anti-raid can use timeout or kick only.", ephemeral: true });
        changes = { "antiRaid.joinThreshold": joinThreshold, "antiRaid.interval": interval, "antiRaid.action": action };
    } else {
        return interaction.reply({ content: "Unknown security module.", ephemeral: true });
    }

 let session = null;

for (const s of controlSessions.values()) {

    if (
        s.ownerId === interaction.user.id &&
        s.activeModule === moduleId
    ) {

        session = s;
        break;
    }
}

if (!session) {

    return interaction.reply({

        content:
            "❌ Control session expired.",

        ephemeral: true
    });
}

const staged =
    stageConfig(
        session.dashboardMessageId,
        changes
    );

if (!staged) {

    return interaction.reply({

        content:
            "❌ Failed to stage changes.",

        ephemeral: true
    });
}

if (!staged) {

    return interaction.reply({

        content:
            "❌ Control session expired.",

        ephemeral: true
    });
}

await interaction.reply({

    content:
        `✅ ${modules[moduleId].label} settings staged.`,

    ephemeral: true
});

try {

    const channel =
        await interaction.client.channels.fetch(
            session.channelId
        );

    const message =
        await channel.messages.fetch(
            session.dashboardMessageId
        );

    await renderSecurityModulePanel({

    interaction: {

        ...interaction,

        guild: interaction.guild,

        message: {
            id: session.dashboardMessageId
        },

        update: payload =>
            message.edit(
                payload
            )
    },

    moduleId
});

} catch (error) {

    console.error(
        "[SECURITY REFRESH]",
        error
    );
}
}

async function openIgnoredChannels(
    interaction,
    parsed
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const operation =
        parsed.data;

    const title =
        operation === "add"
            ? "Add Ignored Channels"
            : "Remove Ignored Channels";

    const description =
        operation === "add"
            ? "Select the channels where Guardian security checks should be skipped."
            : "Select the channels to remove from the ignored-channel list.";

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title,

            description
        });

    const selector =
        new ChannelSelectMenuBuilder()

            .setCustomId(
                `control:security:ignored:select:${operation}`
            )

            .setPlaceholder(
                operation === "add"
                    ? "Select channels to ignore"
                    : "Select channels to remove"
            )

            .setMinValues(1)

            .setMaxValues(25);

    return interaction.update({

        embeds: [embed],

        components: [

            createActionRow([
                selector
            ]),

            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:security:back:none",

                    label:
                        "Back"
                })
            ])
        ]
    });
}

async function saveIgnoredChannelsAdd(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const session =
        getSession(
            interaction.message.id
        );

    if (!session) {

        return interaction.reply({

            content:
                "Control session expired.",

            ephemeral: true
        });
    }

    const config =
        await getConfig(
            interaction.guild.id
        );

    const staged =
        session.stagedConfig?.ignoredChannels;

    const current =
        Array.isArray(staged)
            ? staged
            : (
                config.ignoredChannels || []
            );

    const next =
        [
            ...new Set([
                ...current,
                ...interaction.values
            ])
        ];

    const stagedSuccessfully =
        stageConfig(

            interaction.message.id,

            {
                ignoredChannels:
                    next
            }
        );


    if (!stagedSuccessfully) {

        return interaction.reply({

            content:
                "❌ Failed to stage ignored channels.",

            ephemeral: true
        });
    }

    return renderSecurityModulePanel({

        interaction,

        moduleId:
            "ignoredChannels"
    });
}


async function saveIgnoredChannelsRemove(
    interaction
) {

    if (
        !await allowed(
            interaction
        )
    ) return;

    const session =
        getSession(
            interaction.message.id
        );

    if (!session) {

        return interaction.reply({

            content:
                "Control session expired.",

            ephemeral: true
        });
    }

    const config =
        await getConfig(
            interaction.guild.id
        );

    const staged =
        session.stagedConfig?.ignoredChannels;

    const current =
        Array.isArray(staged)
            ? staged
            : (
                config.ignoredChannels || []
            );

    const next =
        current.filter(

            channelId =>
                !interaction.values.includes(
                    channelId
                )
        );

    const stagedSuccessfully =
        stageConfig(

            interaction.message.id,

            {
                ignoredChannels:
                    next
            }
        );

    if (!stagedSuccessfully) {

        return interaction.reply({

            content:
                "❌ Failed to stage ignored channels.",

            ephemeral: true
        });
    }

    return renderSecurityModulePanel({

        interaction,

        moduleId:
            "ignoredChannels"
    });
}

function listModal(kind, operation) {
    const isWhitelist = kind === "whitelist";
    const modal = new ModalBuilder()
        .setCustomId(`control:modal:security-list:${kind}:${operation}`)
        .setTitle(`${operation === "add" ? "Add" : "Remove"} ${isWhitelist ? "Whitelist Entry" : "Ignored Channel"}`);
    if (isWhitelist) modal.addComponents(input("type", "Type: user, role, or channel", "", { placeholder: "user" }));
    return modal.addComponents(input("ids", isWhitelist ? "IDs, comma-separated" : "Channel IDs, comma-separated", "", { placeholder: "123456789012345678" }));
}

async function openListModal(interaction, parsed) {
    if (!await allowed(interaction)) return;
    return interaction.showModal(listModal(parsed.action, parsed.data));
}

async function saveList(interaction, parsed) {
    if (!await allowed(interaction)) return;
    const [kind, operation] = parsed.data.split(":");
    const ids = interaction.fields.getTextInputValue("ids").split(",").map(id => id.trim()).filter(id => /^\d{15,22}$/.test(id));
    if (!ids.length) return interaction.reply({ content: "Provide one or more valid Discord IDs, separated by commas.", ephemeral: true });
    const config = await getConfig(interaction.guild.id);

    if (kind === "whitelist") {
        const type = interaction.fields.getTextInputValue("type").trim().toLowerCase();
        if (!(["user", "role", "channel"].includes(type))) return interaction.reply({ content: "Type must be user, role, or channel.", ephemeral: true });
        const path = `${type}s`;
        const current = config.whitelist?.[path] || [];
        const next = operation === "add" ? [...new Set([...current, ...ids])] : current.filter(id => !ids.includes(id));
        await updateConfig(interaction.guild.id, { [`whitelist.${path}`]: next });
    } else {
        const current = config.ignoredChannels || [];
        const next = operation === "add" ? [...new Set([...current, ...ids])] : current.filter(id => !ids.includes(id));
        await updateConfig(interaction.guild.id, { ignoredChannels: next });
    }
    return interaction.reply({ content: "Security list updated.", ephemeral: true });
}

buttonRegistry.set("control:security:toggle", toggleModule);
buttonRegistry.set("control:security:configure", openConfig);
buttonRegistry.set("control:security:back", interaction => renderSecurityPanel({ interaction }));
buttonRegistry.set("control:security:whitelist", openListModal);
buttonRegistry.set(
    "control:security:ignored",
    openIgnoredChannels
);

selectMenuRegistry.set("control:select:security", selectModule);

selectMenuRegistry.set(
    "control:security:ignored:select:add",
    saveIgnoredChannelsAdd
);

selectMenuRegistry.set(
    "control:security:ignored:select:remove",
    saveIgnoredChannelsRemove
);

selectMenuRegistry.set(
    "control:select:whitelist",
    selectWhitelistModule
);
modalRegistry.set("control:modal:security-config", saveConfig);
modalRegistry.set("control:modal:security-list", saveList);

console.log("[Control System] Security controls loaded.");
buttonRegistry.set(
    "control:security:save",
    saveChanges
);
buttonRegistry.set(
    "control:whitelist:add",
    openWhitelistAdd
);

buttonRegistry.set(
    "control:whitelist:remove",
    openWhitelistRemove
);

selectMenuRegistry.set(
    "control:select:whitelist-remove",
    selectWhitelistRemoveType
);

selectMenuRegistry.set(
    "control:whitelist:remove:users",
    removeWhitelistUsers
);

selectMenuRegistry.set(
    "control:whitelist:remove:roles",
    removeWhitelistRoles
);

selectMenuRegistry.set(
    "control:select:whitelist-add",
    selectWhitelistAddType
);
selectMenuRegistry.set(
    "control:whitelist:users",
    saveWhitelistUsers
);

selectMenuRegistry.set(
    "control:whitelist:roles",
    saveWhitelistRoles
);