const controlSessions = require(
    "./controlSessions"
);

/**
 * Create control session
 */

function createSession({

    messageId,

    ownerId,

    guildId,

    channelId

}) {

    controlSessions.set(

        messageId,

        {
            ownerId,

            guildId,

            channelId,

            stagedConfig: {},

            dirty: false,

            activeModule: null,

            whitelistModule: null,

            dashboardMessageId: messageId,

            createdAt:
                Date.now(),

            expiresAt:
                Date.now()
                + (10 * 60 * 1000)
        }
    );
}

module.exports =
    createSession;