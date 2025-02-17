// Reduces outputs of firebaseReadAll and firebaseReadIf into a format
    // where docId is the object key, and the other fields as the values.
exports.objectReducer = (arr) => {
    return arr.reduce((acc, { docId, ...rest }) => {
        acc[docId] = rest;
        return acc;
    }, {});
}