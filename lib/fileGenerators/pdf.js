import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function sanitize(text) {
  return text
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
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
    .replace(/#{1,6} /g, "")
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
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generatePDF(content, title) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const maxChars = 85;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 60;

  // Title
  page.drawText(sanitize(title), {
    x: margin,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 40;

  const lines = content.split("\n");

  for (const rawLine of lines) {
    const line = sanitize(rawLine);
    if (!line.trim()) {
      y -= 10;
      continue;
    }

    // Check if new page needed
    if (y < 60) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 60;
    }

    // Heading 1
    if (rawLine.startsWith("# ")) {
      y -= 10;
      page.drawText(line.slice(2), {
        x: margin,
        y,
        size: 16,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.5),
      });
      y -= 24;
    }
    // Heading 2
    else if (rawLine.startsWith("## ")) {
      y -= 6;
      page.drawText(line.slice(3), {
        x: margin,
        y,
        size: 13,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 20;
    }
    // Heading 3
    else if (rawLine.startsWith("### ")) {
      page.drawText(line.slice(4), {
        x: margin,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 18;
    }
    // Code line
    else if (rawLine.startsWith("```") || rawLine.startsWith("    ")) {
      const wrapped = wrapText(line, maxChars);
      for (const wl of wrapped) {
        if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }
        page.drawText(wl, {
          x: margin + 10,
          y,
          size: 9,
          font: monoFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 14;
      }
    }
    // Normal text with word wrap
    else {
      const wrapped = wrapText(line, maxChars);
      for (const wl of wrapped) {
        if (y < 60) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - 60; }
        page.drawText(wl, {
          x: margin,
          y,
          size: 11,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 16;
      }
    }
  }

  return Buffer.from(await pdfDoc.save());
}