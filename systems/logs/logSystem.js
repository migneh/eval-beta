const { db } = require("../../utils/database");
const UI = require("../../utils/ui");
const emojis = require("../../emojis");

module.exports = async ({
  client,
  guild,
  executor,
  targets,
  amount,
  type
}) => {

  const guildData = db.guilds[guild.id];
  if (!guildData || !guildData.config || !guildData.config.logChannel) return;

  const channel = guild.channels.cache.get(guildData.config.logChannel);
  if (!channel) return;

  let actionText = "";
  let description = "";

  if (type === "add") actionText = "إضافة نقاط";
  if (type === "remove") actionText = "إزالة نقاط";
  if (type === "reset") actionText = "تصفير جميع النقاط";

  description += `${emojis.log} عملية جديدة\n\n`;
  description += `النوع: ${actionText}\n`;
  description += `المنفذ: ${executor}\n`;
  description += `المعرف: ${executor.id}\n\n`;

  if (type !== "reset") {
    const membersText = targets
      .map(t => `<@${t.id}> (${t.before} ➜ ${t.after})`)
      .join("\n");

    description += `الأعضاء المتأثرين:\n${membersText}\n\n`;
    description += `القيمة: ${amount} ${emojis.points}\n\n`;
  }

  description += `التاريخ: <t:${Math.floor(Date.now() / 1000)}:F>`;

  await channel.send({
    embeds: [
      UI.normal(guild, description)
    ]
  });

};
