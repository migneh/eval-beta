const UI = require("../../utils/ui");
const emojis = require("../../emojis");

const {
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = async (client, message) => {

  const commands = {
    add: {
      description: "إضافة نقاط لعضو أو أكثر.",
      example: ";add @user 5"
    },
    remove: {
      description: "إزالة نقاط من عضو أو أكثر.",
      example: ";remove @user 3"
    },
    points: {
      description: "عرض نقاطك أو نقاط عضو.",
      example: ";points @user"
    },
    top: {
      description: "عرض ترتيب أعلى الأعضاء.",
      example: ";top"
    },
    reset: {
      description: "تصفير جميع نقاط السيرفر (بتأكيد).",
      example: ";reset"
    },
    history: {
      description: "عرض سجل عمليات النقاط.",
      example: ";history"
    },
    setup: {
      description: "فتح لوحة إعدادات البوت.",
      example: ";setup"
    }
  };

  const embed = UI.normal(
    message.guild,
    `${emojis.help} قائمة أوامر البوت\n\n` +
    `اختر أمر من القائمة لعرض شرحه.\n\n` +
    `الأوامر المتاحة:\n` +
    Object.keys(commands)
      .map(cmd => `• ${cmd}`)
      .join("\n")
  );

  const select = new StringSelectMenuBuilder()
    .setCustomId("help_select")
    .setPlaceholder("اختر أمر لعرض شرحه")
    .addOptions(
      Object.keys(commands).map(cmd => ({
        label: cmd,
        value: cmd
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);

  const msg = await message.channel.send({
    embeds: [embed],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    time: 60000
  });

  collector.on("collect", async interaction => {

    if (interaction.user.id !== message.author.id) {
      return interaction.reply({
        embeds: [UI.error(message.guild, "لا يمكنك استخدام هذه القائمة.")],
        ephemeral: true
      });
    }

    const data = commands[interaction.values[0]];

    const commandEmbed = UI.normal(
      message.guild,
      `${emojis.command} الأمر: ${interaction.values[0]}\n\n` +
      `الوصف:\n${data.description}\n\n` +
      `مثال:\n${data.example}`
    );

    await interaction.update({
      embeds: [commandEmbed],
      components: [row]
    });

  });

  collector.on("end", () => {
    msg.edit({ components: [] }).catch(() => {});
  });

};
