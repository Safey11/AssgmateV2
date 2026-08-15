import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export async function generateWord(content, title, studentDetails = {}) {
  const children = [];

  // Student details header
  const headerItems = [
    studentDetails?.name && `Student: ${studentDetails.name}`,
    studentDetails?.rollNumber && `Roll No: ${studentDetails.rollNumber}`,
    studentDetails?.courseName && `Course: ${studentDetails.courseName}`,
    studentDetails?.instructorName && `Instructor: ${studentDetails.instructorName}`,
    studentDetails?.date && `Date: ${studentDetails.date}`,
  ].filter(Boolean);

  for (const item of headerItems) {
    children.push(new Paragraph({
      children: [new TextRun({ text: item, size: 20, color: "666666" })],
    }));
  }

  if (headerItems.length > 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
  }

  // Title
  children.push(new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 36 })],
  }));
  children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

  // Content
  const lines = content.split("\n");
  for (const line of lines) {
    if (line.startsWith("# ")) {
      children.push(new Paragraph({ text: line.replace("# ", ""), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({ text: line.replace("## ", ""), heading: HeadingLevel.HEADING_2 }));
    } else if (line.startsWith("### ")) {
      children.push(new Paragraph({ text: line.replace("### ", ""), heading: HeadingLevel.HEADING_3 }));
    } else if (!line.trim()) {
      children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
    } else {
      children.push(new Paragraph({ children: [new TextRun(line)] }));
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return await Packer.toBuffer(doc);
}
