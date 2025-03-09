const express = require("express");
const roadmapRouter = express.Router();

const roadmapController = require("../controllers/roadmapController");

// Get a collection of roadmaps
roadmapRouter.get("/", roadmapController.getRoadmapData);

// Create new roadmap
roadmapRouter.post("/createRoadmap", roadmapController.addNewThread);

// Pre-process all routes that contain an ID parameter
roadmapRouter.param("id", (req, res, next, id) => {
    req.threadID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
roadmapRouter.use("/:id", roadmapController.assertThreadExists);

// Get a single roadmap thread
roadmapRouter.get("/:id", roadmapController.getSingleThreadData);

// Edit a roadmap thread
roadmapRouter.put("/:id/editRoadmap", roadmapController.editRoadmapThread);

// Delete a roadmap thread
roadmapRouter.delete("/:id/deleteRoadmap", roadmapController.deleteRoadmapThread);

module.exports = roadmapRouter;
