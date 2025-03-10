const express = require("express");
const { checkPermission } = require("../middlewares/verifyRoleMiddleware");
const codingChallengeRouter = express.Router();

const codingChallengeController = require("../controllers/codingChallengeController");

// Pre-processes all routes that contain an ID parameter
codingChallengeRouter.param("id", (req, res, next, id) => {
    req.codingChallengeID = id;
    next();
});

// ID must exist to perform operations that involve an ID parameter
codingChallengeRouter.use(
    "/:id",
    codingChallengeController.assertCodingChallengeExists
);

// Route definitions
codingChallengeRouter.get(
    "/",
    checkPermission("CODING_CHALLENGE_GET"),
    codingChallengeController.getAllCodingChallengeData
);
codingChallengeRouter.post(
    "/",
    checkPermission("CODING_CHALLENGE_POST"),
    codingChallengeController.createNewCodingChallenge
);
codingChallengeRouter.get(
    "/:id",
    checkPermission("CODING_CHALLENGE_GET"),
    codingChallengeController.getCodingChallengeData
);
codingChallengeRouter.delete(
    "/:id",
    checkPermission("CODING_CHALLENGE_DELETE"),
    codingChallengeController.deleteCodingChallenge
);
codingChallengeRouter.post(
    "/:id/user-progress",
    checkPermission("CODING_CHALLENGE_UPDATE_PROGRESS"),
    codingChallengeController.updateUserChallengeProgress
);

module.exports = codingChallengeRouter;
