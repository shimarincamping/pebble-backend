const firestoreService = require("../services/firestoreService");

const { where } = require("firebase/firestore");
const { groupObjectsByFieldValues, sortObjectsByNumericFieldValues } = require("../utils/dataManipulationUtils");
const { isTodayANewDay } = require("../utils/dateTimeUtils");


exports.assertGoalExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`goals/${req.goalID}`, res, next);
};

// Reads global/goals/lastRefresh and compares dates
exports.checkLastRefresh = (req, res, next) => {
    firestoreService
        .firebaseRead(`global/goals`, next)
        .then(({ lastRefresh }) => {
            if (isTodayANewDay(new Date(), new Date(lastRefresh))) {
                return refreshDailyGoals(next);
            }

            next();
        });
};

// Only called if lastRefresh was yesterday or older
const refreshDailyGoals = async (next) => {
    const goalsToUpdate = await firestoreService.firebaseReadQuery(
        `goals`,
        [where("goalType", "==", "daily")],
        next
    );
    const updatePromises = goalsToUpdate.map((goal) => {
        firestoreService.firebaseWrite(
            `goals/${goal.docId}`,
            { ...goal, userProgress: {} },
            next, true
        );
    });

    await Promise.all(updatePromises);
    await firestoreService.firebaseWrite(`global/goals`, {
        lastRefresh: new Date().toISOString(),
    });

    return next();
};

exports.getGoalData = (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    firestoreService.firebaseReadAll(`goals`, next).then((goalsData) => {
        return res.status(200).send(
            groupObjectsByFieldValues(sortObjectsByNumericFieldValues(
                goalsData.map((g) => {
                    g.isGoalCompleted = g.userProgress[currentUserID] >= g.progressMax;
                    const { userProgress, progressMax, ...goalDataWithoutProgressInfo } = g;
                    return goalDataWithoutProgressInfo;
                }), "goalPoints"
            ), "goalType")
        );
    });
};

exports.createNewGoal = (req, res, next) => {
    if (req.body != null) {
        firestoreService.firebaseCreate(
            `goals`, {
                goalTitle : req.body.goalTitle || "New Goal",
                goalDescription : req.body.goalDescription || "Complete this goal for points!",
                goalType : (req.body.goalType === "daily" ) ? "daily" : "core",
                goalPoints : req.body.goalPoints || 0,
                progressMax : req.body.progressMax || 1,
                userProgress : {}
            }, next
        ).then(() => {
            return res.status(201).send();
        });
    } else {
        return throwError(400, `Missing expected object in request body`, next);
    }
}

exports.editGoalData = async (req, res, next) => {

    const { goalTitle, goalDescription, goalType, goalPoints, progressMax } = req.body;

    const newGoalInformation = Object.fromEntries(
            Object.entries({
                goalTitle,
                goalDescription,
                goalType,
                goalPoints,
                progressMax
            }).filter(([k, v]) => v != null)
        ); // Filter out fields that are not in the request body

        await firestoreService.firebaseWrite(`users/${req.userID}`, newGoalInformation, next);

        return res.status(200).send();
}


exports.deleteGoal = (req, res, next) => {
    firestoreService.firebaseDelete(
        `goals/${req.goalID}`, 
        next
    ).then(() => {
        return res.status(204).send();
    });
}