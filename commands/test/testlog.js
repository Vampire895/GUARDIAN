const createInfoEmbed = require(
    "../../ui/embeds/createInfoEmbed"
);

const logAction = require(
    "../../systems/logging-system/logAction"
);

module.exports = {

    name: "testlog",

    description: "Tests logging dispatcher.",

    async execute(message) {

        const embed =
            createInfoEmbed({

                title: "Logging Test",

                description:
                    "Central logging dispatcher working."
            });

        await logAction({

            guild:
                message.guild,

            category:
                "moderation",

            embeds: [embed]
        });

        await message.reply({

            content:
                "Test log dispatched."
        });
    }
};