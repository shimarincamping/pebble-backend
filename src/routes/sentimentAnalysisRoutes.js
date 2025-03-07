const express= require('express');
const sentimentAnalysisRouter = express.Router(); 
const sentimentAnalysisMiddleware= require('../middlewares/sentimentAnalysisMiddleware');


sentimentAnalysisRouter.get('/',
    sentimentAnalysisMiddleware.getGeneratorOutput,
    sentimentAnalysisMiddleware.getDiscriminatorOutput,
    sentimentAnalysisMiddleware.parseFlag,
    sentimentAnalysisMiddleware.writeFlag
);
sentimentAnalysisRouter.get('/',sentimentAnalysisMiddleware.getGeneratorOutput,sentimentAnalysisMiddleware.getDiscriminatorOutput,sentimentAnalysisMiddleware.parseFlag);


module.exports = sentimentAnalysisRouter;