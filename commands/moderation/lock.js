const {

    ChannelType,

    PermissionsBitField

} = require("discord.js");

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

const name = "lock";

const aliases = [
    "lockall"
];

const description =
    "Lock channels in the server.";

/**
 * Lock a single channel
 */

async function lockChannel(channel, guild) {

    await channel.permissionOverwrites.edit(

        guild.roles.everyone,

        {
            SendMessages: false
        }
    );
}

/**
 * Execute command
 */

async function execute(message) {

    const botMember =
        message.guild.members.me;

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
     * LOCK ALL CHANNELS
     */
    if (

        message.content
            .toLowerCase()
            .startsWith(".lockall")

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
                    "Lock all unlocked channels in this server?"
            });

        if (!confirmed) return;

        let lockedCount = 0;

        /**
         * Filter channels
         */
        const channels =
            message.guild.channels.cache.filter(

                channel =>

                    channel.type ===
                    ChannelType.GuildText
            );

        /**
         * Lock channels
         */
        for (const [, channel] of channels) {

            try {

                const overwrite =
                    channel.permissionOverwrites.cache.get(
                        message.guild.roles.everyone.id
                    );

                /**
                 * Skip already locked
                 */
                if (
                    overwrite?.deny?.has(
                        PermissionsBitField.Flags.SendMessages
                    )
                ) {
                    continue;
                }

                await lockChannel(
                    channel,
                    message.guild
                );

                lockedCount++;

            } catch (error) {}
        }

        /**
         * Success embed
         */
        const successEmbed =
            createSuccessEmbed(

`🔒 Server Lockdown Complete

Locked Channels:
${lockedCount}`
            );

        await message.reply({

            embeds: [successEmbed]
        });

        /**
         * Log embed
         */
        const logEmbed =
            createInfoEmbed(

`🔒 Server Lockdown

Moderator:
${message.author.tag}

Locked Channels:
${lockedCount}`
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

        return;
    }

    /**
     * CURRENT CHANNEL LOCK
     */
    const confirmed =
        await confirmAction({

            message,

            userId:
                message.author.id,

            content:
                `Lock ${message.channel}?`
        });

    if (!confirmed) return;

    /**
     * Execute lock
     */
    try {

        await lockChannel(

            message.channel,

            message.guild
        );

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to lock channel."
                )
            ]
        });
    }

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`🔒 Channel Locked

Channel:
${message.channel}`
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

`🔒 Channel Locked

Moderator:
${message.author.tag}

Channel:
${message.channel}`
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