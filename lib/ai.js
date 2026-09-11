import { generateWithGroq } from "./groq";
import { generateWithGemini } from "./gemini";

export async function generateContent(prompt) {
  try {
    console.log("Using Gemini...");
    return await generateWithGemini(prompt);
  } catch (error) {
    console.warn("Gemini failed, switching to Groq...", error);
    return await generateWithGroq(prompt);
  }
}