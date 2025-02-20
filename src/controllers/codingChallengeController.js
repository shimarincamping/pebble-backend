const firestoreService = require('../services/firestoreService');
const documentExistsMiddleware = require('../middlewares/documentExistsMiddleware');

const { documentObjectArrayReduce, sortObjectsByNonNumericFieldValues, CODING_CHALLENGE_DIFFICULTY_ORDER } = require('../utils/dataManipulationUtils');


exports.assertCodingChallengeExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`codingChallenges/${req.codingChallengeID}`, res, next);
}

exports.getAllCodingChallengeData = (req, res, next) => {

    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)

    firestoreService.firebaseReadAll(`codingChallenges`, next)
        .then((codingChallengesData) => {
            return res.status(200).send(
                documentObjectArrayReduce(sortObjectsByNonNumericFieldValues(
                    codingChallengesData.map(c => {
                        c.lastAnsweredQuestion = c.lastAnsweredQuestion[currentUserID] || -1;
                        c.isQuizCompleted = (c.lastAnsweredQuestion >= c.quizQuestions.length);

                        const { quizQuestions, ...dataWithoutQuestions } = c;

                        return dataWithoutQuestions;
                    }),
                CODING_CHALLENGE_DIFFICULTY_ORDER, "quizDifficulty"))
            );
        });
}

exports.getCodingChallengeData = (req, res, next) => {
    return res.status(200).send(res.locals.currentData.quizQuestions);
} // Data is already set by assertExists and saved into res.locals.currentData (avoids recalling Firebase)

exports.updateUserChallengeProgress = (req, res, next) => {

    const currentUserID = req.currentUserID || "3oMAV7h8tmHVMR8Vpv9B"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)

    if (req.body?.newProgressValue) {
        firestoreService.firebaseWrite(
            `codingChallenges/${req.codingChallengeID}`,
            { "lastAnsweredQuestion" : { [`${currentUserID}`] : req.body.newProgressValue } },
            next
        ).then((resp) => {
            return res.status(200).send(`Successfully updated progress for ${currentUserID} on challenge ${req.codingChallengeID} to ${req.body.newProgressValue}`);
        })
    } else {
        return res.status(400).send(`Missing expected value in request body: newProgressValue`);
    }
}