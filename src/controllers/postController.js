const firestoreService = require('../services/firestoreService');
const documentExistsMiddleware = require('../middlewares/documentExistsMiddleware');

const { where, orderBy, limit } = require("firebase/firestore");
const {  } = require('../utils/dataManipulationUtils');
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
        liked : authorUserData.docId in postData.likes
    }
} 

exports.getPostsData = async (req, res, next) => {

    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to 3)
    
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