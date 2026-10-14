const {
    setAFK
} = require(
    "../../systems/utility-system/afkManager"
);

const name = "afk";
const aliases = [];
const description = "Set your AFK status.";

/**
 * Execute command
 */
async function execute(message, args) {
    if (!message.guildId) {
        return message.reply("❌ The AFK command can only be used inside a server.");
    }

    const reason =
        args.join(" ").trim()
        || "AFK";

    try {
        await setAFK(
            message.guildId,
            message.author.id,
            reason
        );
    } catch (error) {
        console.error("[AFK] Failed to save AFK state:", error);
        return message.reply(
            "❌ I couldn't save your AFK status right now. Please try again."
        );
    }

    return message.reply({
        content:
            `💤 <@${message.author.id}> is now AFK!\n` +
            `📝 **Reason:** ${reason}`,
        allowedMentions: {
            users: [message.author.id]
        }
    });
}

module.exports = {
    name,
    aliases,
    description,
    execute
};
