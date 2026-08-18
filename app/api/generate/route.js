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
  short: "300-500 words",
  medium: "500-800 words",
  long: "800-1200 words",
  detailed: "1200+ words",
};

const subjectContext = {
  general: "",
  cs: "This is a Computer Science/IT assignment. Use technical terminology, include code examples where relevant, explain algorithms and data structures clearly.",
  business: "This is a Business/Management assignment. Use business terminology, include real world examples, reference management theories and frameworks.",
  english: "This is an English/Literature assignment. Focus on language, grammar, literary devices, writing style and critical analysis.",
  islamic: "This is an Islamic Studies assignment. Reference Quran verses, Hadith and Islamic scholars where appropriate. Be respectful and accurate.",
  science: "This is a Science assignment. Include scientific facts, experiments, formulas in text form and proper scientific terminology.",
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

    // Handle anonymous users (not logged in)
    if (!session?.user?.email) {
      const anonUsed = cookieStore.get("anon_generations")?.value || "0";
      if (parseInt(anonUsed) >= ANONYMOUS_LIMIT) {
        return NextResponse.json(
          { error: "Create a free account to generate more assignments and unlock 5 free generations." },
          { status: 403 }
        );
      }
    } else {
      // Logged in user - check plan limit (including bonus generations from referrals)
      const user = await User.findOne({ email: session.user.email });
      const totalAllowed = FREE_LIMIT + (user?.bonusGenerations || 0);
      if (user && user.plan === "free" && user.generationsUsed >= totalAllowed) {
        return NextResponse.json(
          { error: "Free plan limit reached. Please upgrade to Pro for unlimited generations, or invite friends for bonus generations!" },
          { status: 403 }
        );
      }
    }

    const prompt = `You are an expert academic assistant. Complete the following assignment thoroughly and professionally.

Assignment: ${question}

${studentDetails?.name ? `Student: ${studentDetails.name}` : ""}
${studentDetails?.courseName ? `Course: ${studentDetails.courseName}` : ""}

${subjectContext[subject] || ""}

Follow these formatting rules:
- ${language === "urdu" ? "Write the ENTIRE response in Urdu language using Urdu script" : "Write in clear professional English"}
- Use # for main headings and ## for subheadings and ### for sub-subheadings
- Write approximately ${wordCountMap[wordCount] || "500-800 words"}
- Write detailed, accurate and well-structured responses
- Include relevant examples and explanations
- For ANY diagram, flowchart, UML, ER diagram, or visual representation use Mermaid diagram syntax wrapped in \`\`\`mermaid code blocks. Examples:

  Flowchart:
  \`\`\`mermaid
  flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D
  \`\`\`

  Sequence Diagram:
  \`\`\`mermaid
  sequenceDiagram
    Client->>Server: Request
    Server-->>Client: Response
  \`\`\`

  Class Diagram:
  \`\`\`mermaid
  classDiagram
    class Animal {
      +String name
      +makeSound()
    }
    class Dog {
      +fetch()
    }
    Animal <|-- Dog
  \`\`\`

  ER Diagram:
  \`\`\`mermaid
  erDiagram
    STUDENT ||--o{ ENROLLMENT : has
    COURSE ||--o{ ENROLLMENT : has
  \`\`\`

- For code always include comments explaining each step
- Make the response comprehensive enough to score full marks
${citationStyle && citationStyle !== "none" ? `- At the end always add a ## References section with at least 3 proper ${citationStyle} format citations` : ""}`;

    const content = await generateContent(prompt);

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