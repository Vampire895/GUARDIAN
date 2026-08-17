const {
    EmbedBuilder
} = require("discord.js");

const name =
    "botinfo";

const aliases = [
    "bi"
];

const description =
    "Show information about Guardian.";

/**
 * Guardian Developer
 *
 * Put your Discord user ID here.
 */
const DEVELOPER_ID =
    "1015257516025856080";


/**
 * Format uptime
 */
function formatUptime(
    milliseconds
) {

    let seconds =
        Math.floor(
            milliseconds / 1000
        );

    const days =
        Math.floor(
            seconds / 86400
        );

    seconds %= 86400;

    const hours =
        Math.floor(
            seconds / 3600
        );

    seconds %= 3600;

    const minutes =
        Math.floor(
            seconds / 60
        );

    seconds %= 60;

    return [
        days
            ? `${days}d`
            : null,

        hours
            ? `${hours}h`
            : null,

        minutes
            ? `${minutes}m`
            : null,

        `${seconds}s`

    ]
        .filter(Boolean)
        .join(" ");
}


/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    const client =
        message.client;

    /**
     * Bot member in current server
     */
    const botMember =
        message.guild
            ? message.guild.members.me
            : null;

    /**
     * Joined current server
     */
    const joinedAt =
        botMember?.joinedAt;

    /**
     * Server count
     */
    const serverCount =
        client.guilds.cache.size;

    /**
     * Approximate user count
     */
    let userCount = 0;

    for (
        const guild
        of client.guilds.cache.values()
    ) {

        userCount +=
            guild.memberCount || 0;
    }

    /**
     * Account creation date
     */
    const createdAt =
        client.user.createdAt;

    /**
     * Uptime
     */
    const uptime =
        formatUptime(
            client.uptime || 0
        );

    /**
     * discord.js version
     */
    let discordVersion =
        "Unknown";

    try {

        discordVersion =
            require("discord.js/package.json")
                .version;

    } catch {

        discordVersion =
            "Unknown";
    }

    /**
     * Embed
     */
    const embed =
        new EmbedBuilder()

            .setTitle(
                "🤖 Guardian — Bot Information"
            )

            .setThumbnail(
                client.user.displayAvatarURL({
                    size: 512
                })
            )

            .setDescription(
`🛡️ **Guardian** is an all-in-one Discord security, moderation and server management bot.

Built to protect communities while giving administrators a powerful control center.`
            )

            .addFields(

                {
                    name:
                        "👨‍💻 Developer",

                    value:
                        `<@${DEVELOPER_ID}>\n\`${DEVELOPER_ID}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🆔 Bot ID",

                    value:
                        `\`${client.user.id}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🏠 Servers",

                    value:
                        `\`${serverCount.toLocaleString()}\``,

                    inline:
                        true
                },

                {
                    name:
                        "👥 Members",

                    value:
                        `\`${userCount.toLocaleString()}\``,

                    inline:
                        true
                },

                {
                    name:
                        "⏱️ Uptime",

                    value:
                        `\`${uptime}\``,

                    inline:
                        true
                },

                {
                    name:
                        "📅 Bot Created",

                    value:
                        `<t:${Math.floor(
                            createdAt.getTime() / 1000
                        )}:R>`,

                    inline:
                        true
                },

                {
                    name:
                        "📥 Joined This Server",

                    value:
                        joinedAt
                            ? `<t:${Math.floor(
                                joinedAt.getTime() / 1000
                              )}:R>`
                            : "Unknown",

                    inline:
                        true
                },

                {
                    name:
                        "⚙️ Runtime",

                    value:
                        `Node.js \`${process.version}\`\ndiscord.js \`v${discordVersion}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🛡️ Guardian Systems",

                    value:
`• Moderation
• Security
• Automation
• Verification
• Logging
• Enterprise Control Center`,

                    inline:
                        false
                }

            )

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