const controlSessions = require(
    "./controlSessions"
);

/**
 * Delete session
 */

function deleteSession(
    messageId
) {

    controlSessions.delete(
        messageId
    );
}

module.exports =
    deleteSession;