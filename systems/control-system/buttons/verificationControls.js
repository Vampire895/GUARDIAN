const buttonRegistry = require(
    "../../interaction-system/registry/buttonRegistry"
);

const selectMenuRegistry = require(
    "../../interaction-system/registry/selectMenuRegistry"
);

const renderVerificationPanel = require(
    "../panels/renderVerificationPanel"
);

const {
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

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

const modalRegistry = require(
    "../../interaction-system/registry/modalRegistry"
);

const {
    getConfig,
    updateConfig
} = require(
    "../../security-system/config"
);

/**
 * Open Verification Setup
 */

async function openVerificationSetup(
    interaction
) {

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "🛡️ Verification Setup",

            description:
`Set up Guardian's verification system.

Choose how members will verify themselves:

🔘 **Reaction Verification**
Members verify through a reaction-based verification panel.

🟢 **Self Verification**
Members verify by putting the required verification text in their Discord status.

You can configure the verification method, channel, and role in the next step.`
        });

    return interaction.update({

        embeds: [
            embed
        ],

        components: [

            createActionRow([

                createPrimaryButton({

                    customId:
                        "control:verification:type",

                    label:
                        "Choose Verification Type"
                }),

                createSecondaryButton({

                    customId:
                        "control:verification:back",

                    label:
                        "Back"
                })
            ])
        ]
    });
}


/**
 * Open Verification Type Selector
 */

async function openVerificationType(
    interaction
) {

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "🛡️ Choose Verification Type",

            description:
`Choose how members will verify themselves.

🔘 **Reaction Verification**
Members verify through Guardian's verification panel.

🟢 **Self Verification**
Members verify by putting an exact phrase in their Discord status.`
        });

    const select =
        new StringSelectMenuBuilder()

            .setCustomId(
                "control:verification:type:select"
            )

            .setPlaceholder(
                "Choose verification type"
            )

            .addOptions([

                {
                    label:
                        "Reaction Verification",

                    value:
                        "reaction",

                    description:
                        "Members verify through a reaction"
                },

                {
                    label:
                        "Self Verification",

                    value:
                        "self",

                    description:
                        "Members verify through their Discord status"
                }
            ]);

    return interaction.update({

        embeds: [
            embed
        ],

        components: [

            createActionRow([
                select
            ]),

            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:verification:enable",

                    label:
                        "Back"
                })
            ])
        ]
    });
}


/**
 * Handle Verification Type Selection
 */

async function selectVerificationType(
    interaction
) {

    const type =
        interaction.values[0];

    const title =
        type === "reaction"
            ? "🔘 Reaction Verification"
            : "🟢 Self Verification";

    const description =
        type === "reaction"
            ? `Reaction Verification selected.

Members will verify themselves through Guardian's verification panel.

📍 **Next Step**
Select the channel where Guardian should publish the verification panel.`
            : `Self Verification selected.

Members will verify by putting the required verification phrase in their Discord status.

📍 **Next Step**
Select the channel where Guardian should publish the verification panel.`;

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
                `control:verification:channel:${type}`
            )

            .setPlaceholder(
                "Select verification channel"
            )

            .setMinValues(1)

            .setMaxValues(1);

    return interaction.update({

        embeds: [
            embed
        ],

        components: [

            createActionRow([
                selector
            ]),

            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:verification:type",

                    label:
                        "Back"
                })
            ])
        ]
    });
}

/**
 * Handle Verification Channel Selection
 */

