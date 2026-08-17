module.exports = {
  name: "ping",
  description: "Test command",

  async execute(message) {
    message.reply("Pong!");
  }
};