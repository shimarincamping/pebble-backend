const { auth } = require("../config/firebaseConfig");
const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    getAuth
} = require("firebase/auth");
const { generateJwtToken } = require("../services/jwtService");
const { throwError } = require("../middlewares/errorMiddleware");

// Register a new user
const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
        };
    } catch (error) {
        return { error: error.message };
    }
};

// Login a user (Generates JWT token)
const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
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
        throw new Error("Invalid email or password"); // Ensure invalid logins return an error
    }
};

// Logout a user
const logoutUser = async () => {
    const auth = getAuth();
    await signOut(auth);
};

// const bcrypt = require("bcrypt");

// const hashPassword = (password) => {
//     const saltRounds = 10;

//     bcrypt.genSalt(saltRounds, (err, salt) => {
//         if (err) {
//             throw new Error("Salt failed");
//         }

//         const userPassword = password;
//         bcrypt.hash(userPassword, salt, (err, hash) => {
//             if (err) {
//                 throw new Error("Bcrypt hashing of password failed.");
//             }
//             console.log(hash);
//             return hash;
//         });
//     });
// };

// const verifyPassword = (storedHashedPassword, userInputPassword) => {
//     bcrypt.compare(userInputPassword, storedHashedPassword, (err, result) => {
//         if (err) {
//             throw new Error("Bcrypt verifying of password failed.");
//         }

//         if (result) {
//             console.log("passwords match! authenticated.");
//         } else {
//             console.log("passwords do not match.");
//         }
//     });
// };

module.exports = { registerUser, loginUser, logoutUser };
