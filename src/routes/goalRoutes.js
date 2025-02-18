const express = require('express');
const goalRouter = express.Router();

const goalController = require('../controllers/goalController');


goalRouter.get("/", goalController.getGoalData);


module.exports = goalRouter;