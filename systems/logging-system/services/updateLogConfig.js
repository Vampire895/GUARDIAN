const LogConfig = require(
    "../../../database/models/LogConfig"
);

/**
 * Updates logging category config.
 */

async function updateLogConfig({

    guildId,
    category,
    data

}) {

    return await LogConfig.findOneAndUpdate(

        { guildId },

        {
            $set: {
                [`categories.${category}`]: data
            }
        },

        {
            upsert: true,

            returnDocument: "after"
        }
    );
}

module.exports = updateLogConfig;