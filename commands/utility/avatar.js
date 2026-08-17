const {
    createInfoEmbed,
    createErrorEmbed
} = require(
    "../../ui/embeds"
);

const name =
    "avatar";

const aliases = [
    "av"
];

const description =
    "Show a user's avatar.";

/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    /**
     * --------------------------------
     * Resolve target user
     * --------------------------------
     */

    let targetUser;

    /**
     * 1. Mention
     */
    const mentionedUser =
        message.mentions.users.first();

    if (mentionedUser) {

        targetUser =
            mentionedUser;

    }

    /**
     * 2. User ID
     */
    else if (
        args[0] &&
        /^\d{17,20}$/.test(args[0])
    ) {

        try {

            targetUser =
                await message.client.users.fetch(
                    args[0]
                );

        } catch (error) {

            return message.reply({

                embeds: [

                    createErrorEmbed(
                        "I couldn't find that user."
                    )

                ]

            });
        }
    }

    /**
     * 3. No target → command author
     */
    else {

        targetUser =
            message.author;
    }

    /**
     * --------------------------------
     * Avatar URL
     * --------------------------------
     */

    const avatarURL =
        targetUser.displayAvatarURL({

            extension:
                "png",

            size:
                4096,

            forceStatic:
                false
        });

    /**
     * --------------------------------
     * Embed
     * --------------------------------
     */

    const embed =
        createInfoEmbed(

`🖼️ **${targetUser.username}'s Avatar**

Click the image to open the full-resolution avatar.

[**PNG**](${targetUser.displayAvatarURL({
    extension: "png",
    size: 4096,
    forceStatic: true
})}) • [**JPG**](${targetUser.displayAvatarURL({
    extension: "jpg",
    size: 4096,
    forceStatic: true
})}) • [**WEBP**](${targetUser.displayAvatarURL({
    extension: "webp",
    size: 4096,
    forceStatic: true
})})`
        );

    embed.setImage(
        avatarURL
    );

    embed.setFooter({

        text:
            `Requested by ${message.author.tag}`

    });

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