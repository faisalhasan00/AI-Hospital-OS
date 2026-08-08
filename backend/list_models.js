import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    // Actually, getting the list of models might not be straightforward depending on the SDK version.
    // Let's just try to call gemini-1.5-flash. Wait, if it failed, maybe the API key doesn't have access?
    // The error says "models/gemini-1.5-flash is not found for API version v1beta".
    // Is it possible the API key provided is wrong?
    // Let's do a raw fetch to Google API to list models.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => console.log(m.name));
  } catch(e) {
    console.error(e);
  }
}
run();
