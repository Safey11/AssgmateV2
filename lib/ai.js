import { generateWithGroq } from "./groq";
import { generateWithGemini } from "./gemini";

export async function generateContent(prompt) {
  try {
    console.log("Using Groq...");
    return await generateWithGroq(prompt);
  } catch (error) {
    console.warn("Groq failed, switching to Gemini...", error);
    return await generateWithGemini(prompt);
  }
}