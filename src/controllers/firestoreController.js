const { collection, addDoc } = require("firebase/firestore");
const { db } = require("../config/firebaseConfig.js");
const fs = require("fs");
const path = require("path");

// ✅ Read JSON file correctly
const jsonFilePath = path.resolve(__dirname, "threads.json");

// Check if the file exists
if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ Error: File not found at ${jsonFilePath}`);
    process.exit(1);
}

// Read and parse the JSON file
let data;
try {
    const jsonData = fs.readFileSync(jsonFilePath, "utf8");
    data = JSON.parse(jsonData);
} catch (error) {
    console.error("❌ Error parsing JSON:", error.message);
    process.exit(1);
}

// ✅ Debug: Ensure correct structure
console.log("Parsed JSON structure:", JSON.stringify(data, null, 2));

if (!data.documents || !Array.isArray(data.documents)) {
    console.error("❌ Error: 'documents' key is missing or is not an array.");
    process.exit(1);
}

// ✅ Function to push data to Firestore
async function pushDataToFirestore() {
    try {
        const collectionName = data.collection || "threads"; // Use the collection name from JSON or default
        for (const doc of data.documents) {
            await addDoc(collection(db, collectionName), doc);
            console.log(`✅ Added document: ${doc.roadmapThreadTitle || "Unnamed Document"}`);
        }
        console.log("🎉 All documents added successfully!");
    } catch (error) {
        console.error("🔥 Error adding document:", error);
    }
}

// Run the function
pushDataToFirestore();