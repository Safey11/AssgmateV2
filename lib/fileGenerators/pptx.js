import pptxgen from "pptxgenjs";

export async function generatePPTX(content, title) {
  const prs = new pptxgen();
  const titleSlide = prs.addSlide();
  titleSlide.addText(title, { x: 0.5, y: 0.3, fontSize: 28, bold: true, color: "363636" });
  const lines = content.split("\n").filter(Boolean);
  for (let i = 0; i < lines.length; i += 6) {
    const slide = prs.addSlide();
    slide.addText(lines.slice(i, i + 6).join("\n"), { x: 0.5, y: 1.0, fontSize: 14, color: "444444", w: 9, h: 5 });
  }
  return await prs.write({ outputType: "nodebuffer" });
}