async function selectVerificationChannel(
    interaction
) {

    const parts =
        interaction.customId.split(":");

    const type =
        parts[3];

    const channelId =
        interaction.values[0];

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                type === "reaction"
                    ? "🔘 Reaction Verification"
                    : "🟢 Self Verification",

            description:
`Verification channel selected: <#${channelId}>

🎭 **Next Step**
Select the role(s) Guardian should assign after successful verification.

You can select multiple roles.`
        });

    const roleSelector =
        new RoleSelectMenuBuilder()

            .setCustomId(
                 `control:verification:roles:${type}:${channelId}`
            )

            .setPlaceholder(
                "Select verification role(s)"
            )

            .setMinValues(1)

            .setMaxValues(25);

    return interaction.update({

        embeds: [
            embed
        ],

        components: [

            createActionRow([
                roleSelector
            ]),

            createActionRow([

                createSecondaryButton({

                    customId:
                        "control:verification:type",

                    label:
                        "Back"
                })
            ])
        ]
    });
}

/**
 * Handle Verification Role Selection
 */

async function selectVerificationRoles(
    interaction
) {

    const parts =
        interaction.customId.split(":");

    const type =
        parts[3];

    const channelId =
        parts[4];

    const roleIds =
        interaction.values;

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                type === "reaction"
                    ? "🔘 Reaction Verification"
                    : "🟢 Self Verification",

            description:
`Verification channel:
<#${channelId}>

Selected role(s):
${roleIds.map(
    roleId => `<@&${roleId}>`
).join(", ")}

${
    type === "self"
        ? "📝 **Next Step**\nEnter the exact phrase members must put in their Discord status."
        : "💾 **Next Step**\nSave the verification configuration."
}`
        });

    if (type === "self") {

        const modal =
            new ModalBuilder()

                .setCustomId(
                    `control:verification:phrase:${channelId}:${roleIds.join(",")}`
                )

                .setTitle(
                    "📝 Self Verification Phrase"
                );

        const phraseInput =
            new TextInputBuilder()

                .setCustomId(
                    "phrase"
                )

                .setLabel(
                    "Exact verification phrase"
                )

                .setPlaceholder(
                    "Example: Guardian Verified"
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(
                    true
                )

                .setMinLength(
                    1
                )

                .setMaxLength(
                    100
                );

        modal.addComponents(

            new ActionRowBuilder().addComponents(
                phraseInput
            )
        );

        return interaction.showModal(
            modal
        );
    }

    return interaction.update({

        embeds: [
            embed
        ],

        components: [

            createActionRow([

                createPrimaryButton({

                    customId:
                        `control:verification:save:reaction:${channelId}:${roleIds.join(",")}`,

                    label:
                        "💾 Save"
                }),

                createSecondaryButton({

                    customId:
                        "control:verification:type",

                    label:
                        "Back"
                })
            ])
        ]
    });
}

async function saveReactionVerification(
    interaction,
    parsed
) {

    const data =
        parsed?.data
            ? parsed.data.split(":")
            : [];

    const type =
        data[0];

    const channelId =
        data[1];

    const roleIds =
        data[2]
            ? data[2].split(",").filter(Boolean)
            : [];

    if (
        type !== "reaction" ||
        !channelId ||
        !roleIds.length
    ) {

        return interaction.reply({

            content:
                "❌ Verification configuration is incomplete.",

            ephemeral: true
        });
    }

    /*
     * Get target channel
     */
    let channel;

    try {

        channel =
            await interaction.client.channels.fetch(
                channelId
            );

    } catch (error) {

        console.error(
            "[VERIFICATION] Failed to fetch verification channel:",
            error
        );

        return interaction.reply({

            content:
                "❌ Verification channel could not be found.",

            ephemeral: true
        });
    }

    if (!channel) {

        return interaction.reply({

            content:
                "❌ Verification channel could not be found.",

            ephemeral: true
        });
    }

    /*
     * Get existing verification configuration
     */
    const config =
        await getConfig(
            interaction.guild.id
        );

    const oldMessageId =
        config.verification?.messageId;

    const oldChannelId =
        config.verification?.channelId;

    /*
     * Delete old verification panel
     *
     * Only when an old configuration actually exists.
     */
    if (
        oldMessageId &&
        oldChannelId
    ) {

        try {

            const oldChannel =
                await interaction.client.channels.fetch(
                    oldChannelId
                );

            const oldMessage =
                await oldChannel.messages.fetch(
                    oldMessageId
                );

            await oldMessage.delete();

        } catch (error) {

            console.log(
                "[VERIFICATION] Old panel could not be deleted."
            );
        }
    }

    /*
     * Send new verification panel
     */
    const panel =
        await channel.send({

            embeds: [

                buildControlEmbed({

                    guild:
                        interaction.guild,

                    title:
                        "🛡️ Server Verification",

                    description:
`Welcome to **${interaction.guild.name}**.

Before accessing the server, please verify yourself.

Click the button below to confirm that you are a member of this community.

🔐 **Verification Required**
Your verification will grant you access to the verified areas of the server.`
                })

            ],

            components: [

                createActionRow([

                    createPrimaryButton({

                        customId:
                            "verification:verify:reaction",

                        label:
                            "✅ Verify Me"
                    })
                ])
            ]
        });

    /*
     * Save verification configuration
     */
    await updateConfig(

        interaction.guild.id,

        {

            "verification.enabled":
                true,

            "verification.type":
                "reaction",

            "verification.channelId":
                channelId,

            "verification.roleIds":
                roleIds,

            "verification.phrase":
                null,

            "verification.messageId":
                panel.id
        }
    );

    return interaction.reply({

        content:
            `✅ Reaction Verification enabled!\n\n📨 Panel sent to <#${channelId}>.`,

        ephemeral: true
    });
}

