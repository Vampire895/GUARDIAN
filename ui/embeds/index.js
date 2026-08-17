// ui/embeds/index.js

const { EmbedBuilder } = require("discord.js");

const Colors = {
  SUCCESS: 0x57f287,
  ERROR: 0xed4245,
  INFO: 0x5865f2,
};

/**
 * @param {string} message
 * @returns {EmbedBuilder}
 */
function createSuccessEmbed(message) {
  return new EmbedBuilder()
    .setColor(Colors.SUCCESS)
    .setDescription(message)
    .setTimestamp();
}

/**
 * @param {string} message
 * @returns {EmbedBuilder}
 */
function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(Colors.ERROR)
    .setDescription(message)
    .setTimestamp();
}

/**
 * @param {string} message
 * @returns {EmbedBuilder}
 */
function createInfoEmbed(message) {
  return new EmbedBuilder()
    .setColor(Colors.INFO)
    .setDescription(message)
    .setTimestamp();
}

module.exports = { createSuccessEmbed, createErrorEmbed, createInfoEmbed };