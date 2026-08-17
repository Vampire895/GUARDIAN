const buttonRegistry = require(
    "../../interaction-system/registry/buttonRegistry"
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

const logCategories = require(
    "../utils/logCategories"
);

const getLogConfig = require(
    "../services/getLogConfig"
);

const buildLogStatus = require(
    "../services/buildLogStatus"
);

const {
    ChannelSelectMenuBuilder,
    ChannelType
} = require("discord.js");

/**
 * Logging category button handler.
 */

async function execute(interaction, parsed) {

    const selectedCategory =
        parsed.action;

    const config =
        await getLogConfig(
            interaction.guild.id
        );

    const categoryConfig =
        config.categories[selectedCategory];

    /**
     * Build embed
     */
    const embed = createInfoEmbed({

    title:
        `${selectedCategory} Logs`,

    description:
`Status: ${buildLogStatus(categoryConfig)}

Channel:
${categoryConfig.channelId
? `<#${categoryConfig.channelId}>`
: "Not Configured"}`
});

    /**
     * Category buttons
     */
    const buttons = logCategories.map(category => {

        return createSecondaryButton({

            customId:
                `logs:button:${category}`,

            label:
                category.charAt(0).toUpperCase()
                + category.slice(1),

            disabled:
                category === selectedCategory
        });
    });

    /**
     * Toggle button
     */
    const toggleButton =
        createPrimaryButton({

            customId:
                `logs-toggle:button:${selectedCategory}`,

            label:
                categoryConfig.enabled
                    ? "Disable Logs"
                    : "Enable Logs"
        });

        /**
 * Channel selector
 */
const channelSelect =
    new ChannelSelectMenuBuilder()

        .setCustomId(
            `logs-channel:select:${selectedCategory}`
        )

        .setPlaceholder(
            "Select Logging Channel"
        )

        .addChannelTypes(
            ChannelType.GuildText
        );
         

    /**
     * Build rows
     */
    const rows = [];

    for (let i = 0; i < buttons.length; i += 5) {

        rows.push(
            createActionRow(
                buttons.slice(i, i + 5)
            )
        );
    }

    rows.push(
        createActionRow([
            toggleButton
        ])
    );

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
 * Register handlers dynamically.
 */

for (const category of logCategories) {

    buttonRegistry.set(

        `logs:button:${category}`,

        execute
    );
}

console.log(
    "[Logging System] Category buttons loaded."
);