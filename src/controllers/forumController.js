const firestoreService = require("../services/firestoreService");
const documentExistsMiddleware = require("../middlewares/documentExistsMiddleware");

const { where, orderBy, limit } = require("firebase/firestore");
const { getTimeDurationString } = require("../utils/dateTimeUtils");
const {
    generateNotification,
} = require("../middlewares/notificationsMiddleware");

const { throwError } = require("../middlewares/errorMiddleware");

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
    const currentUserID = res.locals.currentUserID;

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

exports.concatForumComments = (o1, o2) => {
    return { ...o1, comments: o2 };
};

exports.getSingleThreadData = async (req, res, next) => {
    const threadComments = await this.getThreadComments(req, res, next);
    return res
        .status(200)
        .send(
            this.concatForumComments(
                this.formatForumData(
                    res.locals.currentData,
                    await firestoreService.firebaseRead(
                        `users/${res.locals.currentData.authorId}`,
                        next
                    )
                ),
                threadComments
            )
        );
};

exports.toggleThreadLike = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;
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
    // res.status(200).send(resolvedThreadComments);
    return resolvedThreadComments;
};

exports.addNewComment = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

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
    const currentUserID = res.locals.currentUserID;

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

// TODO: Edit/delete comment?

exports.editForumThread = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    if (!req.body?.threadDescription || !req.body?.threadTitle) {
        return throwError(
            400,
            `Missing expected value in request body: newThreadDescription or newThreadTitle`,
            next
        );
    }

    if (res.locals.currentData.authorId !== currentUserID) {
        return throwError(
            403,
            `User attempted to edit post created by another user`,
            next
        );
    }

    await firestoreService.firebaseWrite(
        `threads/${res.locals.currentData.docId}`,
        {
            threadTitle: req.body.threadTitle,
            threadDescription: req.body.threadDescription,
        },
        next
    );
};

exports.deleteForumThread = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    if (res.locals.currentData.authorId !== currentUserID) {
        return throwError(
            403,
            `User attempted to delete post created by another user`,
            next
        );
    }

    await firestoreService.firebaseWrite(
        `threads/${res.locals.currentData.docId}`,
        { isContentVisible: false },
        next
    );

    return res.status(204).send();
};

exports.toggleCommentLike = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    const currentCommentID = req.body.commentID;

    let editedCommentData = await res.locals.currentData.comments.map((c) => {
        if (c.commentID == currentCommentID) {
            const currentCommentLikes = c.likes;
            if (c.authorID == currentUserID) {
                return throwError(
                    403,
                    `User cannot like their own comments`,
                    next
                );
            }
            return {
                ...c,
                likes: currentCommentLikes.includes(currentUserID)
                    ? currentCommentLikes.filter(
                          (user) => user !== currentUserID
                      )
                    : [...currentCommentLikes, currentUserID],
            };
        } else {
            return c;
        }
    });

    await firestoreService.firebaseWrite(
        `threads/${res.locals.currentData.docId}`,
        { comments: editedCommentData },
        next
    );

    res.status(200).send();
};

exports.editCommentThread = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    const currentCommentID = req.body.commentID;

    let editedCommentData = await res.locals.currentData.comments.map((c) => {
        if (c.commentID == currentCommentID) {
            if (c.authorID !== currentUserID) {
                return throwError(
                    403,
                    `User attempted to edit comment created by another user`,
                    next
                );
            }
            return {
                ...c,
                commentDetails: req.body.commentDetails,
            };
        } else {
            return c;
        }
    });

    await firestoreService.firebaseWrite(
        `threads/${res.locals.currentData.docId}`,
        { comments: editedCommentData },
        next
    );

    return res.status(200).send();
};

exports.deleteCommentThread = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    const currentCommentID = req.body.commentID;

    let editedCommentData = await res.locals.currentData.comments.map((c) => {
        if (c.commentID == currentCommentID) {
            if (c.authorID !== currentUserID) {
                return throwError(
                    403,
                    `User attempted to delete comment created by another user`,
                    next
                );
            }
            return {
                ...c,
                isContentVisible: false,
            };
        } else {
            return c;
        }
    });

    await firestoreService.firebaseWrite(
        `threads/${res.locals.currentData.docId}`,
        { comments: editedCommentData },
        next
    );
    return res.status(200).send();
};
