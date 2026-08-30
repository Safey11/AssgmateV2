import { NextResponse } from "next/server";
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

export async function POST(req) {
  try {
    const { content, format, title, studentDetails } = await req.json();

    let buffer;
    const fileTitle = title || "Assignment";

    if (format === "word") buffer = await generateWord(content, fileTitle, studentDetails);
    else if (format === "excel") buffer = await generateExcel(content, fileTitle, studentDetails);
    else if (format === "pptx") buffer = await generatePPTX(content, fileTitle, studentDetails);
    else buffer = await generatePDF(content, fileTitle, studentDetails);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME_TYPES[format],
        "Content-Disposition": `attachment; filename="${fileTitle}.${format === "word" ? "docx" : format}"`,
      },
    });
  } catch (error) {
    console.error("Generate from content error:", error);
    return NextResponse.json({ error: "Failed to generate file" }, { status: 500 });
  }
}