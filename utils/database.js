const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data.json");

let db = { guilds: {} };

if (fs.existsSync(filePath)) {
  try {
    db = JSON.parse(fs.readFileSync(filePath));
  } catch (err) {
    console.error("Failed to load data.json");
  }
}

function saveDB() {
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
}

function ensureGuild(guildId) {
  if (!db.guilds[guildId]) {
    db.guilds[guildId] = {
      points: {},
      history: {},
      config: {
        adminRole: null,
        managerRole: null,
        logChannel: null
      }
    };
    saveDB();
  }

  if (!db.guilds[guildId].points)
    db.guilds[guildId].points = {};

  if (!db.guilds[guildId].history)
    db.guilds[guildId].history = {};

  if (!db.guilds[guildId].config) {
    db.guilds[guildId].config = {
      adminRole: null,
      managerRole: null,
      logChannel: null
    };
  }
}

module.exports = {
  db,
  saveDB,
  ensureGuild
};
