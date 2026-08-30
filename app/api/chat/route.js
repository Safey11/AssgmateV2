import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateContent } from "@/lib/ai";

const FREE_LIMIT = 5;

const wordCountMap = {
  short: "300-500 words",
  medium: "500-800 words",
  long: "800-1200 words",
  detailed: "1200+ words",
};

export async function POST(req) {
  try {
    const session = await auth();
    const { messages, format, subject, language, citationStyle, wordCount } = await req.json();

    await connectDB();

    // Check limits
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      const totalAllowed = FREE_LIMIT + (user?.bonusGenerations || 0);
      if (user && user.plan === "free" && user.generationsUsed >= totalAllowed) {
        return Response.json({ error: "Free plan limit reached. Upgrade to Pro!" }, { status: 403 });
      }
    }

    // Detect if this is a refinement request
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    const isRefinement = [
      "make it longer", "make it shorter", "add examples", "simplify",
      "add diagrams", "add references", "refine", "improve", "change",
      "extend", "shorten", "rewrite", "fix", "update"
    ].some((keyword) => lastMessage.includes(keyword));

    // Build conversation history
    const conversationHistory = messages.slice(0, -1)
      .map((m) => `${m.role === "user" ? "Student" : "AssignMate"}: ${m.content}`)
      .join("\n\n");

    const currentMessage = messages[messages.length - 1].content;

    const systemPrompt = `You are AssignMate, a smart academic assistant for Pakistani university students.

CRITICAL RULES:
- Be CONCISE and FOCUSED. Do NOT add unnecessary preamble or filler text
- Do NOT say "I'll help you" or "Here's your assignment" — just write the content directly
- Do NOT add meta-commentary like "Let me know if you want changes"
- Write EXACTLY ${wordCountMap[wordCount] || "500-800 words"} — not more
- ${language === "urdu" ? "Write ENTIRELY in Urdu script" : "Write in clear English"}
- Use # for headings, ## for subheadings
- For diagrams use Mermaid syntax in \`\`\`mermaid blocks
- For code always add brief comments
${citationStyle && citationStyle !== "none" ? `- End with ## References section (${citationStyle} format, 3 citations minimum)` : "- Do NOT add references unless asked"}

${isRefinement ? "This is a REFINEMENT request — modify the previous response accordingly. Be precise, do only what was asked." : "This is a NEW assignment request — write it directly and professionally."}

FORMAT OUTPUT CLEANLY:
- Start directly with the content or first heading
- No introductory sentences
- No closing sentences asking for feedback`;

    const fullPrompt = `${systemPrompt}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}Student: ${currentMessage}

AssignMate:`;

    const content = await generateContent(fullPrompt);

    // Clean up any think tags or preamble the AI adds
    const cleanContent = content
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/\[Proceeds\]/g, "")
      .replace(/^(Hello!|Hi!|Sure!|Of course!|I'll help|I can help|Here's|Here is|Let me|I'll write|I'll create|Great!|Certainly!)[^\n]*/gm, "")
      .replace(/^(Let me know|Feel free|Hope this|If you need|I hope)[^\n]*/gm, "")
      .trim();

    // Update generation count
    if (session?.user?.email) {
      await User.findOneAndUpdate(
        { email: session.user.email },
        { $inc: { generationsUsed: 1 } }
      );
    }

    return Response.json({ content: cleanContent });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json({ error: "Failed to generate response" }, { status: 500 });
  }
}