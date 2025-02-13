const { db } = require("../config/firebaseConfig");
const { doc, collection, getDoc, getDocs, query, setDoc, deleteDoc } = require("firebase/firestore");

// Write to a document on Firestore  (CREATE / UPDATE)
exports.firebaseWrite = async (path, data) => {
    return await setDoc(
        doc(db, ...path.split("/")),
        data,
        { merge: true }
    );
}

// Read a single document on Firestore  (READ)
exports.firebaseRead = async (path) => {
    const firebaseRes = await getDoc(
        doc(db, ...path.split("/"))
    );

    return firebaseRes.data();
}


// Read an entire collection of documents on Firestore  (READ)
exports.firebaseReadAll = async (path) => {
    const firebaseRes = await getDocs(
        collection(db, ...path.split("/"))
    );

    const results = [];
    firebaseRes.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
    
    return results;
}

// Return only documents matching query  (READ)
    // Caller needs to pass queryParams as array (e.g.: [where("price", "<=", 30000), ...])
    // * THIS FUNCTION HAS NOT BEEN TESTED *
exports.firebaseReadIf = async (path, queryParams) => {
    const firebaseRes = await getDocs(query(
        collection(db, ...path.split("/")),
        ...queryParams
    ));

    const results = [];
    firebaseRes.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
  
    return results;
}



// Delete a document on Firestore  (DELETE)
exports.firebaseDelete = async (path) => {
    return await deleteDoc(
        doc(db, ...path.split("/"))
    );
}