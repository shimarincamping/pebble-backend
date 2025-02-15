const express = require('express');
const firestoreService = require('../services/firestoreService');
const documentExistsMiddleware = require('../middlewares/documentExistsMiddleware');
const { throwError } = require('../middlewares/errorMiddleware');


// User existance checking
exports.assertUserExists = (req, res, next) => {
    documentExistsMiddleware.assertExists(`users/${req.userID}`, res, next);
}

exports.assertUserEmailNotRegistered = (req, res, next) => {
    documentExistsMiddleware.assertUniquePropertyNotExists(`users`, "email", req.body.email, next);
}


// CRUD operations
exports.getAllUserData = (req, res, next) => {
    firestoreService.firebaseReadAll(`users`)
        .then((usersData) => {
            res.status(200).send(JSON.stringify(usersData));
        }).catch((err) => {
            throwError(500, err, next);
        });
}

exports.getUserData = (req, res, next) => {         
    return res.status(200).send(`The user ID ${req.userID} has the following data:

        ${JSON.stringify(res.locals.currentData)}`);
        // Data is retrieved from res.locals.currentData, which is set in documentExistsMiddleware upon checking.
            // This avoids calling Firebase twice.
}


exports.deleteUser = (req, res, next) => {
    firestoreService.firebaseDelete(`users/${req.userID}`)
        .then((resp) => {
            res.status(204).send(`The user ID ${req.userID} was successfully deleted.
                Firebase sent the following response: ${resp}`);
        }).catch((err) => {
            throwError(500, err, next);
        });
}

exports.registerNewUser = (req, res, next) => {         // TODO: Integrate this to use Firebase Auth UID as key
    firestoreService.firebaseCreate(`users`, req.body)
        .then((resp) => {
            res.status(201).send(`The user ID ${resp.id} was successfully registered at email ${req.body.email}.
                Firebase sent the following response: ${JSON.stringify(resp)}`)
        }).catch((err) => {
            throwError(500, err, next);
        });   
}