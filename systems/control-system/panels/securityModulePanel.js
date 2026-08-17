const { StringSelectMenuBuilder } = require("discord.js");
const buildControlEmbed = require("../utils/buildControlEmbed");
const createPrimaryButton = require("../../../ui/buttons/createPrimaryButton");
const createSecondaryButton = require("../../../ui/buttons/createSecondaryButton");
const createActionRow = require("../../../ui/actionRows/createActionRow");
const { getConfig } = require("../../security-system/config");
const getSession = require("../sessions/getSession");

const modules = {
    antiSpam: { label: "Anti-Spam", description: "Detect repeated messages from a member." },
    antiLink: { label: "Anti-Link", description: "Block links unless their domain is allowed." },
    inviteFilter: { label: "Invite Filter", description: "Block Discord invite links." },
    antiRaid: { label: "Anti-Raid", description: "Respond to a burst of member joins." },
    antiBot: { label: "Anti-Bot", description: "Remove newly added bots unless the adder is whitelisted." }
};

const state = value => value ? "Enabled" : "Disabled";

function moduleDescription(moduleId, config) {
    const module = config[moduleId];

    if (moduleId === "antiSpam") {
        return `${modules[moduleId].description}\n\n**Status:** ${state(module.enabled)}\n**Threshold:** ${module.maxMessages} messages\n**Window:** ${module.interval}ms\n**Action:** ${module.action}`;
    }

    if (moduleId === "antiLink") {
        return `${modules[moduleId].description}\n\n**Status:** ${state(module.enabled)}\n**Action:** ${module.action}\n**Allowed domains:** ${module.allowedDomains.length ? module.allowedDomains.join(", ") : "None"}`;
    }

    if (moduleId === "inviteFilter") {
        return `${modules[moduleId].description}\n\n**Status:** ${state(module.enabled)}\n**Action:** ${module.action}`;
    }

    if (moduleId === "antiRaid") {
        return `${modules[moduleId].description}\n\n**Status:** ${state(module.enabled)}\n**Join threshold:** ${module.joinThreshold}\n**Window:** ${module.interval}ms\n**Action:** ${module.action}`;
    }

    return `${modules[moduleId].description}\n\n**Status:** ${state(module.enabled)}`;
}

async function renderSecurityPanel({ interaction }) {

    const config = await getConfig(interaction.guild.id);

    const enabled =
        Object.keys(modules)
            .filter(key => config[key]?.enabled)
            .length;

    const embed = buildControlEmbed({
        guild: interaction.guild,
        title: "Security Center",
        description:
            `Configure Guardian's protection systems. **${enabled}/${Object.keys(modules).length}** protection modules are enabled.\n\nChoose a module below, or manage server-wide security lists.`
    });

    const select =
        new StringSelectMenuBuilder()
            .setCustomId("control:select:security")
            .setPlaceholder("Choose a security module")
            .addOptions([
                ...Object.entries(modules).map(
                    ([value, module]) => ({
                        label: module.label,
                        value,
                        description: module.description
                    })
                ),
                {
                    label: "Whitelist",
                    value: "whitelist",
                    description: "Manage per-module security exceptions"
                },
                {
                    label: "Ignored Channels",
                    value: "ignoredChannels",
                    description: "Exclude channels from security checks"
                },
                {
                    label: "Security Status",
                    value: "status",
                    description: "View all enabled modules"
                }
            ]);

    return interaction.update({
        embeds: [embed],
        components: [
            createActionRow([select]),
            createActionRow([
                createSecondaryButton({
                    customId: "control:home:panel",
                    label: "Home"
                })
            ])
        ]
    });
}

