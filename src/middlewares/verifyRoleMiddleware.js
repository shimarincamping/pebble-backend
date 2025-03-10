const firestoreService = require("../services/firestoreService");
const { throwError } = require("../middlewares/errorMiddleware");
const { roles } = require("../middlewares/rolePermissions");

exports.checkPermission = (permission, next) => {
    return async (req, res, next) => {
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
