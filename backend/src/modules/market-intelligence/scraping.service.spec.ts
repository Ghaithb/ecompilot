import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingService } from './scraping.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ScrapingService', () => {
  let service: ScrapingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrapingService],
    }).compile();

    service = module.get<ScrapingService>(ScrapingService);
  });

  it('should scrape title and price using Shopify-specific selectors', async () => {
    const mockHtml = `
      <html>
        <head>
          <meta property="og:title" content="iPhone 15 Case" />
        </head>
        <body>
          <h1 class="product-single__title">iPhone 15 Case - Premium</h1>
          <span class="price-item--regular">120,50 TND</span>
          <img src="//cdn.shopify.com/image.jpg" />
        </body>
      </html>
    `;

    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    const result = await service.scrapeProduct('https://myshop.com/product');

    // Should favor og:title but falls back gracefully
    expect(result.title).toBe('iPhone 15 Case');
    expect(result.price).toBe(120.5);
    expect(result.images).toContain('https://cdn.shopify.com/image.jpg');
  });

  it('should handle numeric prices with thousands separators', async () => {
    const mockHtml = `<html><body><div class="price">1 500,00 DT</div></body></html>`;
    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    const result = await service.scrapeProduct('https://test.com');
    console.log('DEBUG: Scraped Price:', result.price);
    expect(result.price).toBe(1500.0);
  });
});
