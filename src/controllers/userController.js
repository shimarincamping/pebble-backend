const firestoreService = require('../services/firestoreService');
const documentExistsMiddleware = require('../middlewares/documentExistsMiddleware');

const { where, orderBy, limit } = require("firebase/firestore");
const { documentObjectArrayReduce, shuffleArray } = require('../utils/dataManipulationUtils');
const { getTimeDurationString } = require('../utils/dateTimeUtils');
const { formatPostData } = require('./postController');


exports.POINTS_PER_TICKET = 100;


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
            const users = documentObjectArrayReduce(usersData);
            
            return res.status(200).send(
                notifications.map(n => ({
                    notificationTriggeredBy : users[n.notificationTriggeredBy].fullName,
                    notificationImage : users[n.notificationTriggeredBy].profilePicture,
                    notificationText : n.notificationText,
                    notificationDateTime : getTimeDurationString(new Date(), new Date(n.notificationDateTime))
                }))
            );
        }
    });
}


exports.getUserNetworkInformation = async (req, res, next) => {

    const userFollowers = res.locals.currentData.followers;
    const userFollowing = res.locals.currentData.following;
    const mapDataToRequiredFormat = ({ docId, fullName, profilePicture }) => ({ 
        userID : docId, 
        shortName : fullName.split(" ")[0],
        profilePicture  
    });

    const userFollowersInformation = userFollowers.map((follower) => {
        firestoreService.firebaseRead(`users/${follower}`, next);
    });

    const suggestedUsersInformation = firestoreService.firebaseReadQuery(
        `users`,
        [where("docId", "not-in", [...userFollowing, req.userID])],
        next
    );

    const [resolvedUserFollowers, resolvedSuggestedUsers] = await Promise.all(
        [Promise.all(userFollowersInformation), suggestedUsersInformation]
    );

    shuffleArray(resolvedSuggestedUsers);

    return res.status(200).send({
        followerCount : userFollowers.length,
        myFollowers : resolvedUserFollowers.map(mapDataToRequiredFormat),
        mySuggestedUsers : resolvedSuggestedUsers.slice(0, 20).map(mapDataToRequiredFormat) // Returns maximum 20 values
    })
}

exports.getUserStatsInformation = async (req, res, next) => {
    return res.status(200).send({
        leaderboardRank : await firestoreService.firebaseRead(`leaderboard/points`, next)
                            .then(({rankings}) => {
                                return rankings.findIndex(u => u.userID === req.userID) + 1
                            }),
        totalPoints : res.locals.currentData?.pointCount || 0,
        tickets : res.locals.currentData?.ticketCount || 0
    })
}

exports.getUserCurrencyInformation = (req, res, next) => {
    return res.status(200).send({
        currentPoints : res.locals.currentData?.pointCount || 0,
        availableTickets : res.locals.currentData?.ticketCount || 0
    });
}

// ---------------------------------- //
// Profile Operations
// ---------------------------------- //

exports.getUserInformation = (isFullInformation) => {
    return async (req, res, next) => {

        const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to 3)

        const userInformation = {
            fullName : res.locals.currentData.fullName,
            profilePicture : res.locals.currentData.profilePicture,
            courseName : res.locals.currentData?.courseName || null,        // Not applicable for non-students
            currentYear : res.locals.currentData?.currentYear || null,      // Not applicable for non-current students
            userType : res.locals.currentData.userType, 
            about : res.locals.currentData.about,
            email : res.locals.currentData.email, 
            phoneNumber : res.locals.currentData?.phoneNumber || null,      // Not mandatory field
            discordUsername : res.locals.currentData?.discordUsername || null   // Not mandatory field
        }

        return res.status(200).send((isFullInformation) ? {
            ...userInformation,

            followerCount : res.locals.currentData.followers.length,
            isFollowingUser : currentUserID in res.locals.currentData.followers,
            latestPost : await firestoreService.firebaseReadQuery(
                `posts`,
                [
                    where("authorId", "==", req.userID),
                    orderBy("postCreatedAt", "desc"),
                    limit(1)
                ],
                next
            ).then(latestPostData => {
                return (latestPostData.length) ? formatPostData(latestPostData[0], res.locals.currentData) : null;
            }),

            profileDetails : {
                workExperience : res.locals.currentData.profileDetails.workExperience,
                coursesAndCertifications : res.locals.currentData.profileDetails.coursesAndCertifications,
                skills : res.locals.currentData.profileDetails.skills
            }
        } : userInformation);
    }
}

exports.updateUserInformation = async (req, res, next) => {

    // Extract only fields that users are allowed to modify directly
    const { fullName, profilePicture, courseName, currentYear, about, phoneNumber, discordUsername, profileDetails } = req.body;
    const newUserInformation = Object.fromEntries(
        Object.entries({ fullName, profilePicture, courseName, currentYear, about, phoneNumber, discordUsername, profileDetails })
            .filter(([k, v]) => v != null )
    );  // Filter out fields that are not in the request body

    await firestoreService.firebaseWrite(`users/${req.userID}`, newUserInformation, next);
    return res.status(200).send();
        
}

exports.toggleFollower = async (req, res, next) => {

    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to 3)

    if (req.userID === currentUserID) {     
        return res.status(403).send();      // Disallow users to toggle-follow themselves
    }

    // Update both followers (userID) and following (currentUserID)
    const targetUserFollowers = res.locals.currentData.followers;
    const selfFollowing = (await firestoreService.firebaseRead(`users/${currentUserID}`, next)).following;

    firestoreService.firebaseWrite(
        `users/${req.userID}`, 
        { followers : ((targetUserFollowers.includes(currentUserID)) 
                            ? targetUserFollowers.filter(user => user !== currentUserID)
                            : [...targetUserFollowers, currentUserID]) },
        next
    )

    firestoreService.firebaseWrite(
        `users/${currentUserID}`,
        { following : ((selfFollowing.includes(req.userID))
                            ? selfFollowing.filter(user => user !== req.userID)
                            : [...selfFollowing, req.userID]) },
        next
    )

    res.status(200).send();
}


exports.getGeneratedCV = async (req, res, next) => {
    return res.status(200).send(res.locals.currentData.latestCV);
}

// ---------------------------------- //
// Misc.
// ---------------------------------- //

exports.addPointsTicketsToUser = async (userID, numberOfPoints, next) => {
    
    // Read points and tickets
    const { pointCount, ticketCount } = await firestoreService.firebaseRead(`users/${userID}`);

    const newPointCount = pointCount + numberOfPoints;
    const newTicketCount = ticketCount + ( Math.floor(newPointCount / this.POINTS_PER_TICKET) - Math.floor(pointCount / this.POINTS_PER_TICKET) );

    // Add points and tickets
    firestoreService.firebaseWrite(
        `users/${userID}`,
        { pointCount : newPointCount, ticketCount : newTicketCount },
        next
    );
}


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

}