const validateSession = require(
    "./validateSession"
);

const refreshSession = require(
    "./refreshSession"
);

/**
 * Handle control session
 */

async function handleSession(
    interaction
) {

    /**
     * Validate ownership
     */
    const valid =
        await validateSession(
            interaction
        );

    if (!valid) {
        return false;
    }

    /**
     * Refresh inactivity timer
     */
    refreshSession(
        interaction.message.id
    );

    return true;
}

module.exports =
    handleSession;