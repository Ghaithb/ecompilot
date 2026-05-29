const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/modules/website/services/smart-website-generator.service.ts');
let content = fs.readFileSync(filePath, 'utf8');
const start = content.indexOf('  private generateCheckoutScript(config: NormalizedWebsiteConfig): string {');
const endMarker = '  /**\n   *';
const end = content.indexOf(endMarker, start + 100);
const version2 = content.indexOf('VERSION 2', start);
const endIdx = content.lastIndexOf('  }', version2);

if (start === -1 || version2 === -1) {
  console.error('Could not find markers', { start, version2 });
  process.exit(1);
}

const replacement = `  private generateCheckoutScript(config: NormalizedWebsiteConfig): string {
    return generateExpressCheckoutScript({
      slug: config.slug || '',
      currency: config.settings?.currency || 'TND',
      whatsappNumber: config.phone,
      companyName: config.companyName,
    });
  }

  private generateCheckoutHTML(config: NormalizedWebsiteConfig): string {
    return generateExpressCheckoutHTML({
      slug: config.slug || '',
      currency: config.settings?.currency || 'TND',
      whatsappNumber: config.phone,
      companyName: config.companyName,
    });
  }

`;

// Find closing brace of generateCheckoutHTML before VERSION 2
const sliceEnd = content.indexOf('\n  /**', content.indexOf('private generateCheckoutHTML', start));
const actualEnd = content.indexOf('VERSION 2', start);
const beforeVersion = content.lastIndexOf('\n  }', actualEnd);

content = content.slice(0, start) + replacement + content.slice(beforeVersion + '\n  }'.length + 1);
fs.writeFileSync(filePath, content);
console.log('Patched successfully');
