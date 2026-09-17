import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateWithGroq(prompt) {
  const response = await groq.chat.completions.create({
    model: "qwen/qwen3.8-27b",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
  });
  return response.choices[0]?.message?.content || "";
}

export async function analyzeImageWithGroq(base64Image, mimeType) {
  const response = await groq.chat.completions.create({
    model: "qwen/qwen3.8-27b",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
          {
            type: "text",
            text: "Extract all text from this image. This is an assignment question. Return the complete text exactly as written.",
          },
        ],
      },
    ],
    max_tokens: 1024,
  });
  return response.choices[0]?.message?.content || "";
}