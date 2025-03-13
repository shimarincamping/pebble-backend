const express = require("express");
const forumRouter = express.Router();

const forumController = require("../controllers/forumController");
const sentimentAnalysisMiddleware = require("../middlewares/sentimentAnalysisMiddleware"); 

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Get a collection of forum threads
forumRouter.get(
    "/",
    checkPermission("FORUM_THREAD_GET"),
    forumController.getForumData
);

// Create new forum thread
forumRouter.post(
    "/createForumThread",
    checkPermission("FORUM_THREAD_POST"),
    forumController.addNewThread
);

// Pre-processes all routes that contain an ID parameter
forumRouter.param("id", (req, res, next, id) => {
    req.threadID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
forumRouter.use("/:id", forumController.assertThreadExists);

// Other forum thread routes
forumRouter.get(
    "/:id",
    checkPermission("FORUM_THREAD_GET"),
    forumController.getSingleThreadData
);
forumRouter.put(
    "/:id/likes",
    checkPermission("FORUM_THREAD_LIKE"),
    forumController.toggleThreadLike
);
forumRouter.get(
    "/:id/comments",
    checkPermission("FORUM_THREAD_GET"),
    forumController.getThreadComments
);
forumRouter.post(
    "/:id/comments",
    checkPermission("FORUM_THREAD_POST"),
    forumController.addNewComment
);

forumRouter.post("/:id/flags", checkPermission("FLAGS_POST"),
    sentimentAnalysisMiddleware.getGeneratorOutput,
    sentimentAnalysisMiddleware.getDiscriminatorOutput,
    sentimentAnalysisMiddleware.parseFlag,
    sentimentAnalysisMiddleware.writeFlag                        
);

module.exports = forumRouter;
