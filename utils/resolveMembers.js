const { db } = require("./database");

async function resolveMembers(message, args) {
  const guild = message.guild;
  const config = db.guilds[guild.id]?.config;

  if (!config?.adminRole)
    return { error: "لم يتم تحديد رتبة الإداريين في الإعدادات." };

  const members = [];
  const roleId = config.adminRole;

  for (const arg of args) {
    const id = arg.replace(/[<@!>]/g, "");
    const member =
      guild.members.cache.get(id) ||
      (await guild.members.fetch(id).catch(() => null));

    if (!member) continue;

    if (!member.roles.cache.has(roleId)) continue;

    members.push(member);
  }

  if (!members.length)
    return { error: "لم يتم العثور على إداريين صالحين." };

  return { members };
}

module.exports = resolveMembers;
