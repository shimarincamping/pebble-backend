const express = require("express");
const firestoreService = require("../services/firestoreService");
const { loginUser, registerUser, logoutUser } = require("../services/firebaseAuthService");
const { verifyJwtToken } = require("../services/jwtService");
const { checkPermission } = require("../middlewares/verifyRoleMiddleware");
const { throwError } = require("../middlewares/errorMiddleware");

const authRouter = express.Router();

// Test Route: Check if server is running
authRouter.get("/login", (req, res) => {
    res.json({ message: "Login route is working! Use POST method to log in." });
});

// Register Route
authRouter.post("/register", async (req, res, next) => {
    const { email, password, fullName } = req.body;
    const result = await registerUser(email, password);
    if (!result.error) {
        const newUser = {
            docId: result.uid,
            email: req.body.email,
            fullName: req.body.fullName,
            userType: "student", // assume student for now
            about: "",
            courseName: "PEBBLE user",
            currentYear: 1,
            discordUsername: "",
            followers: [],
            following: [],
            latestCV: null,
            linkedInAccessToken: null,
            linkedInID: null,
            notifications: [],
            phoneNumber: "",
            pointCount: 0,
            profileDetails: {
                coursesAndCertifications: [],
                skills: [],
                workExperience: [],
            },
            profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            ticketCount: 0,
        };

        await firestoreService.firebaseCreateUser(
            newUser,
            next,
            result.uid
        );

        return res.status(201).json(result);
    }

    return throwError(400, `User registration failed`, next);
});

// Login Route (Returns Firebase & JWT Tokens)
authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await loginUser(email, password);

        res.status(200).send(result);
    } catch (error) {
        res.status(401).json({ error: "Invalid email or password" }); // 🔴 Ensure only valid users log in
    }
});

// Protected Route Example (Using JWT)
authRouter.get("/protected", verifyJwtToken, (req, res) => {
    res.json({ message: "You have access!", user: req.user });
});

authRouter.post("/userType", async (req, res, next) => {
    const { uid } = req.body;
    const { userType } = await firestoreService.firebaseRead(
        `users/${uid}`,
        next
    );
    res.status(200).send({ userType });
});

authRouter.get("/test", verifyJwtToken, checkPermission("FEED"), (req, res) => {
    res.status(200).send();
});

// Verify Token Route
authRouter.post("/verify", verifyJwtToken, (req, res) => {
    res.json({ user: req.user });
});

// Logout Route
authRouter.post("/logout", async (req, res) => {
    try {
        await logoutUser();
        res.json({ success: true, message: "User logged out successfully." });
    } catch (error) {
        res.status(500).json({ error: "Logout failed." });
    }
});

// authRouter.post("/hash", async (req, res) => {
//     const { password } = req.body;
//     const hash = hashPassword(password);
//     res.status(200).send();
// });

// authRouter.post("/verifyHash", async (req, res) => {
//     const { password } = req.body;
//     verifyPassword(
//         "$2b$10$3TSfPajJnzGIfVynJgvp8OM5dqPaFKLZ0ss/w8uZNTbCRLDoVUh66",
//         password
//     );
//     res.status(200).send();
// });

module.exports = authRouter;
