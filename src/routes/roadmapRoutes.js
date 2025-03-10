const express = require("express");
const roadmapRouter = express.Router();

const roadmapController = require("../controllers/roadmapController");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Get a collection of roadmaps
roadmapRouter.get(
    "/",
    checkPermission("ROADMAP_GET"),
    roadmapController.getRoadmapData
);

// Create new roadmap
roadmapRouter.post(
    "/createRoadmap",
    checkPermission("ROADMAP_POST"),
    roadmapController.addNewThread
);

// Pre-process all routes that contain an ID parameter
roadmapRouter.param("id", (req, res, next, id) => {
    req.threadID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
roadmapRouter.use("/:id", roadmapController.assertThreadExists);

// Get a single roadmap thread
roadmapRouter.get(
    "/:id",
    checkPermission("ROADMAP_GET"),
    roadmapController.getSingleThreadData
);

// Edit a roadmap thread
roadmapRouter.put(
    "/:id/editRoadmap",
    checkPermission("ROADMAP_PUT"),
    roadmapController.editRoadmapThread
);

// Delete a roadmap thread
roadmapRouter.delete(
    "/:id/deleteRoadmap",
    checkPermission("ROADMAP_DELETE"),
    roadmapController.deleteRoadmapThread
);

module.exports = roadmapRouter;
