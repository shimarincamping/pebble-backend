const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET; // Keep JWT secret here

// Function to Generate JWT Token (Issued after Firebase login)
const generateJwtToken = (user) => {
    return jwt.sign(
        {
            uid: user.uid,
        },
        jwtSecret,
        { expiresIn: "1h" } // Token expires in 1 hour
    );
};

// Middleware to Verify JWT Token for Backend Routes
const verifyJwtToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

    if (!token) {
        return res.status(401).json({ error: "Unauthorized. Token missing." });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        req.user = decoded; // Attach user data to request
        next();
    });
};

module.exports = { generateJwtToken, verifyJwtToken };
