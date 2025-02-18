const firestoreService = require('../services/firestoreService');

const { groupObjectByFieldValues, sortObjectsByNumericFieldValues, sanitiseNewLineSequences } = require('../utils/dataManipulationUtils');


exports.getGoalData = (req, res, next) => {

    const currentUserID = req.currentUserID || "3"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to 3)

    firestoreService.firebaseReadAll(`goals`, next)
        .then((goalsData) => {
            return res.status(200).send(
                groupObjectByFieldValues(sortObjectsByNumericFieldValues(goalsData.map(g => {
                    g.isGoalCompleted = (g.userProgress[currentUserID] >= g.progressMax);
                    const { userProgress, progressMax, ...goalDataWithoutProgressInfo } = g;
                    return goalDataWithoutProgressInfo;
                }), "goalPoints"), "goalType")
            );
        });
}


// Add function(s) to manipulate Goals records here
    // The actions that can possibly trigger goals should call an instance of this function as part of its process.


/*

exports.updateGoalProgress = (params) => {      // Needs goal identifier, user identifier, number to increment = 1
    return (req, res, next) => {


    }    
}

*/