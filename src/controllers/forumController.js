const firestoreService = require("../services/firestoreService");
const documentExistsMiddleware = require("../middlewares/documentExistsMiddleware");

const { where, orderBy, limit } = require("firebase/firestore");
const { getTimeDurationString } = require("../utils/dateTimeUtils");
const { generateNotification } = require("../middlewares/notificationsMiddleware");


exports.assertThreadExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`threads/${req.threadID}`, res, next);
};

exports.formatForumData = (forumData, forumUserData) => {
    if (!forumData.isContentVisible) {
        return null;
    } // Reject request for thread that is invisible
    return {
        threadID: forumData.docId,
        threadType: forumData.threadType,
        threadTitle: forumData.threadTitle,
        threadDescription: forumData.threadDescription,
        threadScore: forumData.likes.length,
        threadDateTime: getTimeDurationString(
            new Date(),
            new Date(forumData.threadDateTime)
        ),
        userData: {
            userID: forumUserData.docId,
            profilePicture: forumUserData.profilePicture,
            fullName: forumUserData.fullName,
            description: forumUserData.courseName, // no description in firestore db, putting courseName for now
        },
        liked: forumData.likes.includes(forumUserData.docId),
    };
};

exports.getForumData = async (req, res, next) => {
    // const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)

    const forumData = (
        await firestoreService.firebaseReadQuery(
            `threads`,
            [
                where("threadType", "==", "forum"),
                orderBy("threadDateTime", "desc"),
                req.query.limit && limit(req.query.limit),
            ].filter(Boolean),
            next
        )
    ).filter((p) => p.isContentVisible); // Avoid fetching data for invisible posts;

    const modifiedForumData = await Promise.all(
        forumData.map(async (p) => {
            return this.formatForumData(
                p,
                await firestoreService.firebaseRead(`users/${p.authorId}`, next) // change firebase storage to fit authorID from userData
            );
        })
    );

    return res.status(200).send(modifiedForumData);
};

exports.getSingleThreadData = async (req, res, next) => {
    return res
        .status(200)
        .send(
            this.formatForumData(
                res.locals.currentData,
                await firestoreService.firebaseRead(
                    `users/${res.locals.currentData.authorId}`,
                    next
                )
            )
        );
};

exports.toggleThreadLike = async (req, res, next) => {
    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)
    const currentThreadLikes = res.locals.currentData.likes;

    if (res.locals.currentData.authorId !== currentUserID) {
        await firestoreService.firebaseWrite(
            `threads/${req.threadID}`,
            {
                likes: currentThreadLikes.includes(currentUserID)
                    ? currentThreadLikes.filter(
                          (user) => user !== currentUserID
                      )
                    : [...currentThreadLikes, currentUserID],
            },
            next
        );

        // Generate a notification to the relevant user
        generateNotification(
            res.locals.currentData.authorId,
            currentUserID,
            "liked your thread",
            next
        );

        return res.status(200).send();
    }

    return res.status(403).send();
};

exports.getThreadComments = async (req, res, next) => {
    const currentThreadComments = res.locals.currentData.comments
        .filter((c) => c.isContentVisible)
        .map(async (c) => {
            const { profilePicture, fullName, courseName } =
                await firestoreService.firebaseRead(
                    `users/${c.authorID}`,
                    next
                );

            return {
                commentID: c.commentID,
                commentDetails: c.commentDetails,
                commentID: c.commentID,
                likes: c.likes.length,
                isContentVisible: c.isContentVisible,
                userData: {
                    userID: c.authorID,
                    profilePicture: profilePicture,
                    fullName: fullName,
                    description: courseName,
                },
            };
        });

    const resolvedThreadComments = await Promise.all(currentThreadComments);
    res.status(200).send(resolvedThreadComments);
};

exports.addNewComment = async (req, res, next) => {
    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B";

    if (req.body.commentDetails) {
        const currentThreadComments = res.locals.currentData.comments;
        const newComment = {
            authorID: currentUserID,
            commentDetails: req.body.commentDetails,
            commentID: `${req.threadID}/${currentThreadComments.length + 1}`,
            isContentVisible: true,
            likes: [],
            time: new Date().toISOString(),
        };

        currentThreadComments.push(newComment);
        await firestoreService.firebaseWrite(
            `threads/${req.threadID}`,
            { comments: currentThreadComments },
            next
        );

        // Generate a notification to the relevant user (unless it is their own post)
        if (res.locals.currentData.authorId !== currentUserID) {
            generateNotification(
                res.locals.currentData.authorId,
                currentUserID,
                "commented on your thread",
                next
            );
        }

        return res.status(200).send();
    }

    return res
        .status(400)
        .send(
            `Missing expected value in request body: text (comment body may be empty)`
        );
};

exports.addNewThread = async (req, res, next) => {
    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B";

    if (req.body.threadTitle && req.body.threadDescription) {
        const newThread = {
            authorId: currentUserID,
            comments: [],
            isContentVisible: true,
            likes: [],
            threadDateTime: new Date().toISOString(),
            threadDescription: req.body.threadDescription,
            threadTitle: req.body.threadTitle,
            threadType: req.body.threadType,
        };

        await firestoreService.firebaseCreate(`threads`, newThread, next);
        return res.status(200).send();
    }
    return res
        .status(400)
        .send(
            `Missing expected value in request body: thread title and/or description`
        );
};
