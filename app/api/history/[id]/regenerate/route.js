import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { generateContent } from "@/lib/ai";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const assignment = await Assignment.findById(id);
    if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prompt = `You are an expert academic assistant. Complete the following assignment thoroughly and professionally.

Assignment: ${assignment.question}

Provide a well-structured, detailed response with proper headings, explanations, and examples where needed. Format using markdown with # for main headings and ## for subheadings.`;

    const content = await generateContent(prompt);
    assignment.content = content;
    await assignment.save();

    return NextResponse.json({ message: "Regenerated", content });
  } catch (error) {
    return NextResponse.json({ error: "Regeneration failed" }, { status: 500 });
  }
}