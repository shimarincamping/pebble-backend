const express = require('express');
const { tryCatch, throwError } = require('../middlewares/errorMiddleware');


// The following test functions illustrate how controllers should behave

// Will always fail. The use of tryCatch() will allow it to send an error code back to the client 
    // through the use of functions imported from /middlewares/errorMiddleware'
exports.testFuncFail = (req, res, next) => {
    tryCatch(() => {
        throw new Error();
    }, 403, 'You have successfully crashed the program by using GET users', next);
}


// Will never fail
exports.testFuncNoFail = (req, res, next) => {
    if (false) {
        throwError(403, "Forbidden", next)
    }

    res.status(200).send("Ok! Nothing failed!");
}


// Other functions used by the userRoutes
exports.getUsersBasePath = (req, res, next) => {
    console.log("The program has started executing the GET request for /users/");
    next();
}

exports.getNameById = (req, res, next) => {
    res.status(200).send(`User ID ${req.userID} corresponds to ${req.userName}.`);
}