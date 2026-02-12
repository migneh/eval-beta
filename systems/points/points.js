const addPoints = require("./addPoints");
const removePoints = require("./removePoints");
const resetPoints = require("./resetPoints");
const leaderboard = require("./leaderboard");
const pointsCommand = require("./pointsCommand");

module.exports = async (client, message, command, args) => {

  switch (command) {

    case "add":
      return addPoints(client, message, args);

    case "remove":
      return removePoints(client, message, args);

    case "reset":
      return resetPoints(client, message);

    case "points":
      return pointsCommand(message, args);

    case "top":
      return leaderboard(client, message, message.author.id);

  }

};
