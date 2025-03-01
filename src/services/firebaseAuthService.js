const { auth } = require("../config/firebaseConfig");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require("firebase/auth");
const { generateJwtToken } = require("../services/jwtService");

// Register a new user
const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { uid: userCredential.user.uid, email: userCredential.user.email };
  } catch (error) {
    return { error: error.message };
  }
};

// Login a user (Generates JWT token)
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseToken = await userCredential.user.getIdToken(); // Get Firebase Auth token
    const jwtToken = generateJwtToken(userCredential.user); // Generate JWT

    return { uid: userCredential.user.uid, email: userCredential.user.email, firebaseToken, jwtToken };
  } catch (error) {
    return { error: error.message };
  }
};

// Logout a user
const logoutUser = async () => {
  const auth = getAuth();
  await signOut(auth);
};

module.exports = { registerUser, loginUser, logoutUser };
