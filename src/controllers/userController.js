const firestoreService = require('../services/firestoreService');
const documentExistsMiddleware = require('../middlewares/documentExistsMiddleware');

const { where, select } = require("firebase/firestore");
const { objectReducer } = require('../utils/objectReducerUtils');
const { getTimeDurationString } = require('../utils/dateTimeUtils');


// ---------------------------------- //
// User existence checking
// ---------------------------------- //

exports.assertUserExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`users/${req.userID}`, res, next);
}

exports.assertUserEmailNotRegistered = (req, res, next) => {
    documentExistsMiddleware.assertUniquePropertyNotExists(`users`, "email", req.body.email, next);
}




// ---------------------------------- //
// Basic CRUD
// ---------------------------------- //

exports.getAllUserData = (req, res, next) => {
    firestoreService.firebaseReadAll(`users`, next)
        .then((usersData) => {
            return res.status(200).send(usersData);
        });
}

exports.getUserData = (req, res, next) => {         
    return res.status(200).send(res.locals.currentData);            
}   // Data is already set by assertExists and saved into res.locals.currentData (avoids recalling Firebase)


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




// ---------------------------------- //
// Sidebar and Navigation Panel
// ---------------------------------- //

exports.getUserNotifications = (req, res, next) => {

    const notifications = res.locals.currentData.notifications;

    if (!(notifications?.length)) {         
        res.status(200).send([]);
        return;     // If there are no notifications, return early
    }

    // Fetch user data based on notificationTriggeredBy
    firestoreService.firebaseReadQuery(
        `users`,
        [where('docId', 'in', notifications.map(n => n.notificationTriggeredBy))],
        next
    ).then((usersData) => {
        if (usersData) {
            const currentTime = new Date();
            const users = objectReducer(usersData);
            
            return res.status(200).send(
                notifications.map(n => ({
                    notificationTriggeredBy : users[n.notificationTriggeredBy].fullName,
                    notificationImage : users[n.notificationTriggeredBy].profilePicture,
                    notificationText : n.notificationText,
                    notificationDateTime : getTimeDurationString(currentTime, new Date(n.notificationDateTime))
                }))
            );
        }
    });
}