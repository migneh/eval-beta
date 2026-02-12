const { db, saveDB } = require("../../utils/database");
const resolveMembers = require("../../utils/resolveMembers");
const { hasPointsPermission } = require("../../utils/permissions");
const UI = require("../../utils/ui");
const saveHistory = require("../history/saveHistory");
const logSystem = require("../logs/logSystem");
const emojis = require("../../emojis");

const MAX_POINTS = 20;

module.exports = async (client, message, args) => {

  if (!hasPointsPermission(message.member)) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, "لا تملك صلاحية استخدام هذا الأمر.")]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  if (args.length < 2) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, "الاستخدام الصحيح: ;add @user 5")]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  const amount = parseInt(args[args.length - 1]);
  if (isNaN(amount) || amount <= 0) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, "يجب إدخال رقم صحيح أكبر من 0.")]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  // Anti-Abuse: الحد الأقصى
  if (amount > MAX_POINTS) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, `الحد الأقصى لكل عملية هو ${MAX_POINTS} نقطة.`)]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  const memberArgs = args.slice(0, -1);
  const result = await resolveMembers(message, memberArgs);

  if (result.error) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, result.error)]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  const members = result.members;

  // Anti-Abuse: منع تعديل النفس
  if (members.some(m => m.id === message.author.id)) {
    const msg = await message.channel.send({
      embeds: [UI.error(message.guild, "لا يمكنك تعديل نقاطك الخاصة.")]
    });
    return setTimeout(() => msg.delete().catch(() => {}), 5000);
  }

  const updatedUsers = [];

  for (const member of members) {
    if (!db.guilds[message.guild.id].points[member.id]) {
      db.guilds[message.guild.id].points[member.id] = 0;
    }

    const before = db.guilds[message.guild.id].points[member.id];
    const after = before + amount;

    db.guilds[message.guild.id].points[member.id] = after;

    updatedUsers.push({
      id: member.id,
      before,
      after
    });
  }

  saveDB();

  await saveHistory({
    guildId: message.guild.id,
    executorId: message.author.id,
    targets: updatedUsers,
    amount,
    type: "add"
  });

  await logSystem({
    client,
    guild: message.guild,
    executor: message.member,
    targets: updatedUsers,
    amount,
    type: "add"
  });

  const mentionList = members.map(m => `<@${m.id}>`).join("\n");

  await message.channel.send({
    embeds: [
      UI.success(
        message.guild,
        `${emojis.points} تمت إضافة **${amount} نقطة** إلى:\n\n${mentionList}`
      )
    ]
  });

};
