const name =
    "say";

const aliases = [
    "tell"
];

const description =
    "Make Guardian say something.";


/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    /**
     * Nothing provided
     */
    if (!args.length) {

        return message.reply(
            "❌ Please provide something for me to say."
        );
    }


    /**
     * Check for mentioned user
     */
    const target =
        message.mentions.users.first();


    /**
     * Build message
     */
    let content;


    if (target) {

        /**
         * Remove the first argument
         * because it is the mentioned user.
         */
        content =
            args
                .slice(1)
                .join(" ")
                .trim();


        /**
         * Nothing after mention
         */
        if (!content) {

            return message.reply(
                "❌ Please provide something for me to say after the mention."
            );
        }


        /**
         * Real Discord mention
         */
        content =
            `<@${target.id}> ${content}`;

    } else {

        /**
         * Normal message
         */
        content =
            args
                .join(" ")
                .trim();
    }


    /**
     * Delete the original command
     *
     * IMPORTANT:
     * Do NOT await this.
     *
     * This fires the deletion request immediately
     * and allows the bot response to be sent without
     * waiting for Discord's delete response.
     */
    message
        .delete()
        .catch(
            () => null
        );


    /**
     * Send Guardian's message immediately
     */
    await message.channel.send({

        content,

        allowedMentions: {

            users:
                target
                    ? [target.id]
                    : []

        }

    });
}


module.exports = {

    name,

    aliases,

    description,

    execute

};