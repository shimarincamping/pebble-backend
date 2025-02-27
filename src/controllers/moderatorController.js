const firestoreService = require("../services/firestoreService");
const { getTimeDurationString } = require("../utils/dateTimeUtils");

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
