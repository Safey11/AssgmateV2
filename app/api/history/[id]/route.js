import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { generateWord } from "@/lib/fileGenerators/word";
import { generateExcel } from "@/lib/fileGenerators/excel";
import { generatePPTX } from "@/lib/fileGenerators/pptx";
import { generatePDF } from "@/lib/fileGenerators/pdf";

const MIME_TYPES = {
  word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  pdf: "application/pdf",
};

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    await Assignment.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { content } = await req.json();
    await connectDB();
    await Assignment.findByIdAndUpdate(id, { content });
    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const { format } = await req.json();
    const assignment = await Assignment.findById(id);
    if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const targetFormat = format || assignment.format;
    let buffer;

    if (targetFormat === "word") buffer = await generateWord(assignment.content, assignment.title);
    else if (targetFormat === "excel") buffer = await generateExcel(assignment.content, assignment.title);
    else if (targetFormat === "pptx") buffer = await generatePPTX(assignment.content, assignment.title);
    else buffer = await generatePDF(assignment.content, assignment.title);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME_TYPES[targetFormat],
        "Content-Disposition": `attachment; filename="${assignment.title}.${targetFormat === "word" ? "docx" : targetFormat}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}