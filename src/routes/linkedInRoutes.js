const express = require("express");
const LinkedInRouter = express.Router();
const linkedInService = require("../services/linkedInService");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

//redirects to linked auth page to allow pebble access to user's acc

// LinkedInRouter.get('/',linkedInService.startLinkedInAuth);

LinkedInRouter.get(
    "/",
    checkPermission("LINKEDIN_GET"),
    linkedInService.startSync
);

//receives the code sent from linkedin and exchanges it for an access token required for
LinkedInRouter.get(
    "/callback",
    linkedInService.handleAccessToken,
    linkedInService.handleLinkedInId
    // linkedInService.startSync
);
// LinkedInRouter.get('/callback',linkedInService.handleAccessToken);

LinkedInRouter.get("/getID", linkedInService.handleLinkedInId);

module.exports = LinkedInRouter;
