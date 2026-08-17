const buildControlEmbed = require(
    "../utils/buildControlEmbed"
);

const buildSystemButtons = require(
    "../utils/buildSystemButtons"
);

const createSession = require(
    "../sessions/createSession"
);

/**
 * Render home panel
 */

async function renderHomePanel({

    interaction,

    message

}) {

    const guild =
        interaction
            ? interaction.guild
            : message.guild;

    /**
     * Build embed
     */
    const embed =
        buildControlEmbed({

            guild,

            title:
                "🛠️ Control Center",

            description:

`Welcome to the server control center.

Manage all server systems using the interactive dashboard below.

Systems dynamically appear here automatically.`
        });

    /**
     * Build buttons
     */
    const rows =
        buildSystemButtons();

    /**
     * Interaction update
     */
    if (interaction) {

        return interaction.update({

            embeds: [embed],

            components: rows
        });
    }

    /**
     * Initial message
     */
    const reply =
        await message.reply({

            embeds: [embed],

            components: rows
        });

    /**
     * Create session
     */
    createSession({

        messageId:
            reply.id,

        ownerId:
            message.author.id,

        guildId:
            message.guild.id,

        channelId:
            message.channel.id
    });

    return reply;
}

module.exports =
    renderHomePanel;