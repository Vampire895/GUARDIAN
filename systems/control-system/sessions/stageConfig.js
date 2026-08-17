const getSession = require("./getSession");

/**
 * Stage configuration changes
 */
function stageConfig(
    messageId,
    changes
) {
    const session =
        getSession(messageId);

    if (!session) {
        return false;
    }

    session.stagedConfig = {

        ...session.stagedConfig,

        ...changes
    };

    session.dirty = true;

    return true;
}

module.exports =
    stageConfig;