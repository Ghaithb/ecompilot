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

const importLine = "import { apiUrl, getAuthHeaders, resolveUploadUrl } from '@/lib/apiConfig';";

for (const rel of files) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) {
    console.log('SKIP missing', rel);
    continue;
  }
  let c = fs.readFileSync(fp, 'utf8');
  if (!c.includes('localhost:3001')) {
    console.log('OK no localhost', rel);
    continue;
  }

  // Replace URL patterns
  c = c.replace(/`http:\/\/localhost:3001\/api\/v1([^`]*)`/g, (_, rest) => `\`\${apiUrl('${rest}')}\``);
  c = c.replace(/'http:\/\/localhost:3001\/api\/v1([^']*)'/g, (_, rest) => `apiUrl('${rest}')`);
  c = c.replace(/"http:\/\/localhost:3001\/api\/v1([^"]*)"/g, (_, rest) => `apiUrl('${rest}')`);
  c = c.replace(/`http:\/\/localhost:3001(\$\{[^}]+\})`/g, '`${resolveUploadUrl($1)}`');
  c = c.replace(/`http:\/\/localhost:3001(\/[^`]*)`/g, (_, p) => `\`\${resolveUploadUrl('${p}')}\``);
  c = c.replace(/'http:\/\/localhost:3001'/g, 'API_ORIGIN_PLACEHOLDER');
  c = c.replace(/"http:\/\/localhost:3001"/g, 'API_ORIGIN_PLACEHOLDER');

  // Fix auth headers pattern
  c = c.replace(
    /headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*,?\s*\}/g,
    'headers: getAuthHeaders()',
  );
  c = c.replace(
    /headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}/g,
    'headers: getAuthHeaders()',
  );
  c = c.replace(
    /headers:\s*\{\s*'Content-Type':\s*'application\/json',\s*Authorization:\s*`Bearer \$\{token\}`\s*,?\s*\}/g,
    'headers: getAuthHeaders()',
  );

  if (!c.includes("from '@/lib/apiConfig'")) {
    const lines = c.split('\n');
    let insertAt = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) insertAt = i + 1;
    }
    lines.splice(insertAt, 0, importLine);
    c = lines.join('\n');
  }

  if (c.includes('API_ORIGIN_PLACEHOLDER')) {
    c = c.replace(/API_ORIGIN_PLACEHOLDER/g, "import.meta.env.VITE_API_URL?.replace(/\\/api\\/v\\d+$/, '') || 'http://localhost:3001'");
  }

  fs.writeFileSync(fp, c);
  console.log('FIXED', rel);
}
