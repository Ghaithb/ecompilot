import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src');
const files = [
  'pages/SitePreviewPage.tsx',
  'pages/PublicSitePage.tsx',
  'pages/WebsiteTemplateGallery.tsx',
  'pages/WebsiteManagementPage.tsx',
  'pages/WebsitePagesPage.tsx',
  'components/website/WebsiteWizard.tsx',
  'components/website/ServicesConfig.tsx',
  'components/website/WebsiteAnalytics.tsx',
  'components/website/VersionHistory.tsx',
  'components/website/ProductsIntegration.tsx',
  'components/ui/file-upload.tsx',
  'components/ui/multi-image-upload.tsx',
];

for (const rel of files) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // Fix broken lucide import split by apiConfig import
  const brokenImport = /import \{\s*\nimport \{ apiUrl, getAuthHeaders(?:, resolveUploadUrl)? \} from '@\/lib\/apiConfig';\s*\n/g;
  if (brokenImport.test(c)) {
    c = c.replace(
      brokenImport,
      "import { apiUrl, getAuthHeaders, resolveUploadUrl } from '@/lib/apiConfig';\nimport {\n",
    );
    changed = true;
  }

  // Fix `${apiUrl('/literal/${var}')}` -> apiUrl(`/literal/${var}`)
  c = c.replace(
    /`\$\{apiUrl\('([^']*\$\{[^}]+\}[^']*)'\)\}`/g,
    (_, inner) => {
      changed = true;
      const fixed = inner.replace(/\$\{([^}]+)\}/g, '${$1}');
      return `apiUrl(\`${fixed}\`)`;
    },
  );

  // Fix `${apiUrl('/path/${a}/${b}')}` style with multiple vars - simpler pass
  c = c.replace(
    /`\$\{apiUrl\('([^']+)'\)\}`/g,
    (_, inner) => {
      if (!inner.includes('${')) return _;
      changed = true;
      return `apiUrl(\`${inner}\`)`;
    },
  );

  // file-upload endpoint
  c = c.replace(
    /`\$\{apiUrl\('\/\$\{endpoint\}'\)'\)\}`/g,
    () => {
      changed = true;
      return 'apiUrl(`/${endpoint}`)';
    },
  );
  c = c.replace(
    /apiUrl\('\/\$\{endpoint\}'\)/g,
    () => {
      changed = true;
      return 'apiUrl(`/${endpoint}`)';
    },
  );

  if (changed) {
    fs.writeFileSync(fp, c);
    console.log('PATCHED', rel);
  }
}
