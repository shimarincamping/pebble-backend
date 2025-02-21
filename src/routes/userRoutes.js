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


// Sidebar and Navigation Panel
userRouter.get("/:id/notifications", userController.getUserNotifications);
userRouter.get("/:id/profile-information/basic", userController.getUserInformation(false));
userRouter.get("/:id/network", userController.getUserNetworkInformation);
userRouter.get("/:id/stats", userController.getUserStatsInformation);
userRouter.get("/:id/currency", userController.getUserCurrencyInformation);


// User Profile
userRouter.get("/:id/profile-information/full", userController.getUserInformation(true));
userRouter.put("/:id", userController.updateUserInformation);
userRouter.put("/:id/followers", userController.toggleFollower);
userRouter.get("/:id/cv", userController.getGeneratedCV);


module.exports = userRouter;