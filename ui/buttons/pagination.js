const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

async function sendPaginatedEmbed({
  message,
  userId,
  pages
}) {
  let page = 0;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("◀️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("▶️")
      .setStyle(ButtonStyle.Secondary)
  );

  const msg = await message.reply({
    embeds: [pages[page]],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    time: 60000
  });

  collector.on("collect", async (interaction) => {
    if (interaction.user.id !== userId) {
      return interaction.reply({ content: "Not for you.", ephemeral: true });
    }

    if (interaction.customId === "prev") {
      page = page > 0 ? page - 1 : pages.length - 1;
    }

    if (interaction.customId === "next") {
      page = page < pages.length - 1 ? page + 1 : 0;
    }

    await interaction.update({
      embeds: [pages[page]],
      components: [row]
    });
  });

  collector.on("end", async () => {
    const disabledRow = new ActionRowBuilder().addComponents(
      row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
    );

    await msg.edit({ components: [disabledRow] });
  });
}

module.exports = { sendPaginatedEmbed };