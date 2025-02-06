// Manually throw and send an error with a custom status and message 
exports.throwError = (status, message, next) => {
    const newError = new Error(message);
    newError.status = status;

    return next(newError);
}

// Functions can be wrapped in a tryCatch() to automatically throw Errors that will be caught globally
exports.tryCatch = (func, status, message, next) => {
    try {
        func();
    } catch (e) {
        this.throwError(status, message, next);
    }
}

// Global error handler - sends error message back to client
exports.errorHandler = (err, req, res, next) => {
    console.error(err);
    return res.status(err.status || 500).send(err.message || "An unknown error has occurred.");
}