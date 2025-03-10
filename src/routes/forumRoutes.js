const express = require("express");
const forumRouter = express.Router();

const forumController = require("../controllers/forumController");

const { verifyJwtToken } = require("../services/jwtService");
const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Get a collection of forum threads
forumRouter.get("/", forumController.getForumData);

// Create new forum thread
forumRouter.post(
    "/createForumThread",
    verifyJwtToken,
    checkPermission("FORUM"),
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
forumRouter.get("/:id", forumController.getSingleThreadData);
forumRouter.put("/:id/likes", forumController.toggleThreadLike);
forumRouter.get("/:id/comments", forumController.getThreadComments);
forumRouter.post(
    "/:id/comments",
    verifyJwtToken,
    checkPermission("FORUM"),
    forumController.addNewComment
);

module.exports = forumRouter;
