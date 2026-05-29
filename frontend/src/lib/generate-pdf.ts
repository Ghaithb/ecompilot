import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { type Order } from '@/types/order';

// Ajout du type pour autoTable à jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export const generateOrderPDF = (order: Order) => {
  const doc = new jsPDF();

  // En-tête
  doc.setFontSize(20);
  doc.text('FACTURE', 105, 20, { align: 'center' });
  
  // Informations de la commande
  doc.setFontSize(12);
  doc.text(`Numéro de commande: ${order.orderNumber}`, 20, 40);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, 20, 50);
  
  // Informations client
  doc.text('Client:', 20, 70);
  doc.text(order.customerEmail, 20, 80);
  
  if (order.shippingAddress) {
    const { firstName, lastName, address1, address2, city, province, country, zip } = order.shippingAddress;
    doc.text('Adresse de livraison:', 20, 100);
    doc.text(`${firstName} ${lastName}`, 20, 110);
    doc.text(address1, 20, 120);
    if (address2) doc.text(address2, 20, 130);
    doc.text(`${zip} ${city}`, 20, address2 ? 140 : 130);
    doc.text(`${province}, ${country}`, 20, address2 ? 150 : 140);
  }

  // Tableau des articles
  const tableHeaders = [['Article', 'Prix unitaire', 'Quantité', 'Total']];
  const tableData = order.lineItems.map(item => [
    item.title,
    `${item.price.toFixed(2)} €`,
    item.quantity.toString(),
    `${item.total.toFixed(2)} €`
  ]);

  doc.autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: order.shippingAddress ? 170 : 140,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10 }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 200;

  // Résumé des coûts
  doc.text('Résumé', 20, finalY + 20);
  doc.text(`Sous-total: ${order.subtotal.toFixed(2)} €`, 20, finalY + 30);
  doc.text(`TVA: ${order.taxAmount.toFixed(2)} €`, 20, finalY + 40);
  doc.text(`Frais de livraison: ${order.shippingAmount.toFixed(2)} €`, 20, finalY + 50);
  if (order.discountAmount > 0) {
    doc.text(`Remise: -${order.discountAmount.toFixed(2)} €`, 20, finalY + 60);
  }
  doc.setFontSize(14);
  doc.text(`Total: ${order.total.toFixed(2)} €`, 20, finalY + (order.discountAmount > 0 ? 75 : 65));

  // Pied de page
  doc.setFontSize(10);
  doc.text('Merci de votre confiance !', 105, 280, { align: 'center' });
  
  // Statuts
  const statusY = finalY + (order.discountAmount > 0 ? 90 : 80);
  doc.setFontSize(12);
  doc.text(`Statut de la commande: ${order.status}`, 20, statusY);
  doc.text(`Statut du paiement: ${order.paymentStatus}`, 20, statusY + 10);

  // Sauvegarde du PDF
  doc.save(`facture_${order.orderNumber}.pdf`);
};

export const exportOrdersToExcel = (orders: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(orders.map(order => ({
    Numéro: order.orderNumber,
    Date: new Date(order.createdAt).toLocaleDateString('fr-FR'),
    Client: order.customerEmail,
    Total: order.total,
    Statut: order.status,
    Paiement: order.paymentStatus,
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes');
  XLSX.writeFile(workbook, 'commandes.xlsx');
};