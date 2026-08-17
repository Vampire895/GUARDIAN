const {
    setAFK
} = require(
    "../../systems/utility-system/afkManager"
);

const name =
    "afk";

const aliases = [];

const description =
    "Set your AFK status.";

/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    const reason =
        args.join(" ").trim()
        || "AFK";

    setAFK(
        message.author.id,
        reason
    );

    return message.reply({

        content:
            `💤 <@${message.author.id}> is now AFK!\n` +
            `📝 **Reason:** ${reason}`,

        allowedMentions: {

            users: [
                message.author.id
            ]

        }
    });
}

module.exports = {

    name,

    aliases,

    description,

    execute
};