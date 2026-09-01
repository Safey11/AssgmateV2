import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } from "docx";
import { fetchMermaidImage } from "../mermaid.js";

function cleanText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}

export async function generateWord(content, title, studentDetails = {}) {
  const children = [];

  // ── Page Header with student details ──
  if (studentDetails?.name || studentDetails?.courseName) {
    // University / Course info box at top
    const headerRows = [
      studentDetails?.courseName && `Course: ${studentDetails.courseName}`,
      studentDetails?.name && `Student: ${studentDetails.name}`,
      studentDetails?.rollNumber && `Roll No: ${studentDetails.rollNumber}`,
      studentDetails?.instructorName && `Instructor: ${studentDetails.instructorName}`,
      studentDetails?.date && `Date: ${studentDetails.date}`,
    ].filter(Boolean);

    for (const row of headerRows) {
      children.push(new Paragraph({
        children: [new TextRun({ text: row, size: 22, color: "555555", font: "Calibri" })],
        spacing: { after: 60 },
      }));
    }

    // Divider line
    children.push(new Paragraph({
      border: { bottom: { color: "7C3AED", size: 6, style: BorderStyle.SINGLE } },
      spacing: { after: 300 },
    }));
  }

  // ── Title ──
  children.push(new Paragraph({
    children: [new TextRun({
      text: title,
      bold: true,
      size: 44,
      color: "1A1A2E",
      font: "Calibri",
    })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }));

  // ── Content ──
  const lines = content.split("\n");
  let inMermaid = false;
  let mermaidCode = "";
  let inCode = false;
  let codeLines = [];
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip AI preamble/think tags
    if (line.includes("<think>") || line.includes("</think>") || line.includes("[Proceeds]")) continue;

    // Mermaid block
    if (line.trim() === "```mermaid") {
      inMermaid = true;
      mermaidCode = "";
      continue;
    }
    if (inMermaid && line.trim() === "```") {
      inMermaid = false;
      try {
        const imgBuffer = await fetchMermaidImage(mermaidCode);
        if (imgBuffer) {
          const { ImageRun } = await import("docx");
          children.push(new Paragraph({
            children: [new ImageRun({ data: imgBuffer, transformation: { width: 500, height: 320 }, type: "png" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }));
        }
      } catch (err) {
        console.error("Diagram error:", err);
      }
      mermaidCode = "";
      continue;
    }
    if (inMermaid) { mermaidCode += line + "\n"; continue; }

    // Code block
    if (line.startsWith("```") && !inCode) {
      inCode = true;
      codeLang = line.replace("```", "").trim();
      codeLines = [];
      continue;
    }
    if (inCode && line.trim() === "```") {
      inCode = false;
      // Add code label
      if (codeLang) {
        children.push(new Paragraph({
          children: [new TextRun({ text: codeLang.toUpperCase(), size: 18, color: "7C3AED", bold: true, font: "Calibri" })],
          spacing: { before: 200, after: 80 },
        }));
      }
      // Code content
      for (const codeLine of codeLines) {
        children.push(new Paragraph({
          children: [new TextRun({ text: codeLine || " ", size: 18, font: "Courier New", color: "1E3A5F" })],
          shading: { type: ShadingType.CLEAR, color: "F0F4FF", fill: "F0F4FF" },
          spacing: { after: 0 },
          indent: { left: 360 },
        }));
      }
      children.push(new Paragraph({ spacing: { after: 200 } }));
      codeLines = [];
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    // Empty line
    if (!line.trim()) {
      children.push(new Paragraph({ spacing: { after: 120 } }));
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: cleanText(line.replace(/^# /, "")), bold: true, size: 36, color: "1A1A2E", font: "Calibri" })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 160 },
        border: { bottom: { color: "7C3AED", size: 4, style: BorderStyle.SINGLE } },
      }));
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: cleanText(line.replace(/^## /, "")), bold: true, size: 28, color: "2D2D44", font: "Calibri" })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
      }));
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: cleanText(line.replace(/^### /, "")), bold: true, size: 24, color: "444466", font: "Calibri" })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
      }));
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: cleanText(line.replace(/^[-*] /, "")), size: 24, font: "Calibri", color: "333333" })],
        bullet: { level: 0 },
        spacing: { after: 80 },
        indent: { left: 360 },
      }));
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      children.push(new Paragraph({
        children: [new TextRun({ text: cleanText(line.replace(/^\d+\. /, "")), size: 24, font: "Calibri", color: "333333" })],
        numbering: { reference: "default-numbering", level: 0 },
        spacing: { after: 80 },
        indent: { left: 360 },
      }));
      continue;
    }

    // Bold text detection
    const hasBold = line.includes("**");
    if (hasBold) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const runs = parts.map((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return new TextRun({ text: part.slice(2, -2), bold: true, size: 24, font: "Calibri", color: "333333" });
        }
        return new TextRun({ text: part, size: 24, font: "Calibri", color: "333333" });
      });
      children.push(new Paragraph({ children: runs, spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED }));
      continue;
    }

    // Normal paragraph
    children.push(new Paragraph({
      children: [new TextRun({ text: cleanText(line), size: 24, font: "Calibri", color: "333333" })],
      spacing: { after: 120 },
      alignment: AlignmentType.JUSTIFIED,
    }));
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: "default-numbering",
        levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT }],
      }],
    },
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 24, color: "333333" },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      children,
    }],
  });

  return await Packer.toBuffer(doc);
}
