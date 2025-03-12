const express = require("express");
const postRouter = express.Router();

const postController = require("../controllers/postController");
const sentimentAnalysisMiddleware = require("../middlewares/sentimentAnalysisMiddleware"); 
const linkedInService = require("../services/linkedInService");

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Get a collection of posts
postRouter.get("/", checkPermission("POST_GET"), postController.getPostsData);

// Create new post
postRouter.post(
    "/createPost",
    checkPermission("POST_CREATE"),
    postController.addNewPost
);

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

// for sentiment analysis, carrys out sa and writes posts that are deemed to be offensive into firebase.
//requires 'text', 'postType','commentID'(if applicable) in the body.
// id (the req.param) is the docID of the selected content.
//'text' is a string of the content that should be analysed 
//postType can be 'post','thread','postComment' or 'threadComment'

postRouter.post("/:id/flags", sentimentAnalysisMiddleware.getGeneratorOutput,
                              sentimentAnalysisMiddleware.getDiscriminatorOutput,
                              sentimentAnalysisMiddleware.parseFlag,
                              sentimentAnalysisMiddleware.writeFlag                        
);

//requires currentUserID in the req body and id (docId of the content to sync) as a paramter
postRouter.post("/:id/linkedin",linkedInService.startSync);

module.exports = postRouter;
 