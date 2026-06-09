import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";

export async function GET() {
  try {
    await connectDB();
    const assignments = await Assignment.find({}).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}