import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { fetchMermaidImage } from "../mermaid.js";

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
  const contentWidth = pageWidth - margin * 2;

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

  // Parse content — handle mermaid blocks
  const lines = content.split("\n");
  let inMermaid = false;
  let mermaidCode = "";

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    if (y < 80) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }

    // Mermaid block start
    if (rawLine.trim() === "```mermaid") {
      inMermaid = true;
      mermaidCode = "";
      continue;
    }

    // Mermaid block end
    if (inMermaid && rawLine.trim() === "```") {
      inMermaid = false;
      try {
        const imgBuffer = await fetchMermaidImage(mermaidCode);
        if (imgBuffer) {
          const img = await pdfDoc.embedPng(imgBuffer);
          const imgDims = img.scale(1);
          const maxWidth = contentWidth;
          const scale = Math.min(1, maxWidth / imgDims.width);
          const imgWidth = imgDims.width * scale;
          const imgHeight = imgDims.height * scale;

          if (y - imgHeight < 60) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - 60;
          }

          y -= 10;
          page.drawImage(img, {
            x: margin,
            y: y - imgHeight,
            width: imgWidth,
            height: imgHeight,
          });
          y -= imgHeight + 20;
        }
      } catch (err) {
        console.error("Failed to embed diagram:", err);
        page.drawText("[Diagram]", { x: margin, y, size: 11, font, color: rgb(0.5, 0.5, 0.5) });
        y -= 20;
      }
      mermaidCode = "";
      continue;
    }

    // Collect mermaid code
    if (inMermaid) {
      mermaidCode += rawLine + "\n";
      continue;
    }

    // Skip other code blocks
    if (rawLine.startsWith("```")) { y -= 4; continue; }

    // Empty line
    if (!rawLine.trim()) { y -= 8; continue; }

    // Heading 1
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

    // Heading 2
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

    // Heading 3
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

    // Code line
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

    // Normal text
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