const { db, saveDB } = require("../../utils/database");
const UI = require("../../utils/ui");
const emojis = require("../../emojis");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelType
} = require("discord.js");

module.exports = async (client, message) => {

  if (!message.member.permissions.has("Administrator")) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, "هذا الأمر متاح للإدمن فقط.")]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  if (!db.guilds[message.guild.id].config) {
    db.guilds[message.guild.id].config = {
      logChannel: null,
      managerRole: null
    };
    saveDB();
  }

  const config = db.guilds[message.guild.id].config;

  const generateEmbed = () => {
    return UI.normal(
      message.guild,
      `${emojis.settings} إعدادات البوت\n\n` +
      `قناة اللوق:\n${config.logChannel ? `<#${config.logChannel}>` : "غير محدد"}\n\n` +
      `رتبة إدارة النقاط:\n${config.managerRole ? `<@&${config.managerRole}>` : "غير محدد"}`
    );
  };

  const logBtn = new ButtonBuilder()
    .setCustomId("setup_log")
    .setLabel("تعيين قناة اللوق")
    .setStyle(ButtonStyle.Secondary);

  const roleBtn = new ButtonBuilder()
    .setCustomId("setup_role")
    .setLabel("تعيين رتبة إدارة النقاط")
    .setStyle(ButtonStyle.Secondary);

  const closeBtn = new ButtonBuilder()
    .setCustomId("setup_close")
    .setLabel("إغلاق")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(logBtn, roleBtn, closeBtn);

  const msg = await message.channel.send({
    embeds: [generateEmbed()],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    time: 120000
  });

  collector.on("collect", async interaction => {

    if (interaction.user.id !== message.author.id) {
      return interaction.reply({
        embeds: [UI.error(message.guild, "لا يمكنك التحكم بهذه الواجهة.")],
        ephemeral: true
      });
    }

    if (interaction.customId === "setup_close") {
      collector.stop();
      return msg.edit({ components: [] });
    }

    if (interaction.customId === "setup_log") {

      const select = new ChannelSelectMenuBuilder()
        .setCustomId("select_log_channel")
        .setPlaceholder("اختر قناة اللوق")
        .setChannelTypes(ChannelType.GuildText)
        .setMinValues(1)
        .setMaxValues(1);

      const selectRow = new ActionRowBuilder().addComponents(select);

      await interaction.update({
        embeds: [UI.normal(message.guild, "اختر قناة اللوق من القائمة أدناه.")],
        components: [selectRow]
      });

    }

    if (interaction.customId === "setup_role") {

      const select = new RoleSelectMenuBuilder()
        .setCustomId("select_manager_role")
        .setPlaceholder("اختر رتبة إدارة النقاط")
        .setMinValues(1)
        .setMaxValues(1);

      const selectRow = new ActionRowBuilder().addComponents(select);

      await interaction.update({
        embeds: [UI.normal(message.guild, "اختر الرتبة من القائمة أدناه.")],
        components: [selectRow]
      });

    }

    if (interaction.isChannelSelectMenu()) {

      config.logChannel = interaction.values[0];
      saveDB();

      await interaction.update({
        embeds: [generateEmbed()],
        components: [row]
      });

    }

    if (interaction.isRoleSelectMenu()) {

      config.managerRole = interaction.values[0];
      saveDB();

      await interaction.update({
        embeds: [generateEmbed()],
        components: [row]
      });

    }

  });

  collector.on("end", () => {
    msg.edit({ components: [] }).catch(() => {});
  });

};
