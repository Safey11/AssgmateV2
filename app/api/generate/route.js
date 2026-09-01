import { NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";
import { generateWord } from "@/lib/fileGenerators/word";
import { generateExcel } from "@/lib/fileGenerators/excel";
import { generatePPTX } from "@/lib/fileGenerators/pptx";
import { generatePDF } from "@/lib/fileGenerators/pdf";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import User from "@/models/User";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { calculateStreak } from "@/lib/streak";

const MIME_TYPES = {
  word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  pdf: "application/pdf",
};

const FREE_LIMIT = 5;
const ANONYMOUS_LIMIT = 1;

const wordCountMap = {
  quick: "150-300 words — short and direct answers only",
  standard: "500-800 words — well structured with examples",
  detailed: "1000-1500 words — comprehensive with diagrams and code",
  research: "2000-2500 words — in-depth research paper style",
};

const subjectContext = {
  general: "",
  cs: "This is a Computer Science/IT assignment. Use technical terminology, include code examples and diagrams where relevant.",
  business: "This is a Business/Management assignment. Use business terminology, include real world examples and frameworks.",
  english: "This is an English/Literature assignment. Focus on language, grammar, literary devices and critical analysis.",
  islamic: "This is an Islamic Studies assignment. Reference Quran, Hadith and Islamic scholars where appropriate.",
  science: "This is a Science assignment. Include scientific facts, experiments and proper scientific terminology.",
};

export async function POST(req) {
  try {
    const session = await auth();
    const { question, format, title, dueDate, wordCount, citationStyle, subject, language, studentDetails } = await req.json();

    if (!question || !format) {
      return NextResponse.json({ error: "Question and format are required" }, { status: 400 });
    }

    await connectDB();
    const cookieStore = await cookies();

    if (!session?.user?.email) {
      const anonUsed = cookieStore.get("anon_generations")?.value || "0";
      if (parseInt(anonUsed) >= ANONYMOUS_LIMIT) {
        return NextResponse.json(
          { error: "Create a free account to generate more assignments and unlock 5 free generations." },
          { status: 403 }
        );
      }
    } else {
      const user = await User.findOne({ email: session.user.email });
      const totalAllowed = FREE_LIMIT + (user?.bonusGenerations || 0);
      if (user && user.plan === "free" && user.generationsUsed >= totalAllowed) {
        return NextResponse.json(
          { error: "Free plan limit reached. Please upgrade to Pro for unlimited generations, or invite friends for bonus generations!" },
          { status: 403 }
        );
      }
    }

    const prompt = `You are an expert academic assistant for Pakistani university students.

Assignment: ${question}

${studentDetails?.name ? `Student: ${studentDetails.name}` : ""}
${studentDetails?.courseName ? `Course: ${studentDetails.courseName}` : ""}
${subjectContext[subject] || ""}

STRICT RULES:
- Write EXACTLY ${wordCountMap[wordCount] || wordCountMap.standard}
- ${language === "urdu" ? "Write the ENTIRE response in Urdu script" : "Write in clear professional English"}
- Start DIRECTLY with the content — no preamble like "Here is your assignment"
- Use # for main headings, ## for subheadings, ### for sub-headings
- For diagrams use Mermaid syntax in \`\`\`mermaid blocks
- For code always include brief comments
- Make every sentence count — no filler or repetition
${citationStyle && citationStyle !== "none" ? `- End with ## References section in ${citationStyle} format with 3+ real citations` : "- Do NOT add references"}`;

    const rawContent = await generateContent(prompt);

    // Clean AI preamble
    const content = rawContent
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/\[Proceeds\]/g, "")
      .replace(/^(Hello!|Hi!|Sure!|Of course!|Here's|Here is|Let me|I'll|Great!|Certainly!|I can)[^\n]*/gm, "")
      .replace(/^(Let me know|Feel free|Hope this|If you need|I hope)[^\n]*/gm, "")
      .trim();

    let buffer;
    const fileTitle = title || "Assignment";

    if (format === "word") buffer = await generateWord(content, fileTitle, studentDetails);
    else if (format === "excel") buffer = await generateExcel(content, fileTitle, studentDetails);
    else if (format === "pptx") buffer = await generatePPTX(content, fileTitle, studentDetails);
    else buffer = await generatePDF(content, fileTitle, studentDetails);

    const response = new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME_TYPES[format],
        "Content-Disposition": `attachment; filename="${fileTitle}.${format === "word" ? "docx" : format}"`,
      },
    });

    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        await Assignment.create({
          userId: user._id,
          title: fileTitle,
          question,
          format,
          content,
          dueDate: dueDate ? new Date(dueDate) : null,
        });

        const streakData = calculateStreak(user);
        await User.findByIdAndUpdate(user._id, {
          $inc: { generationsUsed: 1 },
          $set: {
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            lastActiveDate: streakData.lastActiveDate,
          },
        });
      }
    } else {
      const anonUsed = parseInt(cookieStore.get("anon_generations")?.value || "0");
      response.cookies.set("anon_generations", String(anonUsed + 1), {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
      });
    }

    return response;
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
