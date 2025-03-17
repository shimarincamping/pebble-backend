const express = require("express");
const linkedInRouter = express.Router();
const linkedInService = require("../services/linkedInService");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

//redirects to linked auth page to allow pebble access to user's acc

// LinkedInRouter.get('/',linkedInService.startLinkedInAuth);

linkedInRouter.get(
    "/",
    checkPermission("LINKEDIN_GET"),
    linkedInService.startSync
);

//receives the code sent from linkedin and exchanges it for an access token required for
linkedInRouter.get(
    "/callback",
    linkedInService.handleAccessToken,
    linkedInService.handleLinkedInId
    // linkedInService.startSync
);
// LinkedInRouter.get('/callback',linkedInService.handleAccessToken);

linkedInRouter.get("/getID", linkedInService.handleLinkedInId);

module.exports = linkedInRouter;
