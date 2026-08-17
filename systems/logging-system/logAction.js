const getLogConfig = require(
    "./services/getLogConfig"
);

/**
 * Central logging dispatcher.
 */

async function logAction({

    guild,

    category,

    embeds = [],

    content = null

}) {

    try {

        /**
         * Validate guild
         */
        if (!guild) return;

        /**
         * Get logging config
         */
        const config =
            await getLogConfig(
                guild.id
            );

        /**
         * Validate category
         */
        const categoryConfig =
            config.categories[category];

        if (!categoryConfig) {
            return;
        }

        /**
         * Logging disabled
         */
        if (!categoryConfig.enabled) {
            return;
        }

        /**
         * Missing channel
         */
        if (!categoryConfig.channelId) {
            return;
        }

        /**
         * Resolve channel
         */
        const channel =
            guild.channels.cache.get(
                categoryConfig.channelId
            );

        if (!channel) {
            return;
        }

        /**
         * Send log
         */
        await channel.send({

            content,

            embeds
        });

    } catch (error) {

        console.error(

            "[Logging Dispatcher Error]",

            error
        );
    }
}

module.exports = logAction;