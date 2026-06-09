import ExcelJS from "exceljs";

export async function generateExcel(content, title) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title);
  sheet.addRow([title]);
  sheet.addRow([]);
  content.split("\n").filter(Boolean).forEach((line) => sheet.addRow([line]));
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}