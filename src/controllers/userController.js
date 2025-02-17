const firestoreService = require('../services/firestoreService');
const documentExistsMiddleware = require('../middlewares/documentExistsMiddleware');

const { getTimeDurationString } = require('../utils/dateTimeUtils');

// User existance checking
exports.assertUserExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`users/${req.userID}`, res, next);
}

exports.assertUserEmailNotRegistered = (req, res, next) => {
    documentExistsMiddleware.assertUniquePropertyNotExists(`users`, "email", req.body.email, next);
}


// Basic User operations
exports.getAllUserData = (req, res, next) => {
    firestoreService.firebaseReadAll(`users`, next)
        .then((usersData) => {
            return res.status(200).send(usersData);
        });
}

exports.getUserData = (req, res, next) => {         
    return res.status(200).send(res.locals.currentData);            
} // Data is set by assertExists and saved into res.locals.currentData (avoids recalling Firebase)


exports.deleteUser = (req, res, next) => {
    firestoreService.firebaseDelete(`users/${req.userID}`, next)
        .then(() => {
            return res.status(204).send();
        });
}

exports.registerNewUser = (req, res, next) => {         // TODO: Integrate this to use Firebase Auth UID as key
    firestoreService.firebaseCreate(`users`, req.body, next)
        .then((resp) => {
            return res.status(201).send(`The user ID ${resp.id} was successfully registered at email ${req.body.email}.
                Firebase sent the following response: ${JSON.stringify(resp)}`);
        });
}


// Sidebar and Navigation Panel
exports.getUserNotifications = (req, res, next) => {
    firestoreService.firebaseRead(`users/notifications`, next)
        .then((resp) => {
            const notificationDateObj = new Date(resp.notificationDateTime);
            const timeDifference = getTimeDurationString(Math.ceil((new Date() - notificationDateObj) / 1000));

            return res.status(200).send({
                notificationTriggeredBy : res.locals.currentData.fullName,
                notificationImage : res.locals.currentData.profilePicture,
                notificationText : resp.notificationText,
                notificationDateTime : timeDifference
            });
        });
}