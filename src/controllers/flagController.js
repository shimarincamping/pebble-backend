const firestoreService = require("../services/firestoreService");
const { getTimeDurationString } = require("../utils/dateTimeUtils");
const documentExistsMiddleware = require("../middlewares/documentExistsMiddleware");

exports.assertFlagExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`flags/${req.flagID}`, res, next);
};

exports.formatFlaggedData = async (flaggedData, authorUserData, next) => {
    const flaggedDataType = flaggedData.contentType;
    let contentData = {};
    let commentData = {};
    let resolvedCommentData;

    // Has 4 kinds of data it can receive
    switch (flaggedDataType) {
        case "thread":
            contentData = await firestoreService.firebaseRead(
                `threads/${flaggedData.contentID}`,
                next
            );
            return {
                id: flaggedData.docId,
                user: authorUserData.fullName,
                time: getTimeDurationString(
                    new Date(),
                    new Date(contentData.threadDateTime)
                ),
                profilePic: authorUserData.profilePicture,
                postTitle: contentData.threadTitle,
                postAuthor: authorUserData.fullName,
                content: contentData.threadDescription,
            };

        case "post":
            contentData = await firestoreService.firebaseRead(
                `posts/${flaggedData.contentID}`,
                next
            );
            return {
                id: flaggedData.docId,
                user: authorUserData.fullName,
                time: getTimeDurationString(
                    new Date(),
                    new Date(contentData.postCreatedAt)
                ),
                profilePic: authorUserData.profilePicture,
                postTitle: contentData.title,
                postAuthor: authorUserData.fullName,
                content: contentData.postDesc,
            };

        case "threadComment":
            contentData = await firestoreService.firebaseRead(
                `threads/${flaggedData.contentID}`,
                next
            );

            commentData = await contentData.comments.map((c) => {
                if (c.commentID == flaggedData.commentID) {
                    return {
                        id: flaggedData.docId,
                        user: authorUserData.fullName,
                        time: getTimeDurationString(
                            new Date(),
                            new Date(c.time)
                        ),
                        profilePic: authorUserData.profilePicture,
                        postTitle: contentData.threadTitle,
                        postAuthor: authorUserData.fullName,
                        content: c.commentDetails,
                    };
                }
            });
            resolvedCommentData = await commentData.filter(Boolean);
            return resolvedCommentData[0];

        case "postComment":
            contentData = await firestoreService.firebaseRead(
                `posts/${flaggedData.contentID}`,
                next
            );

            commentData = await contentData.comments.map((c) => {
                if (c.commentID == flaggedData.commentID) {
                    return {
                        id: flaggedData.docId,
                        user: authorUserData.fullName,
                        time: getTimeDurationString(
                            new Date(),
                            new Date(c.time)
                        ),
                        profilePic: authorUserData.profilePicture,
                        postTitle: contentData.title,
                        postAuthor: authorUserData.fullName,
                        content: c.text,
                    };
                }
            });
            resolvedCommentData = await commentData.filter(Boolean);
            return resolvedCommentData[0];
    }
};

exports.getFlaggedData = async (req, res, next) => {
    const flaggedDataArray = await firestoreService.firebaseReadAll(
        `flags`,
        next
    );

    const modifiedFlaggedDataArray = await Promise.all(
        flaggedDataArray.map(async (f) => {
            return this.formatFlaggedData(
                f,
                await firestoreService.firebaseRead(`users/${f.authorID}`, next)
            );
        })
    );

    return res.status(200).send(modifiedFlaggedDataArray);
};

exports.approveContentVisibility = async (req, res, next) => {
    const flaggedData = res.locals.currentData;
    const flaggedDataType = flaggedData.contentType;

    let contentData = {};
    let commentData = {};
    let resolvedCommentData;

    // Has 4 kinds of data it can receive
    switch (flaggedDataType) {
        case "thread":
            contentData = await firestoreService.firebaseRead(
                `threads/${flaggedData.contentID}`,
                next
            );

            await firestoreService.firebaseWrite(
                `threads/${flaggedData.contentID}`,
                { isContentVisible: true },
                next
            );

            // await firestoreService.firebaseDelete(`flags/${flaggedData.docId}`);
            return res.status(200).send();

        case "post":
            contentData = await firestoreService.firebaseRead(
                `posts/${flaggedData.contentID}`,
                next
            );

            await firestoreService.firebaseWrite(
                `posts/${flaggedData.contentID}`,
                { isContentVisible: true },
                next
            );

            // await firestoreService.firebaseDelete(`flags/${flaggedData.docId}`);
            return res.status(200).send();

        case "threadComment":
            contentData = await firestoreService.firebaseRead(
                `threads/${flaggedData.contentID}`,
                next
            );
            commentData = await contentData.comments.map((c) => {
                if (c.commentID == flaggedData.commentID) {
                    return {
                        ...c,
                        isContentVisible: true,
                    };
                } else {
                    return c;
                }
            });

            await firestoreService.firebaseWrite(
                `threads/${flaggedData.contentID}`,
                { comments: commentData },
                next
            );

            // await firestoreService.firebaseDelete(`flags/${flaggedData.docId}`);
            return res.status(200).send();

        case "postComment":
            contentData = await firestoreService.firebaseRead(
                `posts/${flaggedData.contentID}`,
                next
            );
            commentData = await contentData.comments.map((c) => {
                if (c.commentID == flaggedData.commentID) {
                    return {
                        ...c,
                        isContentVisible: true,
                    };
                } else {
                    return c;
                }
            });

            await firestoreService.firebaseWrite(
                `posts/${flaggedData.contentID}`,
                { comments: commentData },
                next
            );

            // await firestoreService.firebaseDelete(`flags/${flaggedData.docId}`);
            return res.status(200).send();
    }
};

exports.denyContentVisibility = async (req, res, next) => {
    const flaggedData = res.locals.currentData;
    const flaggedDataType = flaggedData.contentType;

    // Has 4 kinds of data it can receive
    switch (flaggedDataType) {
        case "thread":
            // await firestoreService.firebaseDelete(`flags/${flaggedData.docId}`);
            return res.status(200).send();

        case "post":
            // await firestoreService.firebaseDelete(`flags/${flaggedData.docId}`);
            return res.status(200).send();

        case "threadComment":
            // await firestoreService.firebaseDelete(`flags/${flaggedData.docId}`);
            return res.status(200).send();

        case "postComment":
            // await firestoreService.firebaseDelete(`flags/${flaggedData.docId}`);
            return res.status(200).send();
    }
    return res.status(403).send();
};
