const express = require("express");
const goalRouter = express.Router();

const goalController = require("../controllers/goalController");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Route definitions
goalRouter.get(
    "/",
    checkPermission("GOAL_GET"),
    goalController.checkLastRefresh,
    goalController.getGoalData
);

module.exports = goalRouter;
