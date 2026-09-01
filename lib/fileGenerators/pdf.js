import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { fetchMermaidImage } from "../mermaid.js";

function sanitize(text) {
  return text
    .replace(/→/g, "->").replace(/←/g, "<-")
    .replace(/•/g, "-").replace(/…/g, "...")
    .replace(/"/g, '"').replace(/"/g, '"')
    .replace(/'/g, "'").replace(/'/g, "'")
    .replace(/–/g, "-").replace(/—/g, "-")
    .replace(/\*\*/g, "").replace(/\*/g, "")
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
      current = word.length > maxChars ? word.slice(0, maxChars) : word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function generatePDF(content, title, studentDetails = {}) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  const pageWidth = 595;
  const pageHeight = 842;
  const marginLeft = 70;
  const marginRight = 70;
  const marginTop = 80;
  const marginBottom = 70;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const maxChars = 80;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginTop;
  let pageNum = 1;

  function newPage() {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    pageNum++;
    y = pageHeight - marginTop;

    // Page number at bottom
    page.drawText(`${pageNum}`, {
      x: pageWidth / 2 - 5,
      y: 30,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  function checkY(needed = 20) {
    if (y - needed < marginBottom) newPage();
  }

  // ── Draw page number on first page ──
  page.drawText("1", { x: pageWidth / 2 - 5, y: 30, size: 9, font, color: rgb(0.6, 0.6, 0.6) });

  // ── Student Header ──
  const headerItems = [
    studentDetails?.name && `Student: ${studentDetails.name}`,
    studentDetails?.rollNumber && `Roll No: ${studentDetails.rollNumber}`,
    studentDetails?.courseName && `Course: ${studentDetails.courseName}`,
    studentDetails?.instructorName && `Instructor: ${studentDetails.instructorName}`,
    studentDetails?.date && `Date: ${studentDetails.date}`,
  ].filter(Boolean);

  if (headerItems.length > 0) {
    // Header box background
    page.drawRectangle({
      x: marginLeft,
      y: y - (headerItems.length * 16) - 10,
      width: contentWidth,
      height: headerItems.length * 16 + 10,
      color: rgb(0.97, 0.97, 1.0),
      borderColor: rgb(0.85, 0.85, 0.95),
      borderWidth: 0.5,
    });

    for (const item of headerItems) {
      page.drawText(sanitize(item), { x: marginLeft + 8, y, size: 9.5, font, color: rgb(0.35, 0.35, 0.45) });
      y -= 16;
    }

    y -= 10;

    // Violet accent line
    page.drawLine({
      start: { x: marginLeft, y },
      end: { x: pageWidth - marginRight, y },
      thickness: 1.5,
      color: rgb(0.49, 0.23, 0.93),
    });
    y -= 24;
  }

  // ── Title ──
  const titleText = sanitize(title);
  const titleLines = wrapText(titleText, 55);
  for (const tl of titleLines) {
    checkY(36);
    page.drawText(tl, {
      x: marginLeft,
      y,
      size: 22,
      font: boldFont,
      color: rgb(0.08, 0.08, 0.15),
    });
    y -= 30;
  }

  // Underline after title
  page.drawLine({
    start: { x: marginLeft, y: y + 8 },
    end: { x: pageWidth - marginRight, y: y + 8 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 20;

  // ── Content ──
  const lines = content.split("\n");
  let inMermaid = false;
  let mermaidCode = "";
  let inCode = false;
  let codeLines = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Skip think tags
    if (rawLine.includes("<think>") || rawLine.includes("</think>") || rawLine.includes("[Proceeds]")) continue;

    // Mermaid start
    if (rawLine.trim() === "```mermaid") {
      inMermaid = true;
      mermaidCode = "";
      continue;
    }

    // Mermaid end
    if (inMermaid && rawLine.trim() === "```") {
      inMermaid = false;
      try {
        const imgBuffer = await fetchMermaidImage(mermaidCode);
        if (imgBuffer) {
          const img = await pdfDoc.embedPng(imgBuffer);
          const imgDims = img.scale(1);
          const scale = Math.min(1, contentWidth / imgDims.width, 250 / imgDims.height);
          const imgW = imgDims.width * scale;
          const imgH = imgDims.height * scale;
          checkY(imgH + 30);
          y -= 10;
          // Diagram box
          page.drawRectangle({
            x: marginLeft,
            y: y - imgH - 8,
            width: contentWidth,
            height: imgH + 16,
            color: rgb(0.98, 0.98, 1.0),
            borderColor: rgb(0.75, 0.75, 0.9),
            borderWidth: 0.5,
          });
          page.drawImage(img, {
            x: marginLeft + (contentWidth - imgW) / 2,
            y: y - imgH,
            width: imgW,
            height: imgH,
          });
          y -= imgH + 24;
        }
      } catch (err) {
        console.error("Diagram error:", err);
      }
      mermaidCode = "";
      continue;
    }
    if (inMermaid) { mermaidCode += rawLine + "\n"; continue; }

    // Code block start
    if (rawLine.startsWith("```") && !inCode) {
      inCode = true;
      codeLines = [];
      continue;
    }

    // Code block end
    if (inCode && rawLine.trim() === "```") {
      inCode = false;
      const totalCodeH = codeLines.length * 13 + 16;
      checkY(totalCodeH);

      // Code background
      page.drawRectangle({
        x: marginLeft,
        y: y - totalCodeH + 13,
        width: contentWidth,
        height: totalCodeH,
        color: rgb(0.05, 0.08, 0.12),
        borderColor: rgb(0.2, 0.2, 0.3),
        borderWidth: 0.5,
      });

      for (const cl of codeLines) {
        if (y < marginBottom + 13) newPage();
        const safeLine = sanitize(cl).slice(0, 90);
        page.drawText(safeLine || " ", {
          x: marginLeft + 8,
          y,
          size: 8.5,
          font: monoFont,
          color: rgb(0.6, 0.9, 0.6),
        });
        y -= 13;
      }
      y -= 12;
      codeLines = [];
      continue;
    }
    if (inCode) { codeLines.push(rawLine); continue; }

    // Empty line
    if (!rawLine.trim()) { y -= 8; continue; }

    // H1
    if (rawLine.startsWith("# ")) {
      const text = sanitize(rawLine.replace(/^# /, ""));
      checkY(36);
      y -= 10;

      // Violet left bar
      page.drawRectangle({
        x: marginLeft,
        y: y - 4,
        width: 4,
        height: 22,
        color: rgb(0.49, 0.23, 0.93),
      });

      const wrapped = wrapText(text, maxChars - 4);
      for (const wl of wrapped) {
        checkY(24);
        page.drawText(wl, { x: marginLeft + 12, y, size: 16, font: boldFont, color: rgb(0.08, 0.08, 0.2) });
        y -= 22;
      }
      y -= 6;
      continue;
    }

    // H2
    if (rawLine.startsWith("## ")) {
      const text = sanitize(rawLine.replace(/^## /, ""));
      checkY(28);
      y -= 8;
      const wrapped = wrapText(text, maxChars);
      for (const wl of wrapped) {
        checkY(22);
        page.drawText(wl, { x: marginLeft, y, size: 13, font: boldFont, color: rgb(0.15, 0.15, 0.35) });
        y -= 20;
      }
      // Subtle underline
      page.drawLine({
        start: { x: marginLeft, y: y + 4 },
        end: { x: marginLeft + 120, y: y + 4 },
        thickness: 0.5,
        color: rgb(0.75, 0.75, 0.85),
      });
      y -= 8;
      continue;
    }

    // H3
    if (rawLine.startsWith("### ")) {
      const text = sanitize(rawLine.replace(/^### /, ""));
      checkY(22);
      y -= 4;
      const wrapped = wrapText(text, maxChars);
      for (const wl of wrapped) {
        checkY(18);
        page.drawText(wl, { x: marginLeft, y, size: 11.5, font: boldFont, color: rgb(0.25, 0.25, 0.45) });
        y -= 18;
      }
      continue;
    }

    // Bullet
    if (rawLine.startsWith("- ") || rawLine.startsWith("* ")) {
      const text = sanitize(rawLine.replace(/^[-*] /, ""));
      const wrapped = wrapText(text, maxChars - 4);
      for (let wi = 0; wi < wrapped.length; wi++) {
        checkY(16);
        if (wi === 0) {
          // Violet bullet dot
          page.drawCircle({ x: marginLeft + 5, y: y + 3, size: 2, color: rgb(0.49, 0.23, 0.93) });
          page.drawText(wrapped[wi], { x: marginLeft + 14, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.2) });
        } else {
          page.drawText(wrapped[wi], { x: marginLeft + 14, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.2) });
        }
        y -= 15;
      }
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(rawLine)) {
      const num = rawLine.match(/^(\d+)\. /)[1];
      const text = sanitize(rawLine.replace(/^\d+\. /, ""));
      const wrapped = wrapText(text, maxChars - 6);
      for (let wi = 0; wi < wrapped.length; wi++) {
        checkY(16);
        if (wi === 0) {
          page.drawText(`${num}.`, { x: marginLeft, y, size: 10.5, font: boldFont, color: rgb(0.49, 0.23, 0.93) });
          page.drawText(wrapped[wi], { x: marginLeft + 18, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.2) });
        } else {
          page.drawText(wrapped[wi], { x: marginLeft + 18, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.2) });
        }
        y -= 15;
      }
      continue;
    }

    // Normal text
    const text = sanitize(rawLine);
    const wrapped = wrapText(text, maxChars);
    for (const wl of wrapped) {
      checkY(16);
      page.drawText(wl, { x: marginLeft, y, size: 10.5, font, color: rgb(0.18, 0.18, 0.18) });
      y -= 15;
    }
    y -= 3;
  }

  return Buffer.from(await pdfDoc.save());
}
