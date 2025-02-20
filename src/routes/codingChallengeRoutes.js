const express = require('express');
const codingChallengeRouter = express.Router();

const codingChallengeController = require('../controllers/codingChallengeController');

// Pre-processes all routes that contain an ID parameter
codingChallengeRouter.param('id', (req, res, next, id) => {
    req.codingChallengeID = id;
    next();
})

// ID must exist to perform operations that involve an ID parameter
codingChallengeRouter.use('/:id', codingChallengeController.assertCodingChallengeExists);


// Route definitions
codingChallengeRouter.get('/', codingChallengeController.getAllCodingChallengeData);
codingChallengeRouter.get('/:id', codingChallengeController.getCodingChallengeData);
codingChallengeRouter.post('/:id/user-progress', codingChallengeController.updateUserChallengeProgress);


module.exports = codingChallengeRouter;