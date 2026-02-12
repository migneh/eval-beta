const { db } = require("../../utils/database");
const UI = require("../../utils/ui");
const emojis = require("../../emojis");

module.exports = async (message, args) => {

  const member =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]) ||
    message.member;

  if (!member) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, "لم يتم العثور على العضو.")]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  const guildData = db.guilds[message.guild.id];

  if (!guildData || !guildData.points[member.id]) {
    return message.channel.send({
      embeds: [
        UI.normal(
          message.guild,
          `${member} لا يملك أي نقاط حالياً.`
        )
      ]
    });
  }

  const points = guildData.points[member.id];

  await message.channel.send({
    embeds: [
      UI.normal(
        message.guild,
        `${emojis.points} نقاط ${member} الحالية:\n\n**${points} نقطة**`
      )
    ]
  });

};
