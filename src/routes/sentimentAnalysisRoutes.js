const express= require('express');
const sentimentAnalysisRouter = express.Router(); 
const geminiService= require('../services/geminiService');


sentimentAnalysisRouter.get('/',geminiService.getGeneratorOutput,geminiService.getDiscriminatorOutput);


module.exports = sentimentAnalysisRouter;