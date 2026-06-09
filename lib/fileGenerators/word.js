import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export async function generateWord(content, title) {
  const paragraphs = content.split("\n").filter(Boolean).map((line) => {
    if (line.startsWith("# ")) return new Paragraph({ text: line.replace("# ", ""), heading: HeadingLevel.HEADING_1 });
    if (line.startsWith("## ")) return new Paragraph({ text: line.replace("## ", ""), heading: HeadingLevel.HEADING_2 });
    return new Paragraph({ children: [new TextRun(line)] });
  });

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  return await Packer.toBuffer(doc);
}