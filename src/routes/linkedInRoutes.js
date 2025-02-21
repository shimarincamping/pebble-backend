const express= require('express');
const LinkedInRouter=express.Router(); 
const linkedInService= require('../services/linkedInService');


//idk wtf I am doing bro
LinkedInRouter.get('/',linkedInService.getAccessToken()); 