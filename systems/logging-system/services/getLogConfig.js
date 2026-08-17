const LogConfig = require(
    "../../../database/models/LogConfig"
);

/**
 * Gets or creates guild log config.
 */

async function getLogConfig(guildId) {

    let config = await LogConfig.findOne({
        guildId
    });

    if (!config) {

        config = await LogConfig.create({
            guildId
        });
    }

    return config;
}

module.exports = getLogConfig;