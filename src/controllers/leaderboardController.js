const firestoreService = require('../services/firestoreService');

const { where, orderBy } = require("firebase/firestore");
const { hasCooldownElapsed } = require('../utils/dateTimeUtils');
const { POINTS_PER_TICKET } = require('../middlewares/goalsRewardsMiddleware');


exports.checkLastRefresh = async (req, res, next) => {
    const { lastRefresh } = await firestoreService.firebaseRead(`global/leaderboard`, next);
    if (hasCooldownElapsed(new Date(), new Date(lastRefresh), { minute : 15 })) {
        return refreshLeaderboard(next);
    } 

    next();
}

const mapDataToRequiredFormat = (u) => ({
    userID : u.docId,
    fullName : u.fullName,
    profilePicture : u.profilePicture,
    email : u.email,
    bio : u.about,
    courseName : u?.courseName || "A PEBBLE user",
    totalPoints : u?.pointCount || 0,
    totalTickets : Math.floor(u?.pointCount / POINTS_PER_TICKET) || 0,
    followerCount : u.followers.length
});


const refreshLeaderboard = async (next) => {
    const usersSortedByPoints = await firestoreService.firebaseReadQuery(
        `users`, 
        [ where("userType", "==", "student"), orderBy("pointCount", "desc") ],
        next
    );

    await firestoreService.firebaseWrite(
        `leaderboard/points`, 
        { rankings : usersSortedByPoints.map(mapDataToRequiredFormat) }, 
        next, true
    );

    await firestoreService.firebaseWrite(`global/leaderboard`, { lastRefresh : new Date().toISOString() });
    next();
}


exports.getLeaderboardData = async (req, res, next) => {
    const { rankings } = await firestoreService.firebaseRead(`leaderboard/points`, next);
    res.status(200).send(rankings.slice(0, 25));    // Only return the top 25 users
}