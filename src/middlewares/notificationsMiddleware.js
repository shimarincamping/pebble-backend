const firestoreService = require('../services/firestoreService');

exports.generateNotification = async (userID, notificationTriggeredBy, notificationText, next) => {

    const newNotification = {
        notificationDateTime : new Date().toISOString(),
        notificationTriggeredBy : notificationTriggeredBy,
        notificationText : notificationText
    }

    const { notifications } = await firestoreService.firebaseRead(`users/${userID}`, next);

    firestoreService.firebaseWrite(
        `users/${userID}`,
        { notifications : [newNotification, ...notifications] },
        next
    )

    /*
        Unhandled notification types:
            - New thread comment
            - New thread comment reply
    */

}