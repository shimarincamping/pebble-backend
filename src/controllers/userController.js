const express = require('express');
const { throwError } = require('../middlewares/errorMiddleware');
const { firebaseWrite, firebaseRead, firebaseReadAll, firebaseDelete } = require('../services/firestoreService');


exports.getAllUserData = (req, res, next) => {
    firebaseReadAll(`users`)
        .then((usersData) => {
            res.status(200).send(JSON.stringify(usersData));
        }).catch((err) => {
            throwError(500, err, next);
        })
}

// User can only be fetched if exists
    // !! Consider refactoring this into a middleware !!
exports.assertUserExists = (req, res, next) => {
    firebaseRead(`users/${req.userID}`)
        .then((userData) => {
            if (userData) {
                res.local.userData = userData;
                return next();
            }

            throwError(404, `The user ID ${req.userID} was not found.`, next);
        }).catch((err) => {
            throwError(500, err, next);
        })
}

exports.getUserData = (req, res, next) => {
    return res.status(200).send(`The user ID ${req.userID} has the following data:

        ${JSON.stringify(res.local.userData)}`);
}


exports.deleteUser = (req, res, next) => {
    firebaseDelete(`users/${req.userID}`)
        .then((resp) => {
            res.status(204).send(`The user ID ${req.userID} was successfully deleted.
                Firebase sent the following response: ${resp}`);
        }).catch((err) => {
            throwError(500, err, next);
        });
}

// User that already exists cannot be created again
    // !! Consider refactoring this into a middleware !!
exports.assertUserNotExists = (req, res, next) => {
    firebaseRead(`users/${req.userID}`)
        .then((userData) => {
            if (!userData) {
                return next();
            }

            throwError(403, `The user ID ${req.userID} already exists.`, next);
        }).catch((err) => {
            throwError(500, err, next);
        })
}

exports.registerNewUser = (req, res, next) => {
    firebaseWrite(`users/${req.userID}`, req.body)
        .then((resp) => {
            res.status(201).send(`The user ID ${req.userID} was successfully created.
                Firebase sent the following response: ${resp}`);
        }).catch((err) => {
            throwError(500, err, next);
        });
}