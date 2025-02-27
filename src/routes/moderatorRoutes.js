const express = require("express");
const moderatorRouter = express.Router();

const moderatorController = require("../controllers/moderatorController");

// Get a collection of flagged content
moderatorRouter.get("/flags", moderatorController.getFlaggedData);

module.exports = moderatorRouter;
