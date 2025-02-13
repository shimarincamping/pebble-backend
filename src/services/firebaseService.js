import { db, storage, auth } from "../config/firebaseConfig";

const { doc, getDoc, setDoc, deleteDoc, collection, addDoc, updateDoc, query, where, getDocs } = require("firebase/firestore");
const { ref, uploadBytes, getDownloadURL, deleteObject } = require("firebase/storage");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } = require("firebase/auth");
const { tryCatch, throwError } = require("../middlewares/errorMiddleware");
const { app } = require("../config/firebaseConfig"); // Import Firebase app instance


/** ==========================
 *    Firestore Functions
 =========================== */

// Get a document from Firestore
const firebaseGet = tryCatch(async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throwError("Document not found", 404);
  return docSnap.data();
});

// Add a new document to Firestore
const firebasePush = tryCatch(async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return { id: docRef.id, ...data };
});

// Update an existing document in Firestore
const firebaseUpdate = tryCatch(async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
  return { id: docId, ...data };
});

// Delete a document from Firestore
const firebaseDelete = tryCatch(async (collectionName, docId) => {
  await deleteDoc(doc(db, collectionName, docId));
  return { success: true, id: docId };
});

// Query Firestore with conditions
const firebaseQuery = tryCatch(async (collectionName, field, condition, value) => {
  const q = query(collection(db, collectionName), where(field, condition, value));
  const querySnapshot = await getDocs(q);

  const results = [];
  querySnapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  return results;
});

/** ==========================
 *    Firebase Storage Functions
 =========================== */

// Upload a file to Firebase Storage
const uploadFile = tryCatch(async (filePath, fileBuffer, mimeType) => {
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, fileBuffer, { contentType: mimeType });
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
});

// Get a file's download URL from Firebase Storage
const getFileURL = tryCatch(async (filePath) => {
  const storageRef = ref(storage, filePath);
  return await getDownloadURL(storageRef);
});

// Delete a file from Firebase Storage
const deleteFile = tryCatch(async (filePath) => {
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
  return { success: true, path: filePath };
});

/** ==========================
 *    Firebase Authentication Functions
 =========================== */

// Create a new user in Firebase Authentication
const createUser = tryCatch(async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
});

// Login a user in Firebase Authentication
const loginUser = tryCatch(async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
});

// Logout a user from Firebase Authentication
const logoutUser = tryCatch(async () => {
  await signOut(auth);
  return { success: true, message: "User signed out successfully" };
});

// Delete a user from Firebase Authentication
const deleteUserAccount = tryCatch(async (user) => {
  await deleteUser(user);
  return { success: true, message: "User account deleted successfully" };
});

module.exports = {
  firebaseGet,
  firebasePush,
  firebaseUpdate,
  firebaseDelete,
  firebaseQuery,
  uploadFile,
  getFileURL,
  deleteFile,
  createUser,
  loginUser,
  logoutUser,
  deleteUserAccount
};
