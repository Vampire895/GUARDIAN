const { getConfig } = require("../../systems/security-system/config");
const goodbye = require("../../systems/automation-system/goodbye");

module.exports = {
  name: "goodbyepreview",

  async execute(message) {
    const config = await getConfig(message.guild.id);

    await goodbye.send(message.member, config.goodbye);
  },
};