const express = require("express");
const threadRouter = express.Router();

const sentimentAnalysisMiddleware = require("../middlewares/sentimentAnalysisMiddleware"); 

// for sentiment analysis, carrys out sa and writes posts that are deemed to be offensive into firebase.
// the middlewares here do not hide the post yet.
threadRouter.post("/:id/flags", sentimentAnalysisMiddleware.getGeneratorOutput,
                              sentimentAnalysisMiddleware.getDiscriminatorOutput,
                              sentimentAnalysisMiddleware.parseFlag,
                              sentimentAnalysisMiddleware.writeFlag                        
);

module.exports = threadRouter;