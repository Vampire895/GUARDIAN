const {
    EmbedBuilder,
    ChannelType
} = require("discord.js");

const name =
    "serverinfo";

const aliases = [
    "si"
];

const description =
    "Show detailed information about the server.";


/**
 * Format timestamp
 */
function timestamp(date) {

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
     * Fetch owner
     */
    let owner;

    try {

        owner =
            await guild.fetchOwner();

    } catch {

        owner =
            null;
    }


    /**
     * Member counts
     */
    let humans = 0;
    let bots = 0;

    for (
        const member
        of guild.members.cache.values()
    ) {

        if (member.user.bot) {

            bots++;

        } else {

            humans++;
        }
    }


    /**
     * Channel counts
     */
    let publicText = 0;
    let privateText = 0;

    let publicVoice = 0;
    let privateVoice = 0;

    let threadCount = 0;


    const everyoneRole =
        guild.roles.everyone;


    for (
        const channel
        of guild.channels.cache.values()
    ) {

        /**
         * Threads
         */
        if (
            channel.isThread?.()
        ) {

            threadCount++;

            continue;
        }


        /**
         * Text-like channels
         */
        const isText =
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
                ChannelType.GuildMedia;


        /**
         * Voice-like channels
         */
        const isVoice =
            channel.type ===
                ChannelType.GuildVoice
            ||
            channel.type ===
                ChannelType.GuildStageVoice;


        if (
            !isText &&
            !isVoice
        ) {
            continue;
        }


        let everyoneCanView =
            false;

        try {

            const permissions =
                channel.permissionsFor(
                    everyoneRole
                );

            everyoneCanView =
                permissions?.has(
                    "ViewChannel"
                ) || false;

        } catch {

            everyoneCanView =
                false;
        }


        if (isText) {

            if (everyoneCanView) {

                publicText++;

            } else {

                privateText++;
            }
        }


        if (isVoice) {

            if (everyoneCanView) {

                publicVoice++;

            } else {

                privateVoice++;
            }
        }
    }


    /**
     * Total roles
     *
     * Exclude @everyone.
     */
    const roleCount =
        Math.max(
            guild.roles.cache.size - 1,
            0
        );


    /**
     * Guardian joined date
     */
    const botMember =
        guild.members.me;

    const botJoined =
        botMember?.joinedAt;


    /**
     * Server icon
     */
    const icon =
        guild.iconURL({
            size: 1024,
            extension: "png"
        });


    /**
     * Server features
     */
    const features =
        guild.features
            ?.map(
                feature =>
                    feature
                        .toLowerCase()
                        .replaceAll(
                            "_",
                            " "
                        )
                )
            || [];


    const featureText =
        features.length
            ? features
                .slice(0, 8)
                .map(
                    feature =>
                        `• ${feature}`
                )
                .join("\n")
            : "None";


    /**
     * Verification level
     */
    const verificationLevels = {

        0:
            "🟢 None",

        1:
            "🟡 Low",

        2:
            "🟠 Medium",

        3:
            "🔴 High",

        4:
            "🔴 Very High"
    };


    const verificationLevel =
        verificationLevels[
            guild.verificationLevel
        ]
        ||
        "Unknown";


    /**
     * Create embed
     */
    const embed =
        new EmbedBuilder()

            .setTitle(
                `🏠 ${guild.name}`
            )

            .setDescription(
                `**Server Information**\n\n🆔 \`${guild.id}\``
            );


    if (icon) {

        embed.setThumbnail(
            icon
        );
    }


    embed.addFields(

        {
            name:
                "👑 Owner",

            value:
                owner
                    ? `${owner.user}\n\`${owner.user.tag}\``
                    : "Unknown",

            inline:
                true
        },

        {
            name:
                "📅 Created",

            value:
                timestamp(
                    guild.createdAt
                ),

            inline:
                true
        },

        {
            name:
                "📥 Guardian Joined",

            value:
                botJoined
                    ? timestamp(botJoined)
                    : "Unknown",

            inline:
                true
        },

        {
            name:
                "👥 Members",

            value:
                `Total: \`${guild.memberCount.toLocaleString()}\`\n` +
                `Humans: \`${humans.toLocaleString()}\`\n` +
                `Bots: \`${bots.toLocaleString()}\``,

            inline:
                true
        },

        {
            name:
                "💬 Text Channels",

            value:
                `🌐 Public: \`${publicText}\`\n` +
                `🔒 Private: \`${privateText}\``,

            inline:
                true
        },

        {
            name:
                "🔊 Voice Channels",

            value:
                `🌐 Public: \`${publicVoice}\`\n` +
                `🔒 Private: \`${privateVoice}\``,

            inline:
                true
        },

        {
            name:
                "🧵 Threads",

            value:
                `\`${threadCount}\``,

            inline:
                true
        },

        {
            name:
                "🎭 Roles",

            value:
                `\`${roleCount}\``,

            inline:
                true
        },

        {
            name:
                "🚀 Boosting",

            value:
                `Level: \`${guild.premiumTier}\`\n` +
                `Boosts: \`${guild.premiumSubscriptionCount || 0}\``,

            inline:
                true
        },

        {
            name:
                "🛡️ Verification",

            value:
                verificationLevel,

            inline:
                true
        },

        {
            name:
                "✨ Server Features",

            value:
                featureText,

            inline:
                false
        }

    );


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