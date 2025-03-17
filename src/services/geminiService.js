const { GoogleGenerativeAI } = require("@google/generative-ai");

// const API_Key = process.env.PUBLIC_geminiAPIKey;
const API_Key = process.env.geminiAPIKey;
console.log(`API_Key: ${API_Key}`);

const gemini = new GoogleGenerativeAI(API_Key);
const gemini15Flash = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
const gemini20flash = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

module.exports = { gemini15Flash, gemini20flash };
