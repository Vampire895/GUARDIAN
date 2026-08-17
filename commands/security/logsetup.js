const buildLogSetupPanel = require(
    "../../systems/logging-system/panels/buildLogSetupPanel"
);

const scheduleComponentTimeout = require(
    "../../systems/interaction-system/utils/scheduleComponentTimeout"
);

module.exports = {

    name: "logsetup",

    description: "Opens logging setup panel.",

    async execute(message) {

        const panel =
            buildLogSetupPanel();

        const sentMessage =
            await message.reply(panel);

        scheduleComponentTimeout({
            message: sentMessage
        });
    }
};