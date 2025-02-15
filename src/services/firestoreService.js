const { db } = require("../config/firebaseConfig");
const { doc, collection, getDoc, getDocs, query, addDoc, setDoc, deleteDoc } = require("firebase/firestore");


// Create a new document in a collection with auto-generated ID   (CREATE with non-sequential auto-ID)
exports.firebaseCreate = async (path, data) => {
    return await addDoc(
        collection(db, ...path.split("/")),
        data
    );
}


// Write to a document on Firestore  (CREATE with explicit ID / UPDATE)
exports.firebaseWrite = async (path, data) => {
    return await setDoc(
        doc(db, ...path.split("/")),
        data,
        { merge: true }
    );
}

// Read a single document on Firestore  (READ one)
exports.firebaseRead = async (path) => {
    const firebaseRes = await getDoc(
        doc(db, ...path.split("/"))
    );

    return firebaseRes.data();
}


// Read an entire collection of documents on Firestore  (READ all)
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

// Return only documents matching query  (READ if meeting conditions)
    // Caller needs to pass queryParams as array (e.g.: [where("price", "<=", 30000), ...])
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