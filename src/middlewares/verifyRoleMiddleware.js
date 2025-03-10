const firestoreService = require("../services/firestoreService");
const { throwError } = require("../middlewares/errorMiddleware");

exports.checkPermission = (permission, next) => {
    return async (req, res, next) => {
        const roles = {
            student: ["FEED", "FORUM"],
            moderator: ["FEED", "FORUM", "MODERATOR_DASHBOARD"],
        };
        res.locals.currentUserID = req.user.uid;

        const { userType } = await firestoreService.firebaseRead(
            `users/${res.locals.currentUserID}`,
            next
        );

        const allowedPermissions = roles[userType];

        if (allowedPermissions && allowedPermissions.includes(permission)) {
            return next();
        } else {
            throwError(404, `Permission not found.`, next);
        }
    };
};
