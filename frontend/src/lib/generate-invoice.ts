import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { type Order } from "@/types/order";

const COMPANY_INFO = {
  name: "eCompilot",
  address: "123 Tech Street",
  city: "75000 Paris",
  country: "France",
  email: "contact@ecompilot.com",
  phone: "+33 1 23 45 67 89",
  website: "www.ecompilot.com",
  vatNumber: "FR 12 345 678 901",
};

export const generateInvoicePdf = async (order: Order): Promise<void> => {
  const pdf = new jsPDF();
  
  // Configuration des polices
  pdf.setFont("helvetica");

  // En-tête
  pdf.setFontSize(20);
  pdf.text("FACTURE", pdf.internal.pageSize.width / 2, 20, { align: "center" });

  // Informations de la société
  pdf.setFontSize(10);
  pdf.text(COMPANY_INFO.name, 20, 40);
  pdf.text(COMPANY_INFO.address, 20, 45);
  pdf.text(`${COMPANY_INFO.city}, ${COMPANY_INFO.country}`, 20, 50);
  pdf.text(`Email: ${COMPANY_INFO.email}`, 20, 55);
  pdf.text(`Tél: ${COMPANY_INFO.phone}`, 20, 60);
  pdf.text(`TVA: ${COMPANY_INFO.vatNumber}`, 20, 65);

  // Informations de facturation
  pdf.setFontSize(12);
  pdf.text("Facturé à:", pdf.internal.pageSize.width - 90, 40);
  if (order.shippingAddress) {
    const { firstName, lastName, address1, address2, city, zip, province, country } = order.shippingAddress;
    pdf.text(`${firstName} ${lastName}`, pdf.internal.pageSize.width - 90, 45);
    pdf.text(address1, pdf.internal.pageSize.width - 90, 50);
    if (address2) pdf.text(address2, pdf.internal.pageSize.width - 90, 55);
    pdf.text(`${zip} ${city}`, pdf.internal.pageSize.width - 90, address2 ? 60 : 55);
    pdf.text(`${province}, ${country}`, pdf.internal.pageSize.width - 90, address2 ? 65 : 60);
  } else {
    pdf.text(order.customerEmail, pdf.internal.pageSize.width - 90, 45);
  }

  // Informations de la commande
  pdf.setFontSize(10);
  pdf.text(`Numéro de facture: ${order.orderNumber}`, 20, 80);
  pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString("fr-FR")}`, 20, 85);
  pdf.text(`Statut de paiement: ${getPaymentStatusText(order.paymentStatus)}`, 20, 90);

  // Tableau des articles
  autoTable(pdf, {
    startY: 100,
    head: [["Description", "Quantité", "Prix unitaire", "TVA", "Total HT", "Total TTC"]],
    body: order.lineItems.map((item) => [
      item.title,
      item.quantity.toString(),
      formatPrice(item.price, order.currency),
      formatPrice(calculateTVA(item.price), order.currency),
      formatPrice(item.price * item.quantity, order.currency),
      formatPrice((item.price + calculateTVA(item.price)) * item.quantity, order.currency),
    ]),
    foot: [[
      "Total",
      "",
      "",
      formatPrice(order.taxAmount, order.currency),
      formatPrice(order.subtotal, order.currency),
      formatPrice(order.total, order.currency),
    ]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // Pied de page
  const finalY = (pdf as any).lastAutoTable.finalY || 150;
  
  // Récapitulatif des montants
  pdf.setFontSize(10);
  pdf.text("Récapitulatif", pdf.internal.pageSize.width - 90, finalY + 10);
  
  const summaryStart = finalY + 15;
  pdf.text("Sous-total HT:", pdf.internal.pageSize.width - 90, summaryStart);
  pdf.text(formatPrice(order.subtotal, order.currency), pdf.internal.pageSize.width - 30, summaryStart, { align: "right" });
  
  pdf.text("TVA:", pdf.internal.pageSize.width - 90, summaryStart + 5);
  pdf.text(formatPrice(order.taxAmount, order.currency), pdf.internal.pageSize.width - 30, summaryStart + 5, { align: "right" });
  
  if (order.shippingAmount > 0) {
    pdf.text("Frais de livraison:", pdf.internal.pageSize.width - 90, summaryStart + 10);
    pdf.text(formatPrice(order.shippingAmount, order.currency), pdf.internal.pageSize.width - 30, summaryStart + 10, { align: "right" });
  }
  
  if (order.discountAmount > 0) {
    pdf.text("Remise:", pdf.internal.pageSize.width - 90, summaryStart + 15);
    pdf.text(`-${formatPrice(order.discountAmount, order.currency)}`, pdf.internal.pageSize.width - 30, summaryStart + 15, { align: "right" });
  }
  
  pdf.setFontSize(12);
  pdf.text("Total TTC:", pdf.internal.pageSize.width - 90, summaryStart + 25);
  pdf.text(formatPrice(order.total, order.currency), pdf.internal.pageSize.width - 30, summaryStart + 25, { align: "right" });

  // Mentions légales
  const legalText = [
    "Mentions légales",
    "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.",
    "Une indemnité forfaitaire de 40.00 TND pour frais de recouvrement sera due.",
    `Capital social : 100 0.00 TND - RCS Paris 123 456 789 - TVA : ${COMPANY_INFO.vatNumber}`,
  ];

  pdf.setFontSize(8);
  legalText.forEach((text, index) => {
    pdf.text(text, 20, pdf.internal.pageSize.height - 30 + (index * 4));
  });

  // Sauvegarde du PDF
  pdf.save(`facture_${order.orderNumber}_${formatDate(order.createdAt)}.pdf`);
};

const formatPrice = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "TND",
  }).format(amount);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, "-");
};

const calculateTVA = (price: number): number => {
  return price * 0.20; // TVA 20%
};

const getPaymentStatusText = (status: Order["paymentStatus"]): string => {
  const statusMap: Record<Order["paymentStatus"], string> = {
    pending: "En attente",
    paid: "Payé",
    refunded: "Remboursé",
    failed: "Échec",
  };
  return statusMap[status];
};