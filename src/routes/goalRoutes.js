const express = require("express");
const goalRouter = express.Router();

const goalController = require("../controllers/goalController");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");


// Pre-processes all routes that contain an ID parameter
goalRouter.param("id", (req, res, next, id) => {
    req.goalID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
goalRouter.use(
    "/:id",
    goalController.assertGoalExists
);


// Route definitions
goalRouter.get(
    "/",
    checkPermission("GOAL_GET"),
    goalController.checkLastRefresh,
    goalController.getGoalData
);

module.exports = goalRouter;
