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
    .replace(/[^\x00-\x7F]/g, "");
}

export async function generatePDF(content, title) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let page = pdfDoc.addPage([595, 842]);
  const { height } = page.getSize();
  let y = height - 60;
  page.drawText(sanitize(title), { x: 50, y, size: 20, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  y -= 40;
  for (const line of content.split("\n").filter(Boolean)) {
    if (y < 60) { page = pdfDoc.addPage([595, 842]); y = height - 60; }
    page.drawText(sanitize(line).slice(0, 90), { x: 50, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 20;
  }
  return Buffer.from(await pdfDoc.save());
}