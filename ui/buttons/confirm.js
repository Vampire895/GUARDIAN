const {

    ButtonStyle,

    ComponentType

} = require("discord.js");

const createInfoEmbed = require(
    "../embeds/createInfoEmbed"
);

const createSuccessEmbed = require(
    "../embeds/createSuccessEmbed"
);

const createWarningEmbed = require(
    "../embeds/createWarningEmbed"
);

const createDangerButton = require(
    "./createDangerButton"
);

const createSecondaryButton = require(
    "./createSecondaryButton"
);

const createActionRow = require(
    "../actionRows/createActionRow"
);

const disableComponents = require(
    "../../systems/interaction-system/utils/disableComponents"
);

/**
 * Reusable confirmation system.
 */

async function confirmAction({

    message,

    userId,

    content

}) {

    /**
     * Buttons
     */
    const confirmButton =
        createDangerButton({

            customId:
                "confirm",

            label:
                "Confirm"
        });

    const cancelButton =
        createSecondaryButton({

            customId:
                "cancel",

            label:
                "Cancel"
        });

    const row =
        createActionRow([

            confirmButton,

            cancelButton
        ]);

    /**
     * Confirmation embed
     */
    const embed =
        createInfoEmbed({

            title:
                "Confirmation Required",

            description:
                content
        });

    /**
     * Send confirmation panel
     */
    const panel =
        await message.reply({

            embeds: [embed],

            components: [row]
        });

    return new Promise((resolve) => {

        const collector =
            panel.createMessageComponentCollector({

                componentType:
                    ComponentType.Button,

                time:
                    30000
            });

        collector.on(

            "collect",

            async interaction => {

                /**
                 * Wrong user
                 */
                if (
                    interaction.user.id !== userId
                ) {

                    return interaction.reply({

                        embeds: [

                            createWarningEmbed({

                                description:
                                    "This confirmation is not for you."
                            })
                        ],

                        flags: 64
                    });
                }

                /**
                 * Confirmed
                 */
                if (
                    interaction.customId === "confirm"
                ) {

                    collector.stop("confirmed");

                    const disabledRows =
                        disableComponents(
                            panel.components
                        );

                    await interaction.update({

                        embeds: [

                            createSuccessEmbed({

                                title:
                                    "Confirmed",

                                description:
                                    "Action confirmed successfully."
                            })
                        ],

                        components:
                            disabledRows
                    });

                    return resolve(true);
                }

                /**
                 * Cancelled
                 */
                if (
                    interaction.customId === "cancel"
                ) {

                    collector.stop("cancelled");

                    const disabledRows =
                        disableComponents(
                            panel.components
                        );

                    await interaction.update({

                        embeds: [

                            createWarningEmbed({

                                title:
                                    "Cancelled",

                                description:
                                    "Action cancelled."
                            })
                        ],

                        components:
                            disabledRows
                    });

                    return resolve(false);
                }
            }
        );

        /**
         * Timeout
         */
        collector.on(

            "end",

            async (_, reason) => {

                if (
                    reason === "confirmed"
                    ||
                    reason === "cancelled"
                ) {
                    return;
                }

                try {

                    const disabledRows =
                        disableComponents(
                            panel.components
                        );

                    await panel.edit({

                        embeds: [

                            createWarningEmbed({

                                title:
                                    "Expired",

                                description:
                                    "Confirmation timed out."
                            })
                        ],

                        components:
                            disabledRows
                    });

                } catch (error) {}

                resolve(false);
            }
        );
    });
}

module.exports = {
    confirmAction
};