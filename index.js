const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config");

const pointsSystem = require("./systems/points/points");
const helpCommand = require("./systems/help/helpCommand");
const setupPanel = require("./systems/setup/setupPanel");
const historyCommand = require("./systems/history/historyCommand");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const prefix = config.prefix || ";";

/* =========================
   Simple Cooldown System
========================= */

const cooldowns = new Map();
const COOLDOWN_TIME = 3000; // 3 ثواني

function checkCooldown(userId, command) {
  const key = `${userId}-${command}`;
  const now = Date.now();

  if (cooldowns.has(key)) {
    const expiration = cooldowns.get(key);
    if (now < expiration) {
      return Math.ceil((expiration - now) / 1000);
    }
  }

  cooldowns.set(key, now + COOLDOWN_TIME);
  return 0;
}

/* =========================
   Ready
========================= */

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

/* =========================
   Message Handler
========================= */

client.on("messageCreate", async (message) => {

  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  const remaining = checkCooldown(message.author.id, command);
  if (remaining > 0) {
    const msg = await message.channel.send(
      `⏳ انتظر ${remaining} ثانية قبل استخدام الأمر مرة أخرى.`
    );

    setTimeout(() => {
      msg.delete().catch(() => {});
    }, 5000);

    return;
  }

  try {

    if (["add", "remove", "reset", "points", "top"].includes(command)) {
      await pointsSystem(client, message, command, args);
    }

    else if (command === "help") {
      await helpCommand(client, message, args);
    }

    else if (command === "setup" || command === "points-setup") {
      await setupPanel(client, message, args);
    }

    else if (command === "history") {
      await historyCommand(client, message, args);
    }

  } catch (error) {
    console.error("COMMAND ERROR:", error);

    const errorMsg = await message.channel.send(
      "❌ حدث خطأ أثناء تنفيذ الأمر."
    );

    setTimeout(() => {
      errorMsg.delete().catch(() => {});
    }, 5000);
  }

});

/* =========================
   Login
========================= */

client.login("token");
