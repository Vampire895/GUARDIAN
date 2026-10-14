require("dotenv").config();

const {
    getAFK,
    removeAFK
} = require(
    "./systems/utility-system/afkManager"
);

const { connectDB } = require("./database/models/connection");

const {

    Client,

    GatewayIntentBits,

    Collection

} = require("discord.js");

const fs = require("fs");

const config = require("./config/config");

const interactionSystem = require(
    "./systems/interaction-system"
);

const loggingSystem = require(
    "./systems/logging-system"
);

const logCommandUse = require(
    "./systems/logging-system/services/logCommandUse"
);

const controlSystem = require(
    "./systems/control-system"
);

const restoreIsolation = require(
    "./systems/moderation-system/isolationScheduler"
);

// 🔥 Security system
const setupSecuritySystem = require(
    "./systems/security-system"
);

/**
 * Connect database
 */
const databaseReady = connectDB();

if (!config.token) {
    console.error("[Startup Error] BOT_TOKEN is missing from .env.");
    process.exit(1);
}

/**
 * Discord client
 */
const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent,

        GatewayIntentBits.GuildPresences,

        GatewayIntentBits.GuildMembers
    ]
});

/**
 * Initialize systems
 */
interactionSystem(client);

/**
 * Command collection
 */
client.commands =
    new Collection();

/**
 * ----------------------
 * Load Commands
 * ----------------------
 */

const commandFolders =
    fs.readdirSync(
        "./commands"
    );

for (const folder of commandFolders) {

    const commandFiles =

        fs

            .readdirSync(
                `./commands/${folder}`
            )

            .filter(file =>
                file.endsWith(".js")
            );

    for (const file of commandFiles) {

        const command = require(
            `./commands/${folder}/${file}`
        );

        /**
         * Store command category
         */
        command.category =
            folder.toLowerCase();

        /**
         * Validate command
         */
        if (!command.name) {

            console.warn(

                `[COMMAND LOADER] ${file} missing name.`
            );

            continue;
        }

        /**
         * Register main command
         */
        client.commands.set(

            command.name.toLowerCase(),

            command
        );

        /**
         * Register aliases
         */
        if (

            Array.isArray(
                command.aliases
            )

        ) {

            for (const alias of command.aliases) {

                /**
                 * Prevent duplicate aliases
                 */
                if (

                    client.commands.has(
                        alias.toLowerCase()
                    )

                ) {

                    console.warn(

                        `[COMMAND LOADER] Duplicate alias detected: ${alias}`
                    );

                    continue;
                }

                client.commands.set(

                    alias.toLowerCase(),

                    command
                );
            }
        }

        console.log(

            `[COMMAND LOADED] ${command.name}`
        );
    }
}

/**
 * ----------------------
 * Bot Ready
 * ----------------------
 */

client.once("clientReady", () => {

    console.log(
        `✅ Logged in as ${client.user.tag}`
    );

    /**
     * Initialize systems
     */
    controlSystem(client);

    setupSecuritySystem(client);

    restoreIsolation(client);

    console.log(
        "🔥 All systems initialized."
    );
});

/**
 * ----------------------
 * Prefix Command Handler
 * ----------------------
 */

client.on(

    "messageCreate",

    async (message) => {

        /**
         * Ignore bots
         */
        if (message.author.bot) return;

        /**
         * --------------------------------
         * AFK SYSTEM
         * --------------------------------
         *
         * AFK is server-specific and stored in MongoDB.
         * If a database operation fails, don't crash or block normal commands.
         */
        if (message.guildId) {
            try {
                // Remove the author's AFK as soon as they send any message.
                const authorAFK = await getAFK(
                    message.guildId,
                    message.author.id
                );

                if (authorAFK) {
                    const duration = Math.max(
                        0,
                        Math.floor((Date.now() - authorAFK.since) / 1000)
                    );

                    const days = Math.floor(duration / 86400);
                    const hours = Math.floor((duration % 86400) / 3600);
                    const minutes = Math.floor((duration % 3600) / 60);
                    const seconds = duration % 60;
                    const durationParts = [];

                    if (days > 0) durationParts.push(`${days}d`);
                    if (hours > 0) durationParts.push(`${hours}h`);
                    if (minutes > 0) durationParts.push(`${minutes}m`);
                    if (seconds > 0) durationParts.push(`${seconds}s`);

                    const durationText =
                        durationParts.length > 0
                            ? durationParts.join(" ")
                            : "0s";

                    // Delete before sending the welcome-back message so the
                    // record is gone even if Discord rejects the reply.
                    await removeAFK(
                        message.guildId,
                        message.author.id
                    );

                    await message.reply({
                        content:
                            `👋 Welcome back, <@${message.author.id}>! ` +
                            `You were AFK for **${durationText}**.`,
                        allowedMentions: {
                            users: [message.author.id]
                        }
                    }).catch(() => null);
                }

                // Notify about AFK mentions without pinging the AFK users.
                for (const mentionedUser of message.mentions.users.values()) {
                    if (mentionedUser.id === message.author.id) continue;

                    const afk = await getAFK(
                        message.guildId,
                        mentionedUser.id
                    );

                    if (!afk) continue;

                    const duration = Math.max(
                        0,
                        Math.floor((Date.now() - afk.since) / 1000)
                    );

                    const days = Math.floor(duration / 86400);
                    const hours = Math.floor((duration % 86400) / 3600);
                    const minutes = Math.floor((duration % 3600) / 60);
                    const seconds = duration % 60;
                    const durationParts = [];

                    if (days > 0) durationParts.push(`${days}d`);
                    if (hours > 0) durationParts.push(`${hours}h`);
                    if (minutes > 0) durationParts.push(`${minutes}m`);
                    if (seconds > 0) durationParts.push(`${seconds}s`);

                    const durationText =
                        durationParts.length > 0
                            ? durationParts.join(" ")
                            : "0s";

                    await message.reply({
                        content:
                            `💤 <@${mentionedUser.id}> is currently AFK.\n` +
                            `📝 **Reason:** ${afk.reason}\n` +
                            `⏱️ **AFK for:** ${durationText}`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(() => null);
                }
            } catch (error) {
                console.error("[AFK] Database operation failed:", error);
            }
        }

        /**
         * --------------------------------
         * PREFIX COMMAND SYSTEM
         * --------------------------------
         */

        if (
            !message.content.startsWith(
                config.prefix
            )
        ) return;

        const args =
            message.content

                .slice(
                    config.prefix.length
                )

                .trim()

                .split(/ +/);

        const commandName =
            args.shift()
                .toLowerCase();

        const command =
            client.commands.get(
                commandName
            );

        if (!command) return;

        // Record the command invocation without storing its arguments.
        void logCommandUse({
            message,
            commandName,
            category: command.category
        });

        try {

            await command.execute(
                message,
                args
            );

        } catch (err) {

            console.error(
                `[COMMAND ERROR] ${commandName}:`,
                err
            );

            if (
                message.channel?.isTextBased()
            ) {

                await message.reply(
                    "❌ I couldn't run that command. Check the bot console for details."
                ).catch(() => null);
            }
        }
    }
);

/**
 * Login
 */
databaseReady
    .then(() => client.login(config.token))
    .catch((error) => {
        console.error("[Startup Error] Database connection failed; bot login cancelled.", error);
        process.exitCode = 1;
    });

client.on("error", (error) => {
    console.error("[Discord Client Error]", error);
});

process.on("unhandledRejection", (error) => {
    console.error("[Unhandled Rejection]", error);
});

process.on("uncaughtException", (error) => {
    console.error("[Uncaught Exception]", error);
});