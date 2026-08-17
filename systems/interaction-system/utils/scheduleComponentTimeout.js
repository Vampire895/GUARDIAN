const disableComponents = require("./disableComponents");

/**
 * Automatically disables message components after timeout.
 */

async function scheduleComponentTimeout({

    message,

    timeout = 15 * 60 * 1000 // 15 minutes

}) {

    setTimeout(async () => {

        try {

            const disabledRows =
                disableComponents(
                    message.components
                );

            await message.edit({
                components: disabledRows
            });

        } catch (error) {

            /**
             * Ignore:
             * - deleted messages
             * - missing permissions
             * - already edited messages
             */

            console.error(
                "[Component Timeout Error]",
                error.message
            );
        }

    }, timeout);
}

module.exports = scheduleComponentTimeout;