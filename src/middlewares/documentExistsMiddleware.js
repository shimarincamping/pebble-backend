const firestoreService = require('../services/firestoreService');
const { throwError } = require('../middlewares/errorMiddleware');
const { where } = require("firebase/firestore");

exports.assertExists = (path, res, next) => {
    firestoreService.firebaseRead(path, next)
        .then((data) => {
            if (data) {
                res.locals.currentData = data;
                return next();
            }

            throwError(404, `The resource at path ${path} was not found.`, next);
        });
}

exports.assertNotExists = (path, next) => {
    firestoreService.firebaseRead(path, next) 
        .then((data) => {
            if (!data) {
                return next();
            }

            throwError(403, `The resource at path ${path} already exists.`, next);
        });
}

exports.assertUniquePropertyNotExists = (path, field, value, next) => {
    firestoreService.firebaseReadIf(path, [where(field, "==", value)], next)
        .then((data) => {
            if (data.length === 0) {
                return next();
            }

            throwError(403, `A resource in the path ${path} already exists with ${field} as ${value}`, next);
        });
}