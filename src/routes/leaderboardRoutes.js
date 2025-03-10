const express = require("express");
const leaderboardRouter = express.Router();

const leaderboardController = require("../controllers/leaderboardController");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Route definitions
leaderboardRouter.get(
    "/",
    checkPermission("LEADERBOARD_GET"),
    leaderboardController.checkLastRefresh,
    leaderboardController.getLeaderboardData
);

module.exports = leaderboardRouter;
