import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  images: string[];
  vendor?: string;
  url: string;
}

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  async scrapeProduct(url: string): Promise<ScrapedProduct> {
    this.logger.log(`🔍 Scraping product from: ${url}`);
    
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(data);
      
      // 1. Title - Enhanced search
      const title = 
        $('meta[property="og:title"]').attr('content') || 
        $('meta[name="twitter:title"]').attr('content') ||
        $('.product-title').first().text().trim() ||
        $('.product-single__title').first().text().trim() ||
        $('h1').first().text().trim() || 
        $('title').text().trim();

      // 2. Price - Enhanced extraction with currency support
      let price: number | undefined;
      let priceText = '';
      const priceSelectors = [
        'meta[property="product:price:amount"]',
        'meta[property="og:price:amount"]',
        'meta[property="product:sale_price:amount"]',
        '.price__regular .price-item--regular',
        '.current-price',
        '#ProductPrice',
        '.price',
      ];

      for (const selector of priceSelectors) {
        const val = selector.startsWith('meta') 
          ? $(selector).attr('content') 
          : $(selector).first().text().trim();
        
        if (val && /[\d]/.test(val)) {
          priceText = val;
          break;
        }
      }
      
      if (priceText) {
        const numericOnly = priceText.split('').filter(c => /[\d,.]/.test(c)).join('');
        const cleaned = numericOnly.replace(/,/g, '.');
        
        const parts = cleaned.split('.');
        if (parts.length > 2) {
          price = parseFloat(parts.slice(0, -1).join('') + '.' + parts.slice(-1));
        } else {
          price = parseFloat(cleaned);
        }
      }

      // 3. Images - Get all high-res photos
      const images: string[] = [];
      
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) images.push(ogImage);

      $('img').each((_, el) => {
        const src = $(el).attr('data-zoom-src') || $(el).attr('data-src') || $(el).attr('src');
        if (src && (src.includes('cdn.shopify.com') || src.includes('product') || src.includes('large'))) {
          const fullSrc = src.startsWith('//') ? `https:${src}` : src;
          if (fullSrc.startsWith('http') && !images.includes(fullSrc)) {
            images.push(fullSrc);
          }
        }
      });

      // 4. Description
      const description = 
        $('meta[property="og:description"]').attr('content') || 
        $('meta[name="description"]').attr('content') ||
        $('.product-description').first().text().trim() ||
        $('.product-single__description').first().text().trim();

      return {
        title: title || 'Sans titre',
        description,
        price,
        currency: $('meta[property="og:price:currency"]').attr('content') || 'TND',
        images: [...new Set(images)].slice(0, 8),
        url,
      };
    } catch (error) {
      this.logger.error(`Failed to scrape ${url}: ${error.message}`);
      throw new Error(`Impossible de lire cette page. Le site bloque peut-être l'accès automatique.`);
    }
  }
}
