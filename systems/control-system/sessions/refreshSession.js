const controlSessions = require(
    "./controlSessions"
);

/**
 * Refresh session timeout
 */

function refreshSession(
    messageId
) {

    const session =
        controlSessions.get(
            messageId
        );

    if (!session) return;

    session.expiresAt =
        Date.now()
        + (3 * 60 * 1000);
}

module.exports =
    refreshSession;