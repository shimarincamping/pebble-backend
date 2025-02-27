const express = require("express");
const rewardRouter = express.Router();

const rewardController = require("../controllers/rewardController");

// Route definitions
rewardRouter.get("/", rewardController.getAllRewards);

// Tickets must exist before spinning the wheel
rewardRouter.use("/sendReward", rewardController.assertTicketExists);

// Sending rewards to user email
rewardRouter.post("/sendReward", rewardController.addNewReward);
module.exports = rewardRouter;
