// Ambient declarations to silence TS until optional parsers are installed
// These keep dynamic imports type-safe without forcing hard deps in dev

declare module 'xlsx' {
  const xlsx: any;
  export = xlsx;
}

declare module 'pdf-parse' {
  const pdfParse: any;
  export default pdfParse;
}

declare module 'tesseract.js' {
  export function createWorker(...args: any[]): any;
}
