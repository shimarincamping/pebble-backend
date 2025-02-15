const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userController');


// Pre-processes all routes that contain an ID parameter
userRouter.param("id", (req, res, next, id) => {        
    req.userID = id;
    next();
})

// ID must exist to perform operations that involve an ID parameter
userRouter.use("/:id", userController.assertUserExists);

// Get a specific user's information
userRouter.get("/", userController.getAllUserData);
userRouter.get("/:id", userController.getUserData);
userRouter.post("/", userController.assertUserEmailNotRegistered, userController.registerNewUser);
userRouter.delete("/:id", userController.deleteUser);


module.exports = userRouter;