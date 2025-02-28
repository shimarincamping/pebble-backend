const firestoreService = require("../services/firestoreService");
const documentExistsMiddleware = require("../middlewares/documentExistsMiddleware");

const { where, orderBy, limit } = require("firebase/firestore");
const { updateGoalProgress } = require("../middlewares/goalsRewardsMiddleware");

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
        `threads`,
        [
            where("threadType", "==", "roadmap"),
            orderBy("roadmapCreatedAt", "desc"),
            req.query.limit && limit(req.query.limit),
        ].filter(Boolean),
        next
    );

    return res.status(200).send(roadmapData);
};

exports.getSingleThreadData = async (req, res, next) => {

    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)
    
    // Increment goal related to reading career roadmap
    updateGoalProgress("ke07miaMSI6icNq48sWB", currentUserID, next);

    return res.status(200).send(this.formatRoadmapData(res.locals.currentData));
};

exports.addNewThread = async (req, res, next) => {
    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B";

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
    return res
        .status(400)
        .send(`Missing expected value in request body: thread title`);
};
