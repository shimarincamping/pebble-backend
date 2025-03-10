const express = require("express");
const cvRouter = express.Router();

const cvGeneratorMiddleware = require("../middlewares/cvGeneratorMiddleware");

cvRouter.get('/', cvGeneratorMiddleware.generateCV);


module.exports = cvRouter;
