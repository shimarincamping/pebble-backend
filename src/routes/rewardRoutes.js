const express = require("express");
const rewardRouter = express.Router();

const rewardController = require("../controllers/rewardController");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Route definitions
rewardRouter.get(
    "/",
    checkPermission("REWARD_GET"),
    rewardController.getAllRewards
);

// Tickets must exist before spinning the wheel
rewardRouter.use("/sendReward", rewardController.assertTicketExists);

// Sending rewards to user email
rewardRouter.post(
    "/sendReward",
    checkPermission("REWARD_POST"),
    rewardController.addNewReward
);
module.exports = rewardRouter;
