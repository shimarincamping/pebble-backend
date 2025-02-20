const express = require('express');
const goalRouter = express.Router();

const goalController = require('../controllers/goalController');


// Route definitions
goalRouter.get("/", goalController.checkLastRefresh, goalController.getGoalData);


module.exports = goalRouter;