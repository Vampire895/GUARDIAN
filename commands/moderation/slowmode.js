const { checkPermissions } = require(
    "../../systems/permission-system"
);

const { confirmAction } = require(
    "../../ui/buttons/confirm"
);

const logAction = require(
    "../../systems/logging-system/logAction"
);

const {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed
} = require("../../ui/embeds");

const name = "slowmode";

const aliases = [
    "slowdown",
    "slow"
];

const description =
    "Set slowmode for the channel.";

/**
 * Parse slowmode time
 */

function parseTime(str) {

    if (!str) return null;

    const match =
        str.match(/^(\d+)(s|m)$/);

    if (!match) return null;

    const num =
        parseInt(match[1]);

    const unit =
        match[2];

    if (unit === "s") {
        return num;
    }

    if (unit === "m") {
        return num * 60;
    }
}

/**
 * Execute command
 */

async function execute(message, args) {

    const input =
        args[0];

    const botMember =
        message.guild.members.me;

    /**
     * Validate input
     */
    if (!input) {

        return message.reply({

            embeds: [

                createErrorEmbed(

`Provide time:

5s
1m

OR use:
off`
                )
            ]
        });
    }

    /**
     * Permission check
     */
    const permCheck =
        checkPermissions({

            member:
                message.member,

            botMember,

            requiredPermissions: [
                "ManageChannels"
            ]
        });

    if (!permCheck.success) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Missing permissions."
                )
            ]
        });
    }

    /**
     * Disable slowmode
     */
    if (

        input.toLowerCase()
        === "off"

    ) {

        /**
         * Confirmation
         */
        const confirmed =
            await confirmAction({

                message,

                userId:
                    message.author.id,

                content:
                    `Disable slowmode in ${message.channel}?`
            });

        if (!confirmed) return;

        try {

            await message.channel
                .setRateLimitPerUser(0);

        } catch (error) {

            return message.reply({

                embeds: [
                    createErrorEmbed(
                        "Failed to disable slowmode."
                    )
                ]
            });
        }

        /**
         * Success embed
         */
        const successEmbed =
            createSuccessEmbed(

`🐢 Slowmode Disabled

Channel:
${message.channel}`
            );

        await message.reply({

            embeds: [successEmbed]
        });

        /**
         * Moderation log
         */
        const logEmbed =
            createInfoEmbed(

`🐢 Slowmode Disabled

Moderator:
${message.author.tag}

Channel:
${message.channel}`
            );

        await logAction({

            guild:
                message.guild,

            category:
                "moderation",

            embeds: [logEmbed]
        });

        return;
    }

    /**
     * Parse duration
     */
    const seconds =
        parseTime(input);

    if (seconds === null) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Invalid format. Use 5s or 1m."
                )
            ]
        });
    }

    /**
     * Confirmation
     */
    const confirmed =
        await confirmAction({

            message,

            userId:
                message.author.id,

            content:

`Set slowmode in ${message.channel}

to ${input}?`
        });

    if (!confirmed) return;

    /**
     * Execute slowmode
     */
    try {

        await message.channel
            .setRateLimitPerUser(seconds);

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to set slowmode."
                )
            ]
        });
    }

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`🐢 Slowmode Enabled

Channel:
${message.channel}

Duration:
${input}`
        );

    /**
     * Send success response
     */
    await message.reply({

        embeds: [successEmbed]
    });

    /**
     * Moderation log embed
     */
    const logEmbed =
        createInfoEmbed(

`🐢 Slowmode Updated

Moderator:
${message.author.tag}

Channel:
${message.channel}

Duration:
${input}`
        );

    /**
     * Dispatch moderation log
     */
    await logAction({

        guild:
            message.guild,

        category:
            "moderation",

            embeds: [logEmbed]
    });
}

module.exports = {

    name,

    aliases,

    description,

    execute
};