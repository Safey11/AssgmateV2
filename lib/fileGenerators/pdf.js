import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function sanitize(text) {
  return text
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/↑/g, "^")
    .replace(/↓/g, "v")
    .replace(/•/g, "-")
    .replace(/…/g, "...")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/[^\x00-\x7F]/g, "");
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= maxChars) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word.slice(0, maxChars);
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generatePDF(content, title, studentDetails = {}) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const maxChars = 85;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 50;

  // Student Header
  const headerItems = [
    studentDetails?.name && `Student: ${studentDetails.name}`,
    studentDetails?.rollNumber && `Roll No: ${studentDetails.rollNumber}`,
    studentDetails?.courseName && `Course: ${studentDetails.courseName}`,
    studentDetails?.instructorName && `Instructor: ${studentDetails.instructorName}`,
    studentDetails?.date && `Date: ${studentDetails.date}`,
  ].filter(Boolean);

  if (headerItems.length > 0) {
    for (const item of headerItems) {
      if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 50; }
      page.drawText(sanitize(item), { x: margin, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
    }
    page.drawLine({
      start: { x: margin, y: y - 4 },
      end: { x: pageWidth - margin, y: y - 4 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 20;
  }

  // Title
  const titleLines = wrapText(sanitize(title), maxChars);
  for (const tl of titleLines) {
    if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }
    page.drawText(tl, { x: margin, y, size: 20, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 28;
  }
  y -= 16;

  const lines = content.split("\n");

  for (const rawLine of lines) {
    if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }

    if (!rawLine.trim()) { y -= 8; continue; }

    if (rawLine.startsWith("# ")) {
      const text = sanitize(rawLine.replace(/^# /, ""));
      y -= 8;
      const wrapped = wrapText(text, maxChars);
      for (const wl of wrapped) {
        if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }
        page.drawText(wl, { x: margin, y, size: 16, font: boldFont, color: rgb(0.2, 0.2, 0.6) });
        y -= 22;
      }
      continue;
    }

    if (rawLine.startsWith("## ")) {
      const text = sanitize(rawLine.replace(/^## /, ""));
      y -= 6;
      const wrapped = wrapText(text, maxChars);
      for (const wl of wrapped) {
        if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }
        page.drawText(wl, { x: margin, y, size: 13, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
        y -= 20;
      }
      continue;
    }

    if (rawLine.startsWith("### ")) {
      const text = sanitize(rawLine.replace(/^### /, ""));
      const wrapped = wrapText(text, maxChars);
      for (const wl of wrapped) {
        if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }
        page.drawText(wl, { x: margin, y, size: 12, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
        y -= 18;
      }
      continue;
    }

    if (rawLine.startsWith("```")) { y -= 4; continue; }

    if (rawLine.startsWith("    ") || rawLine.startsWith("\t")) {
      const text = sanitize(rawLine.trimStart());
      const wrapped = wrapText(text, 80);
      for (const wl of wrapped) {
        if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }
        page.drawText(wl, { x: margin + 15, y, size: 9, font: monoFont, color: rgb(0.3, 0.3, 0.3) });
        y -= 13;
      }
      continue;
    }

    const text = sanitize(rawLine);
    const wrapped = wrapText(text, maxChars);
    for (const wl of wrapped) {
      if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }
      page.drawText(wl, { x: margin, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 16;
    }
  }

  return Buffer.from(await pdfDoc.save());
}
