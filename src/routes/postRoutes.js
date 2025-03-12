const express = require("express");
const postRouter = express.Router();

const postController = require("../controllers/postController");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Get a collection of posts
postRouter.get("/", checkPermission("POST_GET"), postController.getPostsData);

// Create new post
postRouter.post("/", checkPermission("POST_CREATE"), postController.addNewPost);

// Pre-processes all routes that contain an ID parameter
postRouter.param("id", (req, res, next, id) => {
    req.postID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
postRouter.use("/:id", postController.assertPostExists);

// Other post routes
postRouter.get(
    "/:id",
    checkPermission("POST_GET"),
    postController.getSinglePostData
);

postRouter.put("/:id", checkPermission("POST_EDIT"), postController.editPost);

postRouter.delete(
    "/:id",
    checkPermission("POST_DELETE"),
    postController.deletePost
);

postRouter.put(
    "/:id/likes",
    checkPermission("POST_LIKE"),
    postController.togglePostLike
);

postRouter.get(
    "/:id/comments",
    checkPermission("POST_GET"),
    postController.getPostComments
);

postRouter.post(
    "/:id/comments",
    checkPermission("POST_CREATE"),
    postController.addNewComment
);

module.exports = postRouter;
