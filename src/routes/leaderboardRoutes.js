const express = require('express');
const leaderboardRouter = express.Router();

const leaderboardController = require('../controllers/leaderboardController');


leaderboardRouter.get("/", leaderboardController.checkLastRefresh, leaderboardController.getLeaderboardData);


module.exports = leaderboardRouter;