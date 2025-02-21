const express = require('express');
const rewardRouter = express.Router();

const rewardController = require('../controllers/rewardController');

// Route definitions
rewardRouter.get("/", rewardController.getAllRewards);


module.exports = rewardRouter;