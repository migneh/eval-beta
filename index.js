const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { ensureGuild } = require("./utils/database");


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel]
});

client.cooldowns = new Collection();
const PREFIX = ";";

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  ensureGuild(message.guild.id);

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ⏳ Cooldown (3 ثواني افتراضي لكل أمر)
  const cooldownAmount = 3000;
  if (!client.cooldowns.has(command)) {
    client.cooldowns.set(command, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(command);

  if (timestamps.has(message.author.id)) {
    const expiration = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expiration) return;
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  // 🔹 Help
  if (command === "help") {
    return require("./systems/help/helpCommand")(message);
  }

  // 🔹 Setup
  if (command === "points-setup") {
    return require("./systems/setup/setupPanel")(message);
  }

  // 🔹 Points System
  if (["add", "remove", "reset", "points", "top"].includes(command)) {
    return require("./systems/points/points")(client, message, command, args);
  }

  // 🔹 History
  if (command === "history") {
    return require("./systems/history/historyCommand")(message, args);
  }
});

client.login("token");
