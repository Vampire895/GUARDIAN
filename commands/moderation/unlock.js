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

const name = "unlock";

const aliases = [
    "unlockall"
];

const description =
    "Unlock channels in the server.";

/**
 * Unlock single channel
 */

async function unlockChannel(channel, guild) {

    await channel.permissionOverwrites.edit(

        guild.roles.everyone,

        {
            SendMessages: null
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
     * UNLOCK ALL CHANNELS
     */
    if (

        message.content
            .toLowerCase()
            .startsWith(".unlockall")

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
                    "Unlock all locked channels in this server?"
            });

        if (!confirmed) return;

        let unlockedCount = 0;

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
         * Unlock channels
         */
        for (const [, channel] of channels) {

            try {

                const overwrite =
                    channel.permissionOverwrites.cache.get(
                        message.guild.roles.everyone.id
                    );

                /**
                 * Skip already unlocked
                 */
                if (

                    !overwrite?.deny?.has(
                        PermissionsBitField.Flags.SendMessages
                    )

                ) {
                    continue;
                }

                await unlockChannel(
                    channel,
                    message.guild
                );

                unlockedCount++;

            } catch (error) {}
        }

        /**
         * Success embed
         */
        const successEmbed =
            createSuccessEmbed(

`🔓 Server Unlock Complete

Unlocked Channels:
${unlockedCount}`
            );

        await message.reply({

            embeds: [successEmbed]
        });

        /**
         * Moderation log
         */
        const logEmbed =
            createInfoEmbed(

`🔓 Server Unlock

Moderator:
${message.author.tag}

Unlocked Channels:
${unlockedCount}`
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
     * CURRENT CHANNEL UNLOCK
     */
    const confirmed =
        await confirmAction({

            message,

            userId:
                message.author.id,

            content:
                `Unlock ${message.channel}?`
        });

    if (!confirmed) return;

    /**
     * Execute unlock
     */
    try {

        await unlockChannel(

            message.channel,

            message.guild
        );

    } catch (error) {

        return message.reply({

            embeds: [
                createErrorEmbed(
                    "Failed to unlock channel."
                )
            ]
        });
    }

    /**
     * Success embed
     */
    const successEmbed =
        createSuccessEmbed(

`🔓 Channel Unlocked

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

`🔓 Channel Unlocked

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