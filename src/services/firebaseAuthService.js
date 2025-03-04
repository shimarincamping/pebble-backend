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
      console.log("Attempting login for:", email); // Debugging

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await userCredential.user.getIdToken(); // Get Firebase Auth token
      const jwtToken = generateJwtToken(userCredential.user); // Generate JWT

      console.log("User authenticated:", userCredential.user.email);

      return { 
          uid: userCredential.user.uid, 
          email: userCredential.user.email, 
          firebaseToken, 
          jwtToken 
      };
  } catch (error) {
      console.error("Firebase login error:", error.message);
      throw new Error("Invalid email or password"); // 🔴 Ensure invalid logins return an error
  }
};

// Logout a user
const logoutUser = async () => {
  const auth = getAuth();
  await signOut(auth);
};

module.exports = { registerUser, loginUser, logoutUser };