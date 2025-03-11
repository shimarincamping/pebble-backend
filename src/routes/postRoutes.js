const express = require("express");
const postRouter = express.Router();

const postController = require("../controllers/postController");
const sentimentAnalysisMiddleware = require("../middlewares/sentimentAnalysisMiddleware"); 

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
postRouter.put("/:id", postController.editPost);
postRouter.delete("/:id", postController.deletePost);
postRouter.put("/:id/likes", postController.togglePostLike);
postRouter.get("/:id/comments", postController.getPostComments);
postRouter.post("/:id/comments", postController.addNewComment);

// for sentiment analysis, carrys out sa and writes posts that are deemed to be offensive into firebase.
// the middlewares here do not hide the post yet.
postRouter.post("/:id/flags", sentimentAnalysisMiddleware.getGeneratorOutput,
                              sentimentAnalysisMiddleware.getDiscriminatorOutput,
                              sentimentAnalysisMiddleware.parseFlag,
                              sentimentAnalysisMiddleware.writeFlag                        
);

module.exports = postRouter;
 