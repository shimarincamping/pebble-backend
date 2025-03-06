const express = require("express");
const firestoreService = require("../services/firestoreService");
const {
    loginUser,
    registerUser,
    logoutUser,
} = require("../services/firebaseAuthService");
const { verifyJwtToken } = require("../services/jwtService");

const authRouter = express.Router();

// Test Route: Check if server is running
authRouter.get("/login", (req, res) => {
    res.json({ message: "Login route is working! Use POST method to log in." });
});

// Register Route
authRouter.post("/register", async (req, res, next) => {
    const { email, password, fullName } = req.body;
    try {
        const result = await registerUser(email, password);
        if (result) {
            const newUser = {
                docId: result.uid,
                email: req.body.email,
                fullName: req.body.fullName,
                userType: "student", // assume student for now
                about: "",
                courseName: "",
                currentYear: -1,
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
                profilePicture: "",
                ticketCount: 0,
            };

            await firestoreService.firebaseCreateUser(
                newUser,
                next,
                result.uid
            );
        }

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
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

module.exports = authRouter;
