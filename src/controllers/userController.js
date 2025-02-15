const firestoreService = require('../services/firestoreService');
const documentExistsMiddleware = require('../middlewares/documentExistsMiddleware');

// User existance checking
exports.assertUserExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`users/${req.userID}`, res, next);
}

exports.assertUserEmailNotRegistered = (req, res, next) => {
    documentExistsMiddleware.assertUniquePropertyNotExists(`users`, "email", req.body.email, next);
}


// CRUD operations
exports.getAllUserData = (req, res, next) => {
    firestoreService.firebaseReadAll(`users`, next)
        .then((usersData) => {
            return res.status(200).send(usersData);
        });
}

exports.getUserData = (req, res, next) => {         
    return res.status(200).send(res.locals.currentData);            
} // Data is set by assertExists and saved into res.locals.currentData (avoids recalling Firebase)


exports.deleteUser = (req, res, next) => {
    firestoreService.firebaseDelete(`users/${req.userID}`, next)
        .then(() => {
            return res.status(204).send();
        });
}

exports.registerNewUser = (req, res, next) => {         // TODO: Integrate this to use Firebase Auth UID as key
    firestoreService.firebaseCreate(`users`, req.body, next)
        .then((resp) => {
            return res.status(201).send(`The user ID ${resp.id} was successfully registered at email ${req.body.email}.
                Firebase sent the following response: ${JSON.stringify(resp)}`);
        });
}