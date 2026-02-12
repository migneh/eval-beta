const { db, saveDB } = require("../../utils/database");

module.exports = async ({
  guildId,
  executorId,
  targets,
  amount,
  type
}) => {

  if (!db.guilds[guildId].history) {
    db.guilds[guildId].history = [];
  }

  const entry = {
    id: Date.now().toString(),
    executorId,
    targets: targets.map(t => ({
      id: t.id,
      before: t.before,
      after: t.after
    })),
    amount,
    type, // add | remove | reset
    createdAt: Date.now()
  };

  db.guilds[guildId].history.unshift(entry);

  // نخلي الحد الأقصى 100 عملية فقط
  if (db.guilds[guildId].history.length > 100) {
    db.guilds[guildId].history = db.guilds[guildId].history.slice(0, 100);
  }

  saveDB();
};
