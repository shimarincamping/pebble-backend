const express = require("express");
const postRouter = express.Router();

const postController = require("../controllers/postController");

// Get a collection of posts
postRouter.get("/", postController.getPostsData);

// Create new post
postRouter.post("/createPost", postController.addNewPost);

// Pre-processes all routes that contain an ID parameter
postRouter.param("id", (req, res, next, id) => {
    req.postID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
postRouter.use("/:id", postController.assertPostExists);

// Other post routes
postRouter.get("/:id", postController.getSinglePostData);
postRouter.put("/:id/likes", postController.togglePostLike);
postRouter.get("/:id/comments", postController.getPostComments);
postRouter.post("/:id/comments", postController.addNewComment);

module.exports = postRouter;