async function saveSelfVerification(
    interaction,
    parsed
) {

    const data =
        parsed?.data
            ? parsed.data.split(":")
            : [];

    const type =
        data[0];

    const channelId =
        data[1];

    const roleIds =
        data[2]
            ? data[2].split(",").filter(Boolean)
            : [];

    const encodedPhrase =
        data.slice(3).join(":");

    const phrase =
        encodedPhrase
            ? decodeURIComponent(encodedPhrase)
            : "";

    if (
        type !== "self" ||
        !channelId ||
        !roleIds.length ||
        !phrase
    ) {

        return interaction.reply({

            content:
                "❌ Self Verification configuration is incomplete.",

            ephemeral: true
        });
    }

    /*
     * Get target channel
     */
    let channel;

    try {

        channel =
            await interaction.client.channels.fetch(
                channelId
            );

    } catch (error) {

        console.error(
            "[VERIFICATION] Failed to fetch self verification channel:",
            error
        );

        return interaction.reply({

            content:
                "❌ Verification channel could not be found.",

            ephemeral: true
        });
    }

    if (!channel) {

        return interaction.reply({

            content:
                "❌ Verification channel could not be found.",

            ephemeral: true
        });
    }

    /*
     * Get existing verification configuration
     */
    const config =
        await getConfig(
            interaction.guild.id
        );

    const oldMessageId =
        config.verification?.messageId;

    const oldChannelId =
        config.verification?.channelId;

    /*
     * Delete old verification panel
     */
    if (
        oldMessageId &&
        oldChannelId
    ) {

        try {

            const oldChannel =
                await interaction.client.channels.fetch(
                    oldChannelId
                );

            const oldMessage =
                await oldChannel.messages.fetch(
                    oldMessageId
                );

            await oldMessage.delete();

        } catch (error) {

            console.log(
                "[VERIFICATION] Old panel could not be deleted."
            );
        }
    }

    /*
     * Send Self Verification panel
     */
    const panel =
        await channel.send({

            embeds: [

                buildControlEmbed({

                    guild:
                        interaction.guild,

                    title:
                        "🟢 Self Verification",

                    description:
`Welcome to **${interaction.guild.name}**.

To verify yourself, put the exact phrase below in your **Discord Custom Status**.

📝 **Required Status**
\`${phrase}\`

After setting your status, click the button below.

⚠️ Your status must contain the exact phrase shown above.`
                })

            ],

            components: [

                createActionRow([

                    createPrimaryButton({

                        customId:
                            "verification:verify:self",

                        label:
                            "✅ Verify Me"
                    })
                ])
            ]
        });

    /*
     * Save verification configuration
     */
    await updateConfig(

        interaction.guild.id,

        {

            "verification.enabled":
                true,

            "verification.type":
                "self",

            "verification.channelId":
                channelId,

            "verification.roleIds":
                roleIds,

            "verification.phrase":
                phrase,

            "verification.messageId":
                panel.id
        }
    );

    return interaction.reply({

        content:
            `✅ Self Verification enabled!\n\n📨 Panel sent to <#${channelId}>.`,

        ephemeral: true
    });
}

