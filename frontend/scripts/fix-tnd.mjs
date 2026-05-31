import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src');
const targets = [
  'pages/AbandonedCartPage.tsx',
  'pages/AccountingPage.tsx',
  'pages/StaffPage.tsx',
  'pages/QuotesInvoicesPage.tsx',
  'pages/BookingPage.tsx',
  'pages/WebsiteOrdersPage.tsx',
  'pages/CustomersPage.tsx',
  'pages/POSPage.tsx',
  'pages/MarketsPage.tsx',
  'pages/OnboardingSurveyPage.tsx',
  'pages/IntegrationsPage.tsx',
  'pages/NotificationsSettingsPage.tsx',
  'pages/MarketingPage.tsx',
  'pages/AiCopilotPage.tsx',
  'pages/PurchaseOrdersPage.tsx',
  'pages/FinancingPage.tsx',
  'components/Dashboard/RecentOrders.tsx',
  'components/Dashboard/RevenueChartWidget.tsx',
  'components/Dashboard/SalesChart.tsx',
  'components/Navbar/EnhancedNavbar.tsx',
  'components/Navbar/NavbarCenter.tsx',
  'components/Sidebar/QuickStats.tsx',
  'components/Sidebar/RecentActivity.tsx',
  'components/website/ServicesConfig.tsx',
  'components/website/ProductsIntegration.tsx',
  'components/website/AnalyticsDashboard.tsx',
  'components/website/AIContentGenerator.tsx',
  'components/website/SectionsLibrary.tsx',
  'components/website/TemplateLibrary.tsx',
  'components/WebsiteWizard/steps/Step4Services.tsx',
  'lib/generate-invoice.ts',
  'utils/analyticsHelpers.ts',
];

const importLine = "import { formatTND } from '@/lib/currency';";

for (const rel of targets) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;

  c = c.replace(/\{([^}]*?)\.toFixed\((\d+)\)\}€/g, '{formatTND($1, $2)}');
  c = c.replace(/currency:\s*'EUR'/g, "currency: 'TND'");
  c = c.replace(/currency:\s*"EUR"/g, 'currency: "TND"');
  c = c.replace(/currency \|\| "EUR"/g, 'currency || "TND"');
  c = c.replace(/currency \|\| 'EUR'/g, "currency || 'TND'");
  c = c.replace(/(\d[\d.,]*)\s*€/g, (_, n) => {
    const num = parseFloat(n.replace(',', '.'));
    return Number.isFinite(num) ? formatTND(num) : `${n} TND`;
  });
  c = c.replace(/€/g, ' TND');
  c = c.replace(/Prix \(€\)/g, 'Prix (TND)');
  c = c.replace(/Montant \(€\)/g, 'Montant (TND)');
  c = c.replace(/\(€\)/g, '(TND)');
  c = c.replace(/en €/g, 'en TND');

  if (c.includes('formatTND') && !c.includes("from '@/lib/currency'")) {
    const lines = c.split('\n');
    let insertAt = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) insertAt = i + 1;
    }
    lines.splice(insertAt, 0, importLine);
    c = lines.join('\n');
  }

  // Replace Intl EUR formatters with formatTND where obvious
  c = c.replace(
    /new Intl\.NumberFormat\('fr-FR',\s*\{\s*style:\s*'currency',\s*currency:\s*'TND'\s*\}\)\.format\(([^)]+)\)/g,
    'formatTND($1)',
  );

  if (c !== orig) {
    fs.writeFileSync(fp, c);
    console.log('TND', rel);
  }
}

function formatTND(amount, decimals = 2) {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return `${value.toFixed(decimals)} TND`;
}
