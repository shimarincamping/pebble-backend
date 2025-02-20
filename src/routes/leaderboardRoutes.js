const express = require('express');
const leaderboardRouter = express.Router();

const leaderboardController = require('../controllers/leaderboardController');


// Route definitions
leaderboardRouter.get("/", leaderboardController.checkLastRefresh, leaderboardController.getLeaderboardData);



module.exports = leaderboardRouter;