async function renderSecurityModulePanel({
    interaction,
    moduleId
}) {

    const config =
        await getConfig(
            interaction.guild.id
        );

    const session =
        getSession(
            interaction.message.id
        );


    if (
        session &&
        session.stagedConfig
    ) {

        for (
            const [path, value]
            of Object.entries(
                session.stagedConfig
            )
        ) {

            const parts =
                path.split(".");

            let current =
                config;

            while (
    parts.length > 1
) {

    const key =
        parts.shift();

    if (
        !current[key] ||
        typeof current[key] !== "object"
    ) {

        current[key] = {};
    }

    current =
        current[key];
}

            current[
                parts[0]
            ] = value;
        }
    }

    if (modules[moduleId]) {

        const module =
            config[moduleId];

        const embed =
            buildControlEmbed({

                guild:
                    interaction.guild,

                title:
                    modules[moduleId].label +
                    (
                        session?.dirty
                            ? " • Unsaved"
                            : ""
                    ),

                description:
                    moduleDescription(
                        moduleId,
                        config
                    )
            });

        const buttons = [

            createPrimaryButton({

                customId:
                    `control:security:toggle:${moduleId}`,

                label:
                    module.enabled
                        ? "Disable"
                        : "Enable"
            })
        ];

        if (
            moduleId !==
            "antiBot"
        ) {

            buttons.push(

                createSecondaryButton({

                    customId:
                        `control:security:configure:${moduleId}`,

                    label:
                        "Configure"
                })
            );
        }


          if (session?.dirty) {

    buttons.push(

        createPrimaryButton({

            customId:
                "control:security:save",

            label:
                "Save"
        })
    );
}



        buttons.push(

            createSecondaryButton({

                customId:
                    "control:security:back:none",

                label:
                    "Back"
            })
        );

        return interaction.update({

            embeds: [embed],

            components: [
                createActionRow(
                    buttons
                )
            ]
        });
    }

    if (moduleId === "whitelist") {

         const selected =
        session?.whitelistModule;

        const whitelist =
    selected &&
    config.whitelist?.[selected]
        ? config.whitelist[selected]
        : {};

const userCount =
    whitelist.users?.length || 0;

const roleCount =
    whitelist.roles?.length || 0;

       const embed =
    buildControlEmbed({

        guild:
            interaction.guild,

        title:
            "Security Whitelist",
        description:
    `Select a protection module to manage its whitelist.\n\n**Current Selection:** ${
        selected
            ? modules[selected].label
            : "None"
    }${
        selected
            ? `\n\n👤 **Users:** ${userCount}\n🛡️ **Roles:** ${roleCount}`
            : ""
    }`
    });

        return interaction.update({

            embeds: [embed],

            components: [

    createActionRow([

        new StringSelectMenuBuilder()

            .setCustomId(
                "control:select:whitelist"
            )

            .setPlaceholder(
                "Select protection module"
            )

            .addOptions([

                {
                    label: "Anti-Spam",
                    value: "antiSpam"
                },

                {
                    label: "Anti-Link",
                    value: "antiLink"
                },

                {
                    label: "Invite Filter",
                    value: "inviteFilter"
                },

                {
                    label: "Anti-Raid",
                    value: "antiRaid"
                },

                {
                    label: "Anti-Bot",
                    value: "antiBot"
                }
            ])
    ]),

    ...(selected
        ? [
            createActionRow([

                createPrimaryButton({

                    customId:
                        "control:whitelist:add",

                    label:
                        "Add"
                }),

                createSecondaryButton({

                    customId:
                        "control:whitelist:remove",

                    label:
                        "Remove"
                }),

                ...(session?.dirty
                    ? [
                        createPrimaryButton({

                            customId:
                                "control:security:save",

                            label:
                                "Save"
                        })
                    ]
                    : []),

                createSecondaryButton({

                    customId:
                        "control:security:back:none",

                    label:
                        "Back"
                })
            ])
        ]
        : [
            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:security:back:none",

                    label:
                        "Back"
                })
            ])
        ])
]
        });
    }

    if (moduleId === "status") {

    const securityModules = Object.entries(modules);

    const totalModules =
        securityModules.length;

    const activeModules =
        securityModules.filter(
            ([id]) =>
                config[id]?.enabled
        );

    const activeCount =
        activeModules.length;

    const rating =
        totalModules > 0
            ? Math.round(
                (activeCount / totalModules) * 100
            )
            : 0;

    const whitelist =
        config.whitelist || {};

    const whitelistUsers =
        Object.values(whitelist)
            .reduce(
                (total, module) =>
                    total +
                    (module?.users?.length || 0),
                0
            );

    const whitelistRoles =
        Object.values(whitelist)
            .reduce(
                (total, module) =>
                    total +
                    (module?.roles?.length || 0),
                0
            );

    const ignoredChannels =
        config.ignoredChannels?.length || 0;


    /*
     * Security rating bar
     */

    const barSize = 20;

    const filled =
        Math.round(
            (rating / 100) * barSize
        );

    const empty =
        barSize - filled;

    const ratingBar =
        "█".repeat(filled) +
        "░".repeat(empty);


    /*
     * Protection grid
     */

    const protectionGrid =
        securityModules
            .map(([id, module]) => {

                const enabled =
                    config[id]?.enabled;

                return `${
                    enabled
                        ? "🟢"
                        : "⚫"
                } **${module.label}** — ${
                    enabled
                        ? "**ONLINE**"
                        : "OFF"
                }`;

            })
            .join("\n");


    /*
     * Rating label
     */

    let ratingLabel;

    if (rating >= 80) {

        ratingLabel =
            "MAXIMUM";

    } else if (rating >= 60) {

        ratingLabel =
            "HIGH";

    } else if (rating >= 40) {

        ratingLabel =
            "MEDIUM";

    } else if (rating >= 20) {

        ratingLabel =
            "LOW";

    } else {

        ratingLabel =
            "CRITICAL";
    }


    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "🛡️ GUARDIAN // SECURITY",

            description:
                `**LIVE DEFENSE MONITOR**\n\n` +

                `⚡ **DEFENSE CORE**\n` +
                `${protectionGrid}\n\n` +

                `━━━━━━━━━━━━━━━━━━\n\n` +

                `🧠 **SECURITY RATING**\n` +
                `\`${ratingBar}\` **${rating}%**\n\n` +

                `**${activeCount} / ${totalModules}** defenses active • **${ratingLabel}**\n\n` +

                `👥 **WHITELIST**\n` +
                `Users: **${whitelistUsers}**\n` +
                `Roles: **${whitelistRoles}**\n\n` +

                `🔒 **IGNORED CHANNELS**\n` +
                `${ignoredChannels} channel${ignoredChannels === 1 ? "" : "s"}\n\n` +

                `━━━━━━━━━━━━━━━━━━\n\n` +

                `⚡ *Guardian is watching.*`
        });


    /*
     * Server icon → top-right
     */

    if (
        interaction.guild.iconURL
    ) {

        embed.setThumbnail(
            interaction.guild.iconURL({
                size: 256,
                extension: "png"
            })
        );
    }


    return interaction.update({

        embeds: [embed],

        components: [

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

    if (
    moduleId ===
    "ignoredChannels"
) {

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "Ignored Channels",

            description:
                `Security checks are skipped in these channels.\n\n**Ignored channels:** ${config.ignoredChannels.length}`
        });

    return interaction.update({

        embeds: [embed],

        components: [

            createActionRow([

                createPrimaryButton({

                    customId:
                        "control:security:ignored:add",

                    label:
                        "Add"
                }),

                createSecondaryButton({

                    customId:
                        "control:security:ignored:remove",

                    label:
                        "Remove"
                }),

                ...(session?.dirty
                    ? [

                        createPrimaryButton({

                            customId:
                                "control:security:save",

                            label:
                                "Save"
                        })

                    ]
                    : []),

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


    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "Security Status",

            description:
                Object.entries(
                    modules
                )
                    .map(
                        ([key, module]) =>
                            `• **${module.label}:** ${state(config[key]?.enabled)}`
                    )
                    .join("\n")
        });

    return interaction.update({

        embeds: [embed],

        components: [

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

module.exports = {
    modules,
    renderSecurityPanel,
    renderSecurityModulePanel
};