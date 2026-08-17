const createSuccessEmbed = require("../../../../ui/embeds/createSuccessEmbed");

/**
 * Test button interaction handler.
 */

module.exports = {

    customId: "test:button:ping",

    async execute(interaction) {

        const embed = createSuccessEmbed({
            title: "Interaction Success",
            description: "Interaction system working perfectly."
        });

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });
    }
};