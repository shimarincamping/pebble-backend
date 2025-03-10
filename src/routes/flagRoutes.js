const express = require("express");
const flagRouter = express.Router();
const { verifyJwtToken } = require("../services/jwtService");
const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

const flagController = require("../controllers/flagController");

// Get a collection of flagged content
flagRouter.get(
    "/",
    checkPermission("MODERATOR_DASHBOARD_GET"),
    flagController.getFlaggedData
);

// Pre-processes all routes that contain an ID parameter
flagRouter.param("id", (req, res, next, id) => {
    req.flagID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
flagRouter.use("/:id", flagController.assertFlagExists);

// Approve or delete content
flagRouter.put("/:id/approve", flagController.approveContentVisibility);
flagRouter.put("/:id/deny", flagController.denyContentVisibility);

module.exports = flagRouter;
