const express = require('express');
const postRouter = express.Router();

const postController = require('../controllers/postController');


// Get a collection of posts
postRouter.get("/", postController.getPostsData);

// Pre-processes all routes that contain an ID parameter
postRouter.param("id", (req, res, next, id) => {        
    req.postID = id;
    next();
})

// ID must exist to perform operations that involve an ID parameter
postRouter.use("/:id", postController.assertPostExists);


// Other post routes
postRouter.get("/:id", postController.getSinglePostData);



module.exports = postRouter;