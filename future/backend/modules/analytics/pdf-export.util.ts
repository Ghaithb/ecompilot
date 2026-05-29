import PDFDocument from 'pdfkit';

export function generateAnalyticsPdf(data: any): Buffer {
  const doc = new PDFDocument({ margin: 30 });
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(18).text('Analytics Export', { align: 'center' });
  doc.moveDown();

  if (data.sales) {
    doc.fontSize(14).text('Sales Metrics');
    Object.entries(data.sales).forEach(([k, v]) => {
      doc.fontSize(12).text(`${k}: ${JSON.stringify(v)}`);
    });
    doc.moveDown();
  }
  if (data.inventory) {
    doc.fontSize(14).text('Inventory Metrics');
    Object.entries(data.inventory).forEach(([k, v]) => {
      doc.fontSize(12).text(`${k}: ${JSON.stringify(v)}`);
    });
    doc.moveDown();
  }
  doc.end();
  return Buffer.concat(buffers);
}
