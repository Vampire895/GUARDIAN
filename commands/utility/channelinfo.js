const {
    EmbedBuilder,
    ChannelType
} = require("discord.js");

const name =
    "channelinfo";

const aliases = [
    "ci"
];

const description =
    "Show detailed information about a channel.";


/**
 * Get readable channel type
 */
function getChannelType(
    channel
) {

    const types = {

        [ChannelType.GuildText]:
            "💬 Text Channel",

        [ChannelType.GuildVoice]:
            "🔊 Voice Channel",

        [ChannelType.GuildCategory]:
            "📁 Category",

        [ChannelType.GuildAnnouncement]:
            "📢 Announcement Channel",

        [ChannelType.GuildStageVoice]:
            "🎙️ Stage Channel",

        [ChannelType.GuildForum]:
            "📰 Forum Channel",

        [ChannelType.GuildMedia]:
            "🖼️ Media Channel",

        [ChannelType.PublicThread]:
            "🧵 Public Thread",

        [ChannelType.PrivateThread]:
            "🔒 Private Thread",

        [ChannelType.AnnouncementThread]:
            "📢 Announcement Thread"
    };

    return (
        types[channel.type]
        || "❓ Unknown Channel"
    );
}


/**
 * Format timestamp
 */
function timestamp(
    date
) {

    if (!date) {
        return "Unknown";
    }

    return `<t:${Math.floor(
        date.getTime() / 1000
    )}:R>`;
}


/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    const guild =
        message.guild;

    if (!guild) {

        return message.reply(
            "❌ This command can only be used inside a server."
        );
    }


    /**
     * Resolve target channel
     *
     * .channelinfo
     * .channelinfo #general
     * .channelinfo CHANNEL_ID
     */
    let channel =
        message.channel;


    const input =
        args[0];


    if (input) {

        /**
         * Mentioned channel
         */
        const mentionedChannel =
            message.mentions.channels.first();

        if (mentionedChannel) {

            channel =
                mentionedChannel;

        } else {

            /**
             * Channel ID
             */
            const channelId =
                input.replace(
                    /[<#>]/g,
                    ""
                );

            const fetchedChannel =
                guild.channels.cache.get(
                    channelId
                );

            if (!fetchedChannel) {

                return message.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setTitle(
                                "❌ Channel Not Found"
                            )

                            .setDescription(
                                "I couldn't find that channel in this server."
                            )

                    ]

                });
            }

            channel =
                fetchedChannel;
        }
    }


    /**
     * Basic information
     */
    const category =
        channel.parent;

    const categoryText =
        category
            ? `<#${category.id}>`
            : "No Category";


    const position =
        typeof channel.rawPosition === "number"
            ? channel.rawPosition
            : "N/A";


    /**
     * Permission information
     */
    let permissionStatus =
        "Unknown";


    if (
        channel.isTextBased()
        ||
        channel.isVoiceBased()
    ) {

        try {

            const permissions =
                channel.permissionsFor(
                    message.guild.members.me
                );

            if (permissions) {

                permissionStatus =
                    permissions.has("ViewChannel")
                        ? "🟢 Guardian can access"
                        : "🔴 Guardian cannot access";
            }

        } catch {

            permissionStatus =
                "Unknown";
        }
    }


    /**
     * Create embed
     */
    const embed =
        new EmbedBuilder()

            .setTitle(
                `📺 Channel Information — #${channel.name}`
            )

            .setDescription(
                `${channel}`
            )

            .addFields(

                {
                    name:
                        "📛 Name",

                    value:
                        `\`${channel.name}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🆔 Channel ID",

                    value:
                        `\`${channel.id}\``,

                    inline:
                        true
                },

                {
                    name:
                        "📂 Type",

                    value:
                        getChannelType(channel),

                    inline:
                        true
                },

                {
                    name:
                        "📁 Category",

                    value:
                        categoryText,

                    inline:
                        true
                },

                {
                    name:
                        "📍 Position",

                    value:
                        `\`${position}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🔐 Guardian Access",

                    value:
                        permissionStatus,

                    inline:
                        true
                },

                {
                    name:
                        "📅 Created",

                    value:
                        timestamp(channel.createdAt),

                    inline:
                        true
                }
            );


    /**
     * Text channel information
     */
    if (
        channel.type ===
            ChannelType.GuildText
        ||
        channel.type ===
            ChannelType.GuildAnnouncement
        ||
        channel.type ===
            ChannelType.GuildForum
        ||
        channel.type ===
            ChannelType.GuildMedia
    ) {

        if (
            "topic" in channel
        ) {

            embed.addFields({

                name:
                    "📝 Topic",

                value:
                    channel.topic
                        ? channel.topic
                        : "No topic set.",

                inline:
                    false
            });
        }


        if (
            "rateLimitPerUser"
            in channel
        ) {

            embed.addFields({

                name:
                    "🐌 Slowmode",

                value:
                    channel.rateLimitPerUser
                        ? `${channel.rateLimitPerUser}s`
                        : "Disabled",

                inline:
                    true
            });
        }
    }


    /**
     * Voice channel information
     */
    if (
        channel.isVoiceBased()
    ) {

        embed.addFields(

            {
                name:
                    "🔊 Bitrate",

                value:
                    channel.bitrate
                        ? `${Math.round(
                            channel.bitrate / 1000
                          )} kbps`
                        : "Unknown",

                inline:
                    true
            },

            {
                name:
                    "👥 User Limit",

                value:
                    channel.userLimit
                        ? `${channel.userLimit}`
                        : "Unlimited",

                inline:
                    true
            },

            {
                name:
                    "👤 Connected",

                value:
                    `${channel.members?.size || 0}`,

                inline:
                    true
            }

        );
    }


    /**
     * Thread information
     */
    if (
        channel.isThread?.()
    ) {

        embed.addFields(

            {
                name:
                    "🧵 Thread",

                value:
                    channel.archived
                        ? "📦 Archived"
                        : "🟢 Active",

                inline:
                    true
            },

            {
                name:
                    "💬 Parent",

                value:
                    channel.parent
                        ? `<#${channel.parent.id}>`
                        : "Unknown",

                inline:
                    true
            }

        );
    }


    embed

        .setFooter({

            text:
                `Guardian • Requested by ${message.author.tag}`

        })

        .setTimestamp();


    return message.reply({

        embeds: [
            embed
        ]

    });
}


module.exports = {

    name,

    aliases,

    description,

    execute

};