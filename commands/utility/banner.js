const {
    createInfoEmbed,
    createErrorEmbed
} = require(
    "../../ui/embeds"
);

const name =
    "banner";

const aliases = [];

const description =
    "Show a user's Discord profile banner.";

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
     * Fetch full user
     * --------------------------------
     *
     * Discord may not include the banner
     * on the cached user object.
     */

    try {

        targetUser =
            await message.client.users.fetch(
                targetUser.id,
                {
                    force: true
                }
            );

    } catch (error) {

        return message.reply({

            embeds: [

                createErrorEmbed(
                    "I couldn't fetch that user's profile."
                )

            ]

        });
    }

    /**
     * --------------------------------
     * Check banner
     * --------------------------------
     */

    if (!targetUser.banner) {

        return message.reply({

            embeds: [

                createInfoEmbed(

`🎨 **No Profile Banner**

**${targetUser.username}** doesn't currently have a Discord profile banner.`

                )

            ]

        });
    }

    /**
     * --------------------------------
     * Banner URL
     * --------------------------------
     */

    const bannerURL =
        targetUser.bannerURL({

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

`🎨 **${targetUser.username}'s Profile Banner**

Click the image to open the full-resolution banner.

[**PNG**](${targetUser.bannerURL({
    extension: "png",
    size: 4096,
    forceStatic: true
})}) • [**JPG**](${targetUser.bannerURL({
    extension: "jpg",
    size: 4096,
    forceStatic: true
})}) • [**WEBP**](${targetUser.bannerURL({
    extension: "webp",
    size: 4096,
    forceStatic: true
})})`

        );

    embed.setImage(
        bannerURL
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