const getSession = require(
    "./getSession"
);

/**
 * Validate session ownership
 */

async function validateSession(
    interaction
) {

    const session =
        getSession(
            interaction.message.id
        );

    /**
     * Missing session
     */
    if (!session) {

        await interaction.reply({

            content:
                "❌ This control session no longer exists.",

            ephemeral: true
        });

        return false;
    }

    /**
     * Invalid owner
     */
    if (

        interaction.user.id
        !==
        session.ownerId

    ) {

        await interaction.reply({

            content:
                "❌ This control session belongs to another user.",

            ephemeral: true
        });

        return false;
    }

    return true;
}

module.exports =
    validateSession;