async function saveVerificationPhrase(
    interaction
) {

    const parts =
        interaction.customId.split(":");

    const channelId =
        parts[3];

    const roleIds =
        parts[4]
            ? parts[4].split(",").filter(Boolean)
            : [];

    const phrase =
        interaction.fields
            .getTextInputValue("phrase")
            .trim();

    if (!phrase) {

        return interaction.reply({

            content:
                "❌ Verification phrase cannot be empty.",

            ephemeral: true
        });
    }

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "🟢 Self Verification",

            description:
`📍 **Channel**
<#${channelId}>

🎭 **Role(s)**
${roleIds
    .map(roleId => `<@&${roleId}>`)
    .join(", ")}

📝 **Exact Phrase**
\`${phrase}\`

Everything is configured and ready to save.`
        });

    return interaction.update({

        embeds: [
            embed
        ],

        components: [

            createActionRow([

                createPrimaryButton({

                    customId:
                       `control:verification:save:self:${channelId}:${roleIds.join(",")}:${encodeURIComponent(phrase)}`,

                    label:
                        "💾 Save"
                }),

                createSecondaryButton({

                    customId:
                        "control:verification:type",

                    label:
                        "Back"
                })
            ])
        ],

        
    });
}

async function handleVerification(
    interaction
) {

    const config =
        await getConfig(
            interaction.guild.id
        );

    const verification =
        config.verification;

    if (
        !verification ||
        !verification.enabled ||
        verification.type !== "reaction"
    ) {

        return interaction.reply({

            content:
                "❌ Verification is currently disabled.",

            ephemeral: true
        });
    }

    const roleIds =
        verification.roleIds || [];

    if (!roleIds.length) {

        return interaction.reply({

            content:
                "❌ No verification roles are configured.",

            ephemeral: true
        });
    }

    const member =
        interaction.member;

    const addedRoles = [];

    for (const roleId of roleIds) {

        try {

            const role =
                await interaction.guild.roles.fetch(
                    roleId
                );

            if (!role) {
                continue;
            }

            if (
                member.roles.cache.has(
                    role.id
                )
            ) {
                continue;
            }

            await member.roles.add(
                role
            );

            addedRoles.push(role);

        } catch (error) {

            console.error(
                `[VERIFICATION] Failed to assign role ${roleId}:`,
                error
            );
        }
    }

    if (!addedRoles.length) {

        if (
            roleIds.every(
                roleId =>
                    member.roles.cache.has(roleId)
            )
        ) {

            return interaction.reply({

                content:
                    "✅ You are already verified!",

                ephemeral: true
            });
        }

        return interaction.reply({

            content:
                "❌ I couldn't assign the verification role(s). Please check Guardian's role hierarchy and permissions.",

            ephemeral: true
        });
    }

    return interaction.reply({

        content:
            "✅ You have been successfully verified! Welcome to the server. 🎉",

        ephemeral: true
    });
}

async function handleSelfVerification(
    interaction
) {

    const config =
        await getConfig(
            interaction.guild.id
        );

    const verification =
        config.verification;

    if (
        !verification ||
        !verification.enabled ||
        verification.type !== "self"
    ) {

        return interaction.reply({

            content:
                "❌ Verification is currently disabled.",

            ephemeral: true
        });
    }

    const phrase =
        verification.phrase?.trim();

    if (!phrase) {

        return interaction.reply({

            content:
                "❌ No verification phrase is configured.",

            ephemeral: true
        });
    }

    const member =
        interaction.member;

    /*
     * Find member's Discord Custom Status
     */
    const customStatus =
        member.presence?.activities?.find(
            activity =>
                activity.type === 4
        );

    const statusText =
        customStatus?.state || "";

    /*
     * Check whether the required phrase
     * exists inside the Custom Status.
     */
    if (
        !statusText.includes(phrase)
    ) {

        return interaction.reply({

            content:
                `❌ Your Discord Custom Status does not contain the required phrase.\n\n📝 Required phrase: \`${phrase}\``,

            ephemeral: true
        });
    }

    const roleIds =
        verification.roleIds || [];

    if (!roleIds.length) {

        return interaction.reply({

            content:
                "❌ No verification roles are configured.",

            ephemeral: true
        });
    }

    const addedRoles = [];

    for (const roleId of roleIds) {

        try {

            const role =
                await interaction.guild.roles.fetch(
                    roleId
                );

            if (!role) {
                continue;
            }

            if (
                member.roles.cache.has(
                    role.id
                )
            ) {
                continue;
            }

            await member.roles.add(
                role
            );

            addedRoles.push(role);

        } catch (error) {

            console.error(
                `[VERIFICATION] Failed to assign role ${roleId}:`,
                error
            );
        }
    }

    if (!addedRoles.length) {

        if (
            roleIds.every(
                roleId =>
                    member.roles.cache.has(roleId)
            )
        ) {

            return interaction.reply({

                content:
                    "✅ You are already verified!",

                ephemeral: true
            });
        }

        return interaction.reply({

            content:
                "❌ I couldn't assign the verification role(s). Please check Guardian's role hierarchy and permissions.",

            ephemeral: true
        });
    }

    return interaction.reply({

        content:
            "✅ You have been successfully verified! Welcome to the server. 🎉",

        ephemeral: true
    });
}

async function disableVerification(
    interaction
) {

    await updateConfig(

        interaction.guild.id,

        {

            "verification.enabled":
                false

        }
    );

    return renderVerificationPanel({

        interaction

    });
}

/**
 * Button Registrations
 */

buttonRegistry.set(

    "control:verification:enable",

    openVerificationSetup
);


buttonRegistry.set(

    "control:verification:type",

    openVerificationType
);


buttonRegistry.set(

    "control:verification:back",

    interaction =>
        renderVerificationPanel({
            interaction
        })
);


/**
 * Select Menu Registrations
 */

selectMenuRegistry.set(

    "control:verification:type:select",

    selectVerificationType
);

selectMenuRegistry.set(

    "control:verification:type:select",

    selectVerificationType
);


selectMenuRegistry.set(

    "control:verification:channel:reaction",

    selectVerificationChannel
);


selectMenuRegistry.set(

    "control:verification:channel:self",

    selectVerificationChannel
);

selectMenuRegistry.set(

    "control:verification:roles:reaction",

    selectVerificationRoles
);


selectMenuRegistry.set(

    "control:verification:roles:self",

    selectVerificationRoles
);

modalRegistry.set(

    "control:verification:phrase",

    saveVerificationPhrase
);

buttonRegistry.set(
    "control:verification:save",
    async (interaction, parsed) => {

        const data =
            parsed.data
                ? parsed.data.split(":")
                : [];

        const type =
            data[0];

        if (type === "reaction") {

            return saveReactionVerification(
                interaction,
                parsed
            );
        }

        if (type === "self") {

            return saveSelfVerification(
                interaction,
                parsed
            );
        }

        return interaction.reply({

            content:
                "❌ Unknown verification type.",

            ephemeral: true
        });
    }
);

buttonRegistry.set(
    "verification:verify:reaction",
    handleVerification
);

buttonRegistry.set(
    "verification:verify:self",
    handleSelfVerification
);

buttonRegistry.set(

    "control:verification:disable",

    disableVerification

);