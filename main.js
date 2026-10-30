
require("dotenv").config();

const {
    getAFK,
    removeAFK
} = require("./systems/utility-system/afkManager");

const {
    getPrefix
} = require("./systems/guild-system/guildConfig");

const setupGuildActivityTracker = require(
    "./systems/guild-system/activityTracker"
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

// SECURITY SYSTEM
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
 * Initialize interaction system
 */
interactionSystem(client);

/**
 * Command collection
 */
client.commands = new Collection();

/**
 * ----------------------
 * LOAD COMMANDS
 * ----------------------
 */

const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {

    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const command = require(
            `./commands/${folder}/${file}`
        );

        command.category = folder.toLowerCase();

        if (!command.name) {
            console.warn(
                `[COMMAND LOADER] ${file} missing name.`
            );
            continue;
        }

        // Register main command
        client.commands.set(
            command.name.toLowerCase(),
            command
        );

        // Register aliases
        if (Array.isArray(command.aliases)) {

            for (const alias of command.aliases) {

                if (client.commands.has(alias.toLowerCase())) {
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
 * INITIALIZE SYSTEMS
 * ----------------------
 */

// Register event listeners BEFORE clientReady.
setupGuildActivityTracker(client);

/**
 * ----------------------
 * BOT READY
 * ----------------------
 */

client.once("clientReady", () => {

    console.log(
        `✅ Logged in as ${client.user.tag}`
    );

    controlSystem(client);

    setupSecuritySystem(client);

    restoreIsolation(client);

    console.log(
        "🔥 All systems initialized."
    );
});

/**
 * ----------------------
 * PREFIX COMMAND HANDLER
 * ----------------------
 */

client.on("messageCreate", async (message) => {

    // Ignore bots
    if (message.author.bot) return;

    /**
     * --------------------------------
     * AFK SYSTEM
     * --------------------------------
     */

    if (message.guildId) {

        try {

            // Remove author's AFK
            const authorAFK = await getAFK(
                message.guildId,
                message.author.id
            );

            if (authorAFK) {

                const duration = Math.max(
                    0,
                    Math.floor(
                        (Date.now() - authorAFK.since) / 1000
                    )
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

            // Notify about AFK mentions
            for (const mentionedUser of message.mentions.users.values()) {

                if (mentionedUser.id === message.author.id) continue;

                const afk = await getAFK(
                    message.guildId,
                    mentionedUser.id
                );

                if (!afk) continue;

                const duration = Math.max(
                    0,
                    Math.floor(
                        (Date.now() - afk.since) / 1000
                    )
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
            console.error(
                "[AFK] Database operation failed:",
                error
            );
        }
    }

    /**
     * --------------------------------
     * PREFIX COMMAND SYSTEM
     * --------------------------------
     */

    let prefix;

    try {

        prefix = message.guildId
            ? await getPrefix(message.guildId)
            : config.prefix;

    } catch (error) {

        console.error(
            "[PREFIX LOOKUP ERROR]",
            error
        );

        return;
    }

    if (!prefix) return;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/)
        .filter(Boolean);

    let commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Support: !set prefix ?
    if (
        commandName === "set" &&
        args[0]?.toLowerCase() === "prefix"
    ) {
        args.shift();
        commandName = "setprefix";
    }

    const command = client.commands.get(commandName);

    if (!command) return;

    // Record command invocation
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

        if (message.channel?.isTextBased()) {

            await message.reply(
                "❌ I couldn't run that command. Check the bot console for details."
            ).catch(() => null);
        }
    }
});

/**
 * ----------------------
 * LOGIN
 * ----------------------
 */

databaseReady
    .then(() => client.login(config.token))
    .catch((error) => {

        console.error(
            "[Startup Error] Database connection failed; bot login cancelled.",
            error
        );

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
