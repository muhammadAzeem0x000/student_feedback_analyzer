import "server-only";
import { PDFParse } from "pdf-parse";

export async function extractPdfText(data: ArrayBuffer) {
  const parser = new PDFParse({ data: new Uint8Array(data) });
  try {
    const result = await parser.getText({ first: 30 });
    return result.text.slice(0, 60_000);
  } finally {
    await parser.destroy();
  }
}
