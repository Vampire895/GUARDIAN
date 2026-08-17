const {
    EmbedBuilder
} = require("discord.js");

/**
 * Build control embed
 */

function buildControlEmbed({

    guild,

    title,

    description

}) {

    return new EmbedBuilder()

        .setColor("#2B2D31")

        .setTitle(title)

        .setDescription(description)

        .setThumbnail(

            guild.iconURL({

                dynamic: true
            })
        )

        .setFooter({

            text:
                `${guild.name} Control Center`
        })

        .setTimestamp();
}

module.exports =
    buildControlEmbed;