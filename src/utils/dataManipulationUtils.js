// Reduces outputs of firebaseReadAll and firebaseReadIf into a format
    // where docId is the object key, and the other fields as the values.
exports.documentObjectArrayReduce = (arr) => {
    return arr.reduce((acc, { docId, ...rest }) => {
        acc[docId] = rest;
        return acc;
    }, {});
}

// Reduces a given array of objects
    // to a new object with a specific field's unique values as the keys
exports.groupObjectsByFieldValues = (arr, field) => {
    return arr.reduce((acc, { docId, ...rest }) => {
        const key = rest[field];
        acc[key] = acc[key] || [];
        acc[key].push(rest);

        delete rest[field];
        return acc;
    }, {});
}


// Sorts an array of objects by a specific field that contains numeric data
exports.sortObjectsByNumericFieldValues = (arr, field) => {
    return arr.sort((a, b) => {
        return a[field] - b[field];
    });
}

// Sorts an array of objects by a specific field that contains non-numeric data
    // Provide the key object as a mapping between the actual data and a numeric value
exports.sortObjectsByNonNumericFieldValues = (arr, sortKey, field) => {
    return arr.sort((a, b) => {
        return sortKey[a[field]] - sortKey[b[field]];
    });
}

    // ------- Define sortKey objects here: -------
    exports.CODING_CHALLENGE_DIFFICULTY_ORDER = {
        "Easy" : 1,
        "Medium" : 2,
        "Hard" : 3
    }
    // --------------------------------------------

// Randomize array in-place using Durstenfeld shuffle algorithm 
    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

exports.shuffleArray = (array) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
