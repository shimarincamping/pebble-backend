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

userRouter.get("/", userController.getAllUserData);     // Get all users
userRouter.get("/:id", userController.getUserData);     // Get a specific user
userRouter.post("/", userController.assertUserEmailNotRegistered, userController.registerNewUser);      // Create a new user
userRouter.delete("/:id", userController.deleteUser);       // Delete a user


// Create middleware for NOTIFICATION GENERATION and GOAL PROGRESS TRACKING


// Sidebar and Navigation Panel
userRouter.get("/:id/notifications", userController.getUserNotifications);


module.exports = userRouter;