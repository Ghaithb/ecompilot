import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { formatCurrency } from './analyticsHelpers';

export function exportAnalyticsPdf(salesMetrics: any, inventoryMetrics: any, financialAnalysis: any, salesData: any, salesForecasts: any, selectedPeriod: string) {
  const doc = new jsPDF();
  doc.setFontSize(24);
  doc.text('Rapport Analytics IA', 14, 20);
  doc.setFontSize(12);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  doc.text(`Période d'analyse: ${selectedPeriod}`, 14, 36);

  // KPIs principaux
  doc.setFontSize(14);
  doc.text('Indicateurs Clés de Performance', 14, 50);
  const kpiData = [
    ['Chiffre d\'affaires', formatCurrency(salesMetrics?.totalRevenue || 0)],
    ['Commandes', salesMetrics?.totalOrders?.toString() || '0'],
    ['Panier Moyen', formatCurrency(salesMetrics?.averageOrderValue || 0)],
    ['Conversion', `${financialAnalysis?.conversionRate?.toFixed(1) || '0'}%`],
    ['Marge brute', `${financialAnalysis?.grossMargin?.toFixed(1) || '0'}%`]
  ];
  autoTable(doc, { head: [['Indicateur', 'Valeur']], body: kpiData, startY: 60, theme: 'plain' });

  // Ventes par période
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Analyse des Ventes', 14, 20);
  if (Array.isArray(salesData) && salesData.length > 0) {
    autoTable(doc, {
      head: [['Période', 'CA', 'Commandes', 'Panier Moyen']],
      body: salesData.map((row: any) => [
        row.month,
        formatCurrency(row.total),
        row.orders,
        row.orders ? formatCurrency(row.total / row.orders) : formatCurrency(0)
      ]),
      startY: 30,
      theme: 'striped'
    });
  }

  // Top produits
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Top Produits', 14, 20);
  if (Array.isArray(salesMetrics?.topSellingProducts) && salesMetrics.topSellingProducts.length > 0) {
    autoTable(doc, {
      head: [['Produit', 'Ventes', 'CA']],
      body: salesMetrics.topSellingProducts.map((p: any) => [
        p.title,
        p.quantitySold,
        formatCurrency(p.revenue)
      ]),
      startY: 30,
      theme: 'striped'
    });
  }

  // Inventaire
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Inventaire', 14, 20);
  const stockData = [
    ['Produits en stock', inventoryMetrics?.totalProducts || 0],
    ['Valeur totale', formatCurrency(inventoryMetrics?.totalInventoryValue || 0)],
    ['Ruptures de stock', inventoryMetrics?.outOfStockItems || 0],
    ['Stock faible', inventoryMetrics?.lowStockItems || 0]
  ];
  autoTable(doc, { head: [['Indicateur Stock', 'Valeur']], body: stockData, startY: 30, theme: 'plain' });

  // Recommandations IA
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Recommandations IA', 14, 20);
  const recommendationsArr = [
    ...(Array.isArray(salesForecasts?.recommendations)
      ? salesForecasts.recommendations.map((r: any) => 'Ventes: ' + r)
      : salesForecasts?.recommendations ? ['Ventes: ' + salesForecasts.recommendations] : []),
    ...(Array.isArray(financialAnalysis?.recommendations)
      ? financialAnalysis.recommendations.map((r: any) => 'Finance: ' + r)
      : financialAnalysis?.recommendations ? ['Finance: ' + financialAnalysis.recommendations] : []),
    ...(Array.isArray(inventoryMetrics?.recommendations)
      ? inventoryMetrics.recommendations.map((r: any) => 'Stock: ' + r)
      : inventoryMetrics?.recommendations ? ['Stock: ' + inventoryMetrics.recommendations] : [])
  ];
  if (recommendationsArr.length > 0) {
    doc.setFontSize(12);
    let y = 30;
    recommendationsArr.forEach(rec => {
      doc.text(rec, 14, y);
      y += 10;
    });
  }

  doc.save(`analytics-${new Date().toISOString().slice(0, 10)}.pdf`);
}
