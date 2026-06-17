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

export async function POST(req) {
  try {
    const session = await auth();
    const { question, format, title } = await req.json();

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

Provide a well-structured, detailed response with proper headings, explanations, and examples where needed. Format using markdown with # for main headings and ## for subheadings.`;

    const content = await generateContent(prompt);

    let buffer;
    const fileTitle = title || "Assignment";

    if (format === "word") buffer = await generateWord(content, fileTitle);
    else if (format === "excel") buffer = await generateExcel(content, fileTitle);
    else if (format === "pptx") buffer = await generatePPTX(content, fileTitle);
    else buffer = await generatePDF(content, fileTitle);

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
      // Set cookie to track anonymous usage
      const anonUsed = parseInt(cookieStore.get("anon_generations")?.value || "0");
      response.cookies.set("anon_generations", String(anonUsed + 1), {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
      });
    }

    return response;
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}