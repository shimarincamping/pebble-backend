const firestoreService = require('../services/firestoreService');

const { where, FieldValue } = require("firebase/firestore");
const { groupObjectsByFieldValues, sortObjectsByNumericFieldValues, sanitiseNewLineSequences } = require('../utils/dataManipulationUtils');
const { isTodayANewDay } = require('../utils/dateTimeUtils');


// Reads global/goals/lastRefresh and compares dates
exports.checkLastRefresh = (req, res, next) => {
    firestoreService.firebaseRead(`global/goals`, next) 
        .then(({ lastRefresh }) => {
            if (isTodayANewDay(new Date(), new Date(lastRefresh))) {
                return refreshDailyGoals(next);
            } 

            next();
        })
}

// Only called if lastRefresh was yesterday or older
const refreshDailyGoals = async (next) => {
    const goalsToUpdate = await firestoreService.firebaseReadQuery(`goals`, [where("goalType", "==", "daily")], next);
    const updatePromises = goalsToUpdate.map((goal) => {
        firestoreService.firebaseWrite(`goals/${goal.docId}`, { ...goal, userProgress: {} }, next, true);
    })
    
    await Promise.all(updatePromises);
    await firestoreService.firebaseWrite(`global/goals`, { lastRefresh : new Date().toISOString() });

    return next();
}


exports.getGoalData = (req, res, next) => {

    const currentUserID = req.currentUserID || "3"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to 3)

    firestoreService.firebaseReadAll(`goals`, next)
        .then((goalsData) => {
            res.status(200).send(
                groupObjectsByFieldValues(sortObjectsByNumericFieldValues(goalsData.map(g => {
                    g.isGoalCompleted = (g.userProgress[currentUserID] >= g.progressMax);
                    const { userProgress, progressMax, ...goalDataWithoutProgressInfo } = g;
                    return goalDataWithoutProgressInfo;
                }), "goalPoints"), "goalType")
            );
        });  
}


// Needs to be called in actions that coincide with goal actions
exports.updateGoalProgress = async (goalID, userID, next, increment=1) => {

    const { userProgress } = await firestoreService.firebaseRead(`goals/${goalID}`, next);
    const currentUserProgress = userProgress?.[userID];

    firestoreService.firebaseWrite(
        `goals/${goalID}`,
        { userProgress : { [userID] : currentUserProgress + increment || increment } }, 
        next
    );
}