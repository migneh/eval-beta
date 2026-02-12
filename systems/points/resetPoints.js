const { db, saveDB } = require("../../utils/database");
const { hasPointsPermission } = require("../../utils/permissions");
const UI = require("../../utils/ui");
const saveHistory = require("../history/saveHistory");
const logSystem = require("../logs/logSystem");
const emojis = require("../../emojis");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = async (client, message) => {

  if (!hasPointsPermission(message.member)) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, "لا تملك صلاحية استخدام هذا الأمر.")]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  const confirmBtn = new ButtonBuilder()
    .setCustomId("confirm_reset")
    .setLabel("تأكيد")
    .setStyle(ButtonStyle.Danger);

  const cancelBtn = new ButtonBuilder()
    .setCustomId("cancel_reset")
    .setLabel("إلغاء")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

  const msg = await message.channel.send({
    embeds: [
      UI.warning(
        message.guild,
        `${emojis.warning} هل أنت متأكد من تصفير جميع النقاط في السيرفر؟`
      )
    ],
    components: [row]
  });

  const filter = i =>
    i.user.id === message.author.id &&
    ["confirm_reset", "cancel_reset"].includes(i.customId);

  const collector = msg.createMessageComponentCollector({
    filter,
    time: 15000
  });

  collector.on("collect", async interaction => {

    await interaction.deferUpdate();

    if (interaction.customId === "cancel_reset") {
      return msg.edit({
        embeds: [
          UI.error(message.guild, "تم إلغاء عملية التصفير.")
        ],
        components: []
      });
    }

    // تنفيذ التصفير
    db.guilds[message.guild.id].points = {};
    saveDB();

    await saveHistory({
      guildId: message.guild.id,
      executorId: message.author.id,
      targets: [],
      amount: 0,
      type: "reset"
    });

    await logSystem({
      client,
      guild: message.guild,
      executor: message.member,
      targets: [],
      amount: 0,
      type: "reset"
    });

    await msg.edit({
      embeds: [
        UI.success(
          message.guild,
          `${emojis.success} تم تصفير جميع النقاط في السيرفر بنجاح.`
        )
      ],
      components: []
    });

  });

  collector.on("end", collected => {
    if (!collected.size) {
      msg.edit({
        embeds: [
          UI.error(message.guild, "انتهت مهلة التأكيد.")
        ],
        components: []
      }).catch(() => {});
    }
  });

};
