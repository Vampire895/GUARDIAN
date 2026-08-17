const controlSessions = require(
    "./controlSessions"
);

const expireSession = require(
    "./expireSession"
);

/**
 * Start session sweeper
 */

function startSessionSweeper(
    client
) {

    setInterval(async () => {

        const now =
            Date.now();

        /**
         * Scan sessions
         */
        for (

            const [

                messageId,

                session

            ]

            of controlSessions

        ) {

            /**
             * Expired
             */
            if (

                now >=
                session.expiresAt

            ) {

                await expireSession({

                    client,

                    messageId,

                    guildId:
                        session.guildId,

                    channelId:
                        session.channelId
                });
            }
        }

    }, 60 * 1000);
}

module.exports =
    startSessionSweeper;