const { db } = require("../../utils/database");
const UI = require("../../utils/ui");
const emojis = require("../../emojis");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const ITEMS_PER_PAGE = 5;

module.exports = async (client, message) => {

  const guildData = db.guilds[message.guild.id];

  if (!guildData || !guildData.history || !guildData.history.length) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, "لا يوجد سجل عمليات حالياً.")]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  const history = guildData.history;

  let page = 0;
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const generateEmbed = () => {

    const start = page * ITEMS_PER_PAGE;
    const current = history.slice(start, start + ITEMS_PER_PAGE);

    let description = "";

    current.forEach((entry, index) => {

      let actionText = "";

      if (entry.type === "add") actionText = "إضافة";
      if (entry.type === "remove") actionText = "إزالة";
      if (entry.type === "reset") actionText = "تصفير";

      const date = new Date(entry.createdAt).toLocaleString();

      description += `**#${start + index + 1}** — ${actionText}\n`;
      description += `المنفذ: <@${entry.executorId}>\n`;

      if (entry.type !== "reset") {
        const targets = entry.targets
          .map(t => `<@${t.id}> (${t.before} ➜ ${t.after})`)
          .join(", ");

        description += `الأعضاء: ${targets}\n`;
        description += `القيمة: ${entry.amount} ${emojis.points}\n`;
      }

      description += `التاريخ: ${date}\n\n`;
    });

    return UI.normal(
      message.guild,
      `${emojis.history} سجل العمليات\n\n${description}الصفحة ${page + 1} / ${totalPages}`
    );
  };

  const prevBtn = new ButtonBuilder()
    .setCustomId("history_prev")
    .setLabel("السابق")
    .setStyle(ButtonStyle.Secondary);

  const nextBtn = new ButtonBuilder()
    .setCustomId("history_next")
    .setLabel("التالي")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(prevBtn, nextBtn);

  const msg = await message.channel.send({
    embeds: [generateEmbed()],
    components: totalPages > 1 ? [row] : []
  });

  if (totalPages <= 1) return;

  const collector = msg.createMessageComponentCollector({
    time: 60000
  });

  collector.on("collect", async interaction => {

    if (interaction.user.id !== message.author.id) {
      return interaction.reply({
        embeds: [UI.error(message.guild, "لا يمكنك التحكم بهذه الصفحة.")],
        ephemeral: true
      });
    }

    if (interaction.customId === "history_prev" && page > 0) {
      page--;
    }

    if (interaction.customId === "history_next" && page < totalPages - 1) {
      page++;
    }

    await interaction.update({
      embeds: [generateEmbed()],
      components: [row]
    });

  });

  collector.on("end", () => {
    msg.edit({ components: [] }).catch(() => {});
  });

};
