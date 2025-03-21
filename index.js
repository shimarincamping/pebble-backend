/*===================================================================================*/

// Import Express
const express = require("express");
const app = express();

// Misc. imports and mounts
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const authRoutes = require("./src/routes/authRoutes");
const { errorHandler } = require("./src/middlewares/errorMiddleware");
const upload = multer({ storage: multer.memoryStorage() });

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(
    cors({
        origin: [
            process.env.FRONTEND_DOMAIN || "http://localhost:3000", // ReactJS frontend
            "http://10.0.2.2:4001", // Android emulator accessing ReactJS frontend
            "http://10.0.2.2:8081", // Android emulator accessing React Native
        ],
        credentials: true,
    })
);

/*===================================================================================*/

// Import routers
const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const codingChallengeRoutes = require("./src/routes/codingChallengeRoutes");
const goalRoutes = require("./src/routes/goalRoutes");
const rewardRoutes = require("./src/routes/rewardRoutes");
const leaderboardRoutes = require("./src/routes/leaderboardRoutes");
const forumRoutes = require("./src/routes/forumRoutes");
const roadmapRoutes = require("./src/routes/roadmapRoutes");
const flagRoutes = require("./src/routes/flagRoutes");
const linkedInRoutes = require("./src/routes/linkedInRoutes");
const sentimentAnalysisRoutes = require("./src/routes/sentimentAnalysisRoutes");
const cvGeneratorMiddleware = require("./src/routes/cvRoutes");
const { verifyJwtToken } = require("./src/services/jwtService");

// Mount routers
app.use("/auth", authRoutes);

app.use(verifyJwtToken);

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/coding-challenges", codingChallengeRoutes);
app.use("/goals", goalRoutes);
app.use("/rewards", rewardRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/forum", forumRoutes);
app.use("/roadmap", roadmapRoutes);
app.use("/flags", flagRoutes);
app.use("/auth/linkedin", linkedInRoutes);
app.use("/flag", sentimentAnalysisRoutes);
app.use("/cv", cvGeneratorMiddleware);

/*===================================================================================*/

// Global error handling
app.use(errorHandler);

/*===================================================================================*/

// Starting server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

/*===================================================================================*/

//const pushDataToFirestore = require("./src/controllers/firestoreController.js");
