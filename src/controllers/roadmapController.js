const firestoreService = require("../services/firestoreService");
const documentExistsMiddleware = require("../middlewares/documentExistsMiddleware");

const { where, orderBy, limit } = require("firebase/firestore");
const { updateGoalProgress } = require("../middlewares/goalsRewardsMiddleware");
const { throwError } = require("../middlewares/errorMiddleware");

exports.assertThreadExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`threads/${req.threadID}`, res, next);
};

exports.formatRoadmapData = (roadmapData) => {
    return {
        roadmapThreadTitle: roadmapData.roadmapThreadTitle,
        roadmapThreadAuthor: roadmapData.roadmapThreadAuthor,
        roadmapProfileImageLink: roadmapData.roadmapProfileImageLink,
        roadmapBannerImageLink: roadmapData.roadmapBannerImageLink,
        roadmapDescription: roadmapData.roadmapDescription,
        roadmapSection: roadmapData.roadmapSection,
    };
};

exports.getRoadmapData = async (req, res, next) => {
    const roadmapData = await firestoreService.firebaseReadQuery(
        `threads`, [
            where("threadType", "==", "roadmap"),
            orderBy("roadmapCreatedAt", "desc"),
            req.query.limit && limit(req.query.limit),
        ].filter(Boolean),
        next
    );

    return res.status(200).send(roadmapData);
};

exports.getSingleThreadData = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    // Increment goal related to reading career roadmap
    updateGoalProgress("ke07miaMSI6icNq48sWB", currentUserID, next);

    return res.status(200).send(this.formatRoadmapData(res.locals.currentData));
};

exports.addNewThread = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    if (req.body.roadmapThreadTitle) {
        const newThread = {
            authorId: currentUserID,
            roadmapThreadTitle: req.body.roadmapThreadTitle,
            roadmapThreadAuthor: req.body.roadmapThreadAuthor,
            roadmapProfileImageLink: req.body.roadmapProfileImageLink,
            roadmapBannerImageLink: req.body.roadmapBannerImageLink,
            roadmapDescription: req.body.roadmapDescription,
            roadmapSection: req.body.roadmapSection,
            roadmapCreatedAt: new Date().toISOString(),
            threadType: "roadmap",
        };

        await firestoreService.firebaseCreate(`threads`, newThread, next);
        return res.status(200).send();
    }
    return throwError(400, `Missing expected value in request body: thread title`, next);
};

// TODO: res.locals.currentData already stores this information
    // and whether the document exists or not is already checked by documentExistsMiddleware
    // Refactor?
exports.editRoadmapThread = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;
    const threadID = req.params.threadID;

    if (!threadID) {
        return throwError(400, `Thread ID is required.`, next);
    }

    const updatedFields = {};
    const allowedFields = [
        "roadmapThreadTitle",
        "roadmapThreadAuthor",
        "roadmapProfileImageLink",
        "roadmapBannerImageLink",
        "roadmapDescription",
        "roadmapSection",
    ];

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updatedFields[field] = req.body[field];
        }
    }

    if (Object.keys(updatedFields).length === 0) {
        return throwError(400, `No valid fields provided for update.`, next);
    }

    try {
        const threadRef = `threads/${threadID}`;
        const threadData = await firestoreService.firebaseRead(threadRef, next);

        if (!threadData) {
            return throwError(404, `Thread not found.`, next);
        }

        if (threadData.authorId !== currentUserID) {
            return throwError(403, `You are not authorized to edit this roadmap thread.`, next);
        }

        await firestoreService.firebaseUpdate(threadRef, updatedFields, next);
        return res.status(200).send("Roadmap thread updated successfully.");
    } catch (error) {
        return next(error);
    }
};


// TODO: res.locals.currentData already stores this information
    // and whether the document exists or not is already checked by documentExistsMiddleware
    // Refactor?
exports.deleteRoadmapThread = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;
    const threadID = req.params.threadID;

    if (!threadID) {
        return throwError(400, `Thread ID is required.`, next);
    }

    try {
        const threadRef = `threads/${threadID}`;
        const threadData = await firestoreService.firebaseRead(threadRef, next);

        if (!threadData) {
            return throwError(404, `Thread not found.`, next);
        }

        if (threadData.authorId !== currentUserID) {
            return throwError(403, `You are not authorized to delete this roadmap thread.`, next);
        }

        await firestoreService.firebaseDelete(threadRef, next);
        return res.status(200).send("Roadmap thread deleted successfully.");
    } catch (error) {
        return next(error);
    }
};
