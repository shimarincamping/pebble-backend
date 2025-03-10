const firestoreService = require("../services/firestoreService");

const { where } = require("firebase/firestore");
const {
    groupObjectsByFieldValues,
    sortObjectsByNumericFieldValues,
    sanitiseNewLineSequences,
} = require("../utils/dataManipulationUtils");
const { isTodayANewDay } = require("../utils/dateTimeUtils");

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
            next,
            true
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
            groupObjectsByFieldValues(
                sortObjectsByNumericFieldValues(
                    goalsData.map((g) => {
                        g.isGoalCompleted =
                            g.userProgress[currentUserID] >= g.progressMax;
                        const {
                            userProgress,
                            progressMax,
                            ...goalDataWithoutProgressInfo
                        } = g;
                        return goalDataWithoutProgressInfo;
                    }),
                    "goalPoints"
                ),
                "goalType"
            )
        );
    });
};
