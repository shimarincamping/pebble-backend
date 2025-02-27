const express= require('express');
const LinkedInRouter=express.Router(); 
const linkedInService= require('../services/linkedInService');


//redirects to linked auth page to allow pebble access to user's acc

// LinkedInRouter.get('/',linkedInService.startLinkedInAuth);

LinkedInRouter.get('/',linkedInService.startLinkedInAuth);

//receives the code sent from linkedin and exchanges it for an access token required for
LinkedInRouter.get('/callback',linkedInService.handleAccessToken, linkedInService.handleLinkedInId); 
// LinkedInRouter.get('/callback',linkedInService.handleAccessToken);

LinkedInRouter.get('/newpost',linkedInService.postTest);

LinkedInRouter.get('/getID',linkedInService.handleLinkedInId);




module.exports = LinkedInRouter;