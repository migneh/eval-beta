const { db } = require("../../utils/database");
const UI = require("../../utils/ui");
const emojis = require("../../emojis");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const ITEMS_PER_PAGE = 10;

module.exports = async (client, message) => {

  const guildData = db.guilds[message.guild.id];
  if (!guildData || !guildData.points) {
    return message.channel.send({
      embeds: [UI.error(message.guild, "لا توجد بيانات نقاط حالياً.")]
    });
  }

  const sorted = Object.entries(guildData.points)
    .sort((a, b) => b[1] - a[1]);

  if (!sorted.length) {
    return message.channel.send({
      embeds: [UI.error(message.guild, "لا يوجد أي عضو لديه نقاط.")]
    });
  }

  let page = 0;
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

  const generateEmbed = async () => {

    const start = page * ITEMS_PER_PAGE;
    const current = sorted.slice(start, start + ITEMS_PER_PAGE);

    let description = "";

    for (let i = 0; i < current.length; i++) {
      const position = start + i + 1;
      const userId = current[i][0];
      const points = current[i][1];

      description += `**${position}.** <@${userId}> — ${points} ${emojis.points}\n`;
    }

    return UI.normal(
      message.guild,
      `${emojis.leaderboard} ترتيب النقاط\n\n${description}\nالصفحة ${page + 1} / ${totalPages}`
    );
  };

  const prevBtn = new ButtonBuilder()
    .setCustomId("leader_prev")
    .setLabel("السابق")
    .setStyle(ButtonStyle.Secondary);

  const nextBtn = new ButtonBuilder()
    .setCustomId("leader_next")
    .setLabel("التالي")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(prevBtn, nextBtn);

  const msg = await message.channel.send({
    embeds: [await generateEmbed()],
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

    if (interaction.customId === "leader_prev" && page > 0) {
      page--;
    }

    if (interaction.customId === "leader_next" && page < totalPages - 1) {
      page++;
    }

    await interaction.update({
      embeds: [await generateEmbed()],
      components: [row]
    });

  });

  collector.on("end", () => {
    msg.edit({ components: [] }).catch(() => {});
  });

};
