export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { analyzeImageWithGroq } from "@/lib/groq";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP images supported" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const text = await analyzeImageWithGroq(base64, file.type);

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error("Image parse error:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}