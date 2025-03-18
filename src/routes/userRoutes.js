const express = require("express");
const userRouter = express.Router();

const userController = require("../controllers/userController");
const cv = require("../middlewares/cvGeneratorMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { checkPermission } = require("../middlewares/verifyRoleMiddleware");

// Pre-processes all routes that contain an ID parameter
userRouter.param("id", (req, res, next, id) => {
    req.userID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
userRouter.use("/:id", userController.assertUserExists);

userRouter.get("/", checkPermission("USER_GET"), userController.getAllUserData); // Get all users
userRouter.get("/:id", checkPermission("USER_GET"), userController.getUserData); // Get a specific user
userRouter.post(
    "/",
    checkPermission("USER_POST"),
    userController.assertUserEmailNotRegistered,
    userController.registerNewUser
); // Create a new user
userRouter.delete(
    "/:id",
    checkPermission("USER_DELETE"),
    userController.deleteUser
); // Delete a user

// Sidebar and Navigation Panel
userRouter.get(
    "/:id/notifications",
    checkPermission("USER_GET"),
    userController.getUserNotifications
);
userRouter.get(
    "/:id/profile-information/basic",
    checkPermission("USER_GET"),
    userController.getUserInformation(false)
);
userRouter.get(
    "/:id/network",
    checkPermission("USER_GET"),
    userController.getUserNetworkInformation
);
userRouter.get(
    "/:id/stats",
    checkPermission("USER_GET"),
    userController.getUserStatsInformation
);
userRouter.get(
    "/:id/currency",
    checkPermission("USER_GET"),
    userController.getUserCurrencyInformation
);

// User Profile
userRouter.get(
    "/:id/profile-information/full",
    checkPermission("USER_GET"),
    userController.getUserInformation(true)
);
userRouter.put(
    "/:id",
    checkPermission("USER_PUT"),
    upload.single("file"),
    userController.updateUserInformation
);
userRouter.put(
    "/:id/followers",
    checkPermission("USER_PUT"),
    userController.toggleFollower
);
userRouter.get(
    "/:id/cv",
    checkPermission("USER_GET"),
    userController.getGeneratedCV
);

userRouter.post("/:id/cv", cv.generateCV);

module.exports = userRouter;
