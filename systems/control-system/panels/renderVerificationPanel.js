const buildControlEmbed = require(
    "../utils/buildControlEmbed"
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
    getConfig
} = require(
    "../../security-system/config"
);

/**
 * Render verification panel
 */

async function renderVerificationPanel({
    interaction
}) {

    const config =
        await getConfig(
            interaction.guild.id
        );

    const verification =
        config.verification || {};

    const enabled =
        verification.enabled === true;

    const type =
        verification.type;

    const statusText =
        enabled
            ? "🟢 Enabled"
            : "🔴 Disabled";

    const methodText =
        type === "reaction"
            ? "🔘 Reaction Verification"
            : type === "self"
                ? "📝 Self Verification"
                : "Not configured";

    const channelText =
        verification.channelId
            ? `<#${verification.channelId}>`
            : "Not configured";

    const embed =
        buildControlEmbed({

            guild:
                interaction.guild,

            title:
                "🛡️ Verification Center",

            description:
`Protect your server with a simple member verification system.

**Current Status:** ${statusText}

**Method:** ${methodText}

**Channel:** ${channelText}

**Available Methods**
• 🔘 Reaction Verification
• 📝 Self Verification

${
    enabled
        ? "Verification is currently active for this server."
        : "Enable verification to get started."
}`
        });

    const homeButton =
    createSecondaryButton({

        customId:
            "control:home:panel",

        label:
            "🏠 Home"
    });

const rows = [];

if (!enabled) {

    const enableButton =
        createPrimaryButton({

            customId:
                "control:verification:enable",

            label:
                "✅ Enable Verification"
        });

    rows.push(

        createActionRow([

            enableButton,

            homeButton

        ])

    );

} else {

    const configureButton =
        createPrimaryButton({

            customId:
                "control:verification:type",

            label:
                "⚙️ Configure"
        });

    const disableButton =
        createSecondaryButton({

            customId:
                "control:verification:disable",

            label:
                "🔴 Disable"
        });

    rows.push(

        createActionRow([

            configureButton,

            disableButton

        ])

    );

    rows.push(

        createActionRow([

            homeButton

        ])

    );
}

   return interaction.update({

    embeds: [
        embed
    ],

    components:
        rows

});
}

module.exports =
    renderVerificationPanel;