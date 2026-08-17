const { getConfig } = require("../../systems/security-system/config");
const welcome = require("../../systems/automation-system/welcome");

module.exports = {
  name: "welcomepreview",
  description: "Preview welcome message",

  async execute(message) {
    const config = await getConfig(message.guild.id);

    await welcome.send(message.member, config.welcome);
  },
};