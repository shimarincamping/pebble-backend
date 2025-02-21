const firestoreService = require('../services/firestoreService');
const documentExistsMiddleware = require('../middlewares/documentExistsMiddleware');

const { where, orderBy, limit } = require("firebase/firestore");
const { generateNotification } = require('../middlewares/notificationsMiddleware');
const { updateGoalProgress } = require('../middlewares/goalsRewardsMiddleware');
const { capitalizeFirstLetter } = require('../utils/stringManipulationUtils'); 
const { getTimeDurationString } = require('../utils/dateTimeUtils');



exports.assertPostExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`posts/${req.postID}`, res, next);
}

exports.formatPostData = (postData, authorUserData) => {

    if (!postData.isContentVisible) {
        return null;
    }  // Reject request for post that is invisible

    return {
        id : postData.docId,
        fullName : authorUserData.fullName,
        profilePicture : authorUserData.profilePicture,
        courseName : authorUserData?.courseName         // Not all users have a course name defined
                        || ((authorUserData.userType !== "other") 
                            ? (capitalizeFirstLetter(authorUserData.userType))      // Display "Lecturer", "Moderator", etc.
                            : ("External PEBBLE User")),
        time : getTimeDurationString(new Date(), new Date(postData.postCreatedAt)),
        // TODO: Add LinkedIn URL here
        postPicture : postData?.postPicture || null,
        title : postData.title,
        date : (new Date(postData.postCreatedAt).toLocaleString("default", { year: "numeric", month: "long", day: "numeric" })).toUpperCase(),
        postDec : postData.postDesc,
        liked : postData.likes.includes(authorUserData.docId)
    }
} 

exports.getPostsData = async (req, res, next) => {

    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)
    
    // Get all posts with reference to query params
    const postsData = (await firestoreService.firebaseReadQuery(
        `posts`,
        [
            (req.query.authorID) ? where("authorId", "==", req.query.authorID) : where("authorId", "!=", currentUserID),  // If authorID is not specified, assume FEED and do not return own posts
            // TODO: Add more queryParams here to integrate the pagination
            orderBy("postCreatedAt", "desc"),
            req.query.limit && limit(req.query.limit)
        ].filter(Boolean),
        next
    )).filter(p => p.isContentVisible);  // Avoid fetching data for invisible posts

    // For each post, fetch data about its author and restructure data
    const modifiedPostsData = await Promise.all(postsData.map(async (p) => {
        return this.formatPostData(p, await firestoreService.firebaseRead(`users/${p.authorId}`, next));
    }));

    return res.status(200).send(modifiedPostsData);
}


exports.getSinglePostData = async (req, res, next) => {
    return res.status(200).send(this.formatPostData(
        res.locals.currentData, 
        await firestoreService.firebaseRead(`users/${res.locals.currentData.authorId}`, next)
    ));
}

exports.togglePostLike = async (req, res, next) => {
    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)
    const currentPostLikes = res.locals.currentData.likes;

    if (res.locals.currentData.authorId !== currentUserID) {    // User cannot like their own post
        await firestoreService.firebaseWrite(
            `posts/${req.postID}`,
            { likes : ((currentPostLikes.includes(currentUserID))
                ? currentPostLikes.filter(user => user !== currentUserID)
                : [...currentPostLikes, currentUserID]
            ) },
            next
        );

        // Generate a notification to the relevant user
        generateNotification(res.locals.currentData.authorId, currentUserID, "liked your post", next);

        // Increment goal relating to liking posts  (does not track if posts are unique)
        if (!currentPostLikes.includes(currentUserID)) {
            updateGoalProgress("47xTsBcAVacMqhbQtPJI", currentUserID, next);
        }

        return res.status(200).send();
    }

    return res.status(403).send();
}


exports.getPostComments = async (req, res, next) => {

    const currentPostComments = res.locals.currentData.comments
        .filter(c => c.isContentVisible)
        .map(async c => {
            const { fullName, profilePicture } = await firestoreService.firebaseRead(`users/${c.authorID}`, next);

            return {
                id : c.commentID,
                authorID : c.authorID,
                author : fullName,
                profilePic : profilePicture,
                text : c.text,
                time : getTimeDurationString(new Date(), new Date(c.time))
            }
        }
    )

    const resolvedPostComments = await Promise.all(currentPostComments)
    res.status(200).send(resolvedPostComments);

}


exports.addNewComment = async (req, res, next) => {

    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)
    
    if (req.body.text) {
        const currentPostComments = res.locals.currentData.comments;
        const newComment = {
            authorID : currentUserID,
            commentID : `${req.postID}/${currentPostComments.length + 1}`,
            isContentVisible : true,
            text : req.body.text,
            time : new Date().toISOString()
        }

        currentPostComments.push(newComment);
        await firestoreService.firebaseWrite(
            `posts/${req.postID}`,
            { comments : currentPostComments },
            next
        );

        // Generate a notification to the relevant user (unless it is their own post)
        if (res.locals.currentData.authorId !== currentUserID) {
            generateNotification(res.locals.currentData.authorId, currentUserID, "commented on your post", next);
        }

        // Increment goals relating to commenting on posts
        updateGoalProgress("6KEhhVyLIslQIIAQ7922", currentUserID, next);
        updateGoalProgress("WrPLjOKRriIsHZXIgB85", currentUserID, next);

        return res.status(200).send();
    }

    return res.status(400).send(`Missing expected value in request body: text (comment body may be empty)`)

}