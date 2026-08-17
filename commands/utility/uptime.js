const {
    EmbedBuilder
} = require("discord.js");

const name =
    "uptime";

const aliases = [];

const description =
    "Show Guardian's uptime and system status.";


/**
 * Format milliseconds
 */
function formatDuration(
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


    const parts = [];


    if (days) {

        parts.push(
            `${days}d`
        );
    }

    if (
        hours ||
        days
    ) {

        parts.push(
            `${hours}h`
        );
    }

    if (
        minutes ||
        hours ||
        days
    ) {

        parts.push(
            `${minutes}m`
        );
    }

    parts.push(
        `${seconds}s`
    );


    return parts.join(" ");
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
     * Uptime
     */
    const uptime =
        client.uptime || 0;


    /**
     * Latency
     */
    const latency =
        client.ws.ping;


    /**
     * Started time
     */
    const startedAt =
        new Date(
            Date.now() - uptime
        );


    /**
     * Memory
     */
    const memory =
        process.memoryUsage();


    const memoryUsed =
        (
            memory.rss /
            1024 /
            1024
        ).toFixed(1);


    /**
     * Node version
     */
    const nodeVersion =
        process.version;


    /**
     * Guild count
     */
    const guildCount =
        client.guilds.cache.size;


    /**
     * User count
     */
    const userCount =
        client.guilds.cache.reduce(

            (total, guild) =>

                total +
                (guild.memberCount || 0),

            0
        );


    /**
     * Ping status
     */
    let pingStatus =
        "🟢 Excellent";


    if (latency >= 150) {

        pingStatus =
            "🟡 Normal";
    }

    if (latency >= 300) {

        pingStatus =
            "🟠 High";
    }

    if (latency >= 500) {

        pingStatus =
            "🔴 Very High";
    }


    /**
     * Build embed
     */
    const embed =
        new EmbedBuilder()

            .setTitle(
                "⚡ Guardian Uptime"
            )

            .setDescription(
                "Guardian is currently **online and operational.** 🛡️"
            )

            .addFields(

                {
                    name:
                        "⏱️ Uptime",

                    value:
                        `\`${formatDuration(uptime)}\``,

                    inline:
                        true
                },

                {
                    name:
                        "📡 Latency",

                    value:
                        `\`${latency}ms\`\n${pingStatus}`,

                    inline:
                        true
                },

                {
                    name:
                        "🕐 Started",

                    value:
                        `<t:${Math.floor(
                            startedAt.getTime() / 1000
                        )}:F>`,

                    inline:
                        true
                },

                {
                    name:
                        "🌐 Servers",

                    value:
                        `\`${guildCount.toLocaleString()}\``,

                    inline:
                        true
                },

                {
                    name:
                        "👥 Cached Members",

                    value:
                        `\`${userCount.toLocaleString()}\``,

                    inline:
                        true
                },

                {
                    name:
                        "💾 Memory",

                    value:
                        `\`${memoryUsed} MB\``,

                    inline:
                        true
                },

                {
                    name:
                        "🟢 Status",

                    value:
                        "Online",

                    inline:
                        true
                },

                {
                    name:
                        "🟨 Node.js",

                    value:
                        `\`${nodeVersion}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🤖 Discord.js",

                    value:
                        `\`${require("discord.js").version}\``,

                    inline:
                        true
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