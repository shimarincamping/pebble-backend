const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userController');

// The following test code illustrates how routes should behave


// Pre-processes all routes that contain an ID parameter
userRouter.param("id", (req, res, next, id) => {        
    req.userID = Number(id);
    req.userName = "John Doe";

    next();
})                                                          // This callback can also be extracted into the controller


// Try accessing http://localhost:4001/users or http://localhost:4001/users/ANY_VALUE and understand the stack trace!
userRouter.get("/", userController.getUsersBasePath, userController.testFuncFail);
userRouter.get("/:id", userController.getNameById);



module.exports = userRouter;