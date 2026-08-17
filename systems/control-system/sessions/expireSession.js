const deleteSession = require(
    "./deleteSession"
);

/**
 * Expire control session
 *
 * Deletes the Control Center message
 * and removes the session from RAM.
 *
 * Expiry is intentionally silent.
 */

async function expireSession({

    client,

    messageId,

    channelId,

    guildId

}) {

    try {

        /**
         * Resolve guild
         */
        const guild =
            client.guilds.cache.get(
                guildId
            );

        if (!guild) {

            deleteSession(
                messageId
            );

            return;
        }

        /**
         * Resolve channel
         */
        const channel =
            guild.channels.cache.get(
                channelId
            );

        if (!channel) {

            deleteSession(
                messageId
            );

            return;
        }

        /**
         * Fetch and delete
         */
        try {

            const message =
                await channel.messages.fetch(
                    messageId
                );

            if (message) {

                await message.delete();

            }

        } catch (error) {

            /**
             * Message may already be deleted.
             *
             * Expiry should remain silent.
             */
        }

        /**
         * Remove session from RAM
         */
        deleteSession(
            messageId
        );

    } catch (error) {

        /**
         * Session expiry is intentionally silent.
         *
         * Do not print errors to terminal.
         */

        deleteSession(
            messageId
        );
    }
}

module.exports =
    expireSession;