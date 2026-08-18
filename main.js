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
connectDB();

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
         */

        /**
         * Remove author's AFK when
         * they send a message.
         */
        const authorAFK =
            getAFK(
                message.author.id
            );

        if (authorAFK) {

            removeAFK(
                message.author.id
            );

            await message.reply({

                content:
                    `👋 Welcome back, <@${message.author.id}>! ` +
                    `Your AFK status has been removed.`,

                allowedMentions: {

                    users: [
                        message.author.id
                    ]

                }

            }).catch(() => null);
        }

        /**
         * Check mentions for AFK users
         */
        for (
            const mentionedUser
            of message.mentions.users.values()
        ) {

            const afk =
                getAFK(
                    mentionedUser.id
                );

            if (!afk) continue;

            const duration =
                Math.floor(
                    (Date.now() - afk.since)
                    / 1000
                );

            const minutes =
                Math.floor(
                    duration / 60
                );

            const seconds =
                duration % 60;

            const durationText =
                minutes > 0
                    ? `${minutes}m ${seconds}s`
                    : `${seconds}s`;

            await message.reply({

                content:
                    `💤 <@${mentionedUser.id}> is currently AFK.\n` +
                    `📝 **Reason:** ${afk.reason}\n` +
                    `⏱️ **AFK for:** ${durationText}`,

                allowedMentions: {

                    users: [
                        mentionedUser.id
                    ]

                }

            }).catch(() => null);
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
client.login(config.token).catch((error) => {
    console.error("[Discord Login Error]", error);
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
