const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userController');

// The following test code illustrates how routes should behave


// Pre-processes all routes that contain an ID parameter
userRouter.param("id", (req, res, next, id) => {        
    req.userID = id;
    next();
})                                                        

// Get a specific user's information
userRouter.get("/", userController.getAllUserData);
userRouter.get("/:id", userController.assertUserExists, userController.getUserData);
    // For POST, I still haven't figured out how to auto-assign IDs (will need to be done later!)
userRouter.post("/:id", userController.assertUserNotExists, userController.registerNewUser); 
userRouter.delete("/:id", userController.assertUserExists, userController.deleteUser);


module.exports = userRouter;