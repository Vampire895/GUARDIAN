const selectMenuRegistry = require(
    "../../interaction-system/registry/selectMenuRegistry"
);

const createInfoEmbed = require(
    "../../../ui/embeds/createInfoEmbed"
);

const createPrimaryButton = require(
    "../../../ui/buttons/createPrimaryButton"
);

const createSecondaryButton = require(
    "../../../ui/buttons/createSecondaryButton"
);

const createActionRow = require(
    "../../../ui/actionRows/createActionRow"
);

const {
    ChannelSelectMenuBuilder,
    ChannelType
} = require("discord.js");

const logCategories = require(
    "../utils/logCategories"
);

const getLogConfig = require(
    "../services/getLogConfig"
);

const updateLogConfig = require(
    "../services/updateLogConfig"
);

const buildLogStatus = require(
    "../services/buildLogStatus"
);

/**
 * Logging channel select handler.
 */

async function execute(interaction, parsed) {

    const category =
        parsed.action;

    /**
     * Get selected channel
     */
    const selectedChannel =
        interaction.guild.channels.cache.get(
            interaction.values[0]
        );

    if (!selectedChannel) {

        return interaction.reply({

            content:
                "Selected channel could not be resolved.",

            flags: 64
        });
    }

    /**
     * Get current config
     */
    const config =
        await getLogConfig(
            interaction.guild.id
        );

    const currentCategory =
        config.categories[category];

    /**
     * Save channel
     */
    await updateLogConfig({

        guildId:
            interaction.guild.id,

        category,

        data: {

            enabled:
                currentCategory.enabled,

            channelId:
                selectedChannel.id
        }
    });

    /**
     * Refresh config
     */
    const updatedConfig =
        await getLogConfig(
            interaction.guild.id
        );

    const updatedCategory =
        updatedConfig.categories[category];

    /**
     * Build embed
     */
    const embed =
        createInfoEmbed({

            title:
                `${category} Logs`,

            description:
`Status: ${buildLogStatus(updatedCategory)}

Channel:
${updatedCategory.channelId
? `<#${updatedCategory.channelId}>`
: "Not Configured"}`
        });

    /**
     * Category buttons
     */
    const categoryButtons =
        logCategories.map(cat => {

            return createSecondaryButton({

                customId:
                    `logs:button:${cat}`,

                label:
                    cat.charAt(0).toUpperCase()
                    + cat.slice(1),

                disabled:
                    cat === category
            });
        });

    /**
     * Toggle button
     */
    const toggleButton =
        createPrimaryButton({

            customId:
                `logs-toggle:button:${category}`,

            label:
                updatedCategory.enabled
                    ? "Disable Logs"
                    : "Enable Logs"
        });

    /**
     * Channel selector
     */
    const channelSelect =
        new ChannelSelectMenuBuilder()

            .setCustomId(
                `logs-channel:select:${category}`
            )

            .setPlaceholder(
                "Select Logging Channel"
            )

            .addChannelTypes(

                ChannelType.GuildText,

                ChannelType.GuildAnnouncement
            );

    /**
     * Build rows
     */
    const rows = [];

    for (
        let i = 0;
        i < categoryButtons.length;
        i += 5
    ) {

        rows.push(
            createActionRow(
                categoryButtons.slice(i, i + 5)
            )
        );
    }

    /**
     * Toggle row
     */
    rows.push(
        createActionRow([
            toggleButton
        ])
    );

    /**
     * Channel selector row
     */
    rows.push(
        createActionRow([
            channelSelect
        ])
    );

    /**
     * Update panel
     */
    await interaction.update({

        embeds: [embed],

        components: rows
    });
}

/**
 * Dynamic registration
 */

for (const category of logCategories) {

    selectMenuRegistry.set(

        `logs-channel:select:${category}`,

        execute
    );
}

console.log(
    "[Logging System] Channel selects loaded."
);