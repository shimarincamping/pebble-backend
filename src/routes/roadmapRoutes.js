const express = require("express");
const roadmapRouter = express.Router();

const roadmapController = require("../controllers/roadmapController");

// Get a collection of roadmaps
roadmapRouter.get("/", roadmapController.getRoadmapData);

// Create new roadmap
roadmapRouter.post("/createRoadmap", roadmapController.addNewThread);

// Pre-processes all routes that contain an ID parameter
roadmapRouter.param("id", (req, res, next, id) => {
    req.threadID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
roadmapRouter.use("/:id", roadmapController.assertThreadExists);

// Other roadmap routes
roadmapRouter.get("/:id", roadmapController.getSingleThreadData);

module.exports = roadmapRouter;
