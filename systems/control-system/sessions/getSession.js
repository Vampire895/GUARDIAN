const controlSessions = require(
    "./controlSessions"
);

/**
 * Get session
 */

function getSession(
    messageId
) {

    return controlSessions.get(
        messageId
    );
}

module.exports =
    getSession;