const buildControlEmbed = require(
    "../utils/buildControlEmbed"
);

const createSecondaryButton = require(
    "../../../ui/buttons/createSecondaryButton"
);

const createActionRow = require(
    "../../../ui/actionRows/createActionRow"
);

/**
 * Render logging panel
 */

async function renderLoggingPanel({

    interaction
}) {

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "📜 Logging Center",

            description:

`Configure and manage logging systems.

Modules:
• Moderation Logs
• Message Logs
• Member Logs
• Voice Logs
• Server Logs`
        });

    const homeButton =
        createSecondaryButton({

            customId:
                "control:home:panel",

            label:
                "🏠 Home"
        });

    await interaction.update({

        embeds: [embed],

        components: [

            createActionRow([
                homeButton
            ])
        ]
    });
}

module.exports =
    renderLoggingPanel;