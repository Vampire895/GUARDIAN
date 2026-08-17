const parseCustomId = require(
    "./utils/parseCustomId"
);

const buttonRegistry = require(
    "./registry/buttonRegistry"
);

const selectMenuRegistry = require(
    "./registry/selectMenuRegistry"
);

const modalRegistry = require(
    "./registry/modalRegistry"
);

const handleSession = require(
    "../control-system/sessions/handleSession"
);

/**
 * Central interaction router
 */

async function interactionRouter(
    interaction
) {

    if (!interaction.customId) {
        return;
    }

    const parsed =
        parseCustomId(
            interaction.customId
        );

    const handlerKey =
`${parsed.system}:${parsed.type}:${parsed.action}`;

    try {

        /**
         * Control session middleware
         */
        if (

            parsed.system ===
            "control"

        ) {

            const valid =
                await handleSession(
                    interaction
                );

            if (!valid) {
                return;
            }
        }

        /**
         * BUTTONS
         */
        if (interaction.isButton()) {

            const handler =
                buttonRegistry.get(
                    handlerKey
                );

            if (!handler) {
                return;
            }

            return handler(
                interaction,
                parsed
            );
        }

        /**
         * SELECT MENUS
         */
      if (

    interaction.isStringSelectMenu()

    ||

    interaction.isChannelSelectMenu()

    ||

    interaction.isUserSelectMenu()

    ||

    interaction.isRoleSelectMenu()

) {

    

   let handler =
    selectMenuRegistry.get(
        interaction.customId
    );

if (!handler) {

    const parts =
        interaction.customId.split(":");

    const baseCustomId =
        parts.slice(0, 4).join(":");

    handler =
        selectMenuRegistry.get(
            baseCustomId
        );
}

if (handler) {

    await handler(
        interaction,
        parsed
    );
}

return;

}

        /**
         * MODALS
         */
        if (
            interaction.isModalSubmit()
        ) {

            const handler =
                modalRegistry.get(
                    handlerKey
                );

            if (!handler) {
                return;
            }

            return handler(
                interaction,
                parsed
            );
        }

    } catch (error) {

        console.error(

            "[Interaction Router Error]",

            error
        );

        if (

            !interaction.replied

            &&

            !interaction.deferred

        ) {

            await interaction.reply({

                content:
                    "An interaction error occurred.",

                ephemeral: true
            });
        }
    }
}

module.exports =
    interactionRouter;