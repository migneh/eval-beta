const { db } = require("./database");

function hasPointsPermission(member) {
  if (!member.guild) return false;

  const config = db.guilds[member.guild.id]?.config;
  if (!config) return false;

  if (member.permissions.has("Administrator"))
    return true;

  if (
    config.managerRole &&
    member.roles.cache.has(config.managerRole)
  )
    return true;

  return false;
}

function isAdmin(member) {
  return member.permissions.has("Administrator");
}

module.exports = {
  hasPointsPermission,
  isAdmin
};
