export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { extractText } from "unpdf";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf");

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { text } = await extractText(buffer, { mergePages: true });

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}