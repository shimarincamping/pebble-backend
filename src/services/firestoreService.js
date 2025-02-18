const { db } = require("../config/firebaseConfig");
const { doc, collection, getDoc, getDocs, query, addDoc, setDoc, updateDoc, deleteDoc } = require("firebase/firestore");
const { throwError } = require('../middlewares/errorMiddleware');

// Create a new document in a collection with auto-generated ID   (CREATE with non-sequential auto-ID)
exports.firebaseCreate = async (path, data, next) => {
    try {
        const newDocRef = await addDoc(
            collection(db, ...path.split("/")),
            data
        );

        await updateDoc(newDocRef, {
            docId : newDocRef.id
        });

        return newDocRef;
    } catch (err) {
        return throwError(500, err, next);
    }
}


// Write to a document on Firestore  (CREATE with explicit ID / UPDATE)
exports.firebaseWrite = async (path, data, next) => {
    try {
        return await setDoc(
            doc(db, ...path.split("/")),
            data,
            { merge: true }
        );
    } catch (err) {
        return throwError(500, err, next);
    }
}

// Read a single document on Firestore  (READ one)
exports.firebaseRead = async (path, next) => {
    try {
        const resp = await getDoc(
            doc(db, ...path.split("/"))
        );
        return resp.data();
    } catch (err) {
        return throwError(500, err, next);
    }
}


// Read an entire collection of documents on Firestore  (READ all)
exports.firebaseReadAll = async (path, next) => {
    try {
        const resp = await getDocs(
            collection(db, ...path.split("/"))
        );
        return resp.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
    } catch (err) {
        return throwError(500, err, next);
    }
}

// Return only documents matching query  (READ if meeting conditions)
    // Caller needs to pass queryParams as array (e.g.: [where("price", "<=", 30000), ...])
exports.firebaseReadQuery = async (path, queryParams, next) => {
    try {
        const resp = await getDocs(query(
            collection(db, ...path.split("/")),
            ...queryParams
        ));
        return resp.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
    } catch (err) {
        return throwError(500, err, next);
    }
}

// Delete a document on Firestore  (DELETE)
exports.firebaseDelete = async (path, next) => {
    try {
        return await deleteDoc(
            doc(db, ...path.split("/"))
        );
    } catch (err) {
        return throwError(500, err, next);
    }
}