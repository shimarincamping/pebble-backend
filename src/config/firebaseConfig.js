const { initializeApp } = require("firebase/app");
const { getFirestore } = require( "firebase/firestore");
const { getStorage } = require("firebase/storage");
const { getAuth } = require("firebase/auth");

require("dotenv").config(); // Ensure dotenv is loaded

// console.log("API Key from .env:", process.env.API_KEY); // Debugging line

// Firebase Config (uses environment variables)
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);


// Export for use in other files
module.exports = { 
  app, db, storage, auth
};