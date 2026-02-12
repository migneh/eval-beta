const { EmbedBuilder } = require("discord.js");

const COLORS = {
  success: 0x2ecc71,
  error: 0xe74c3c,
  neutral: 0x3498db,
  panel: 0x2c3e50,
  log: 0x9b59b6
};

function baseEmbed(guild, type = "neutral") {
  return new EmbedBuilder()
    .setColor(COLORS[type] || COLORS.neutral)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setTimestamp();
}

function success(guild, description) {
  return baseEmbed(guild, "success")
    .setTitle("تم تنفيذ العملية")
    .setDescription(description);
}

function error(guild, description) {
  return baseEmbed(guild, "error")
    .setTitle("حدث خطأ")
    .setDescription(description);
}

function neutral(guild, title, description) {
  return baseEmbed(guild, "neutral")
    .setTitle(title)
    .setDescription(description);
}

function panel(guild, title, description) {
  return baseEmbed(guild, "panel")
    .setTitle(title)
    .setDescription(description);
}

function log(guild, description) {
  return baseEmbed(guild, "log")
    .setTitle("سجل عملية نقاط")
    .setDescription(description);
}

module.exports = {
  baseEmbed,
  success,
  error,
  neutral,
  panel,
  log,
  COLORS
};
