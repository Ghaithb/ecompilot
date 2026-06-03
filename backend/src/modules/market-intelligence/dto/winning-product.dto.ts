export class WinningProductDto {
  title: string;
  category: string;
  trendScore: number; // 0-100
  deliveryScore: number; // 0-100
  salesCount: number;
  viewCount: number;
  averagePrice: number;
  topRegions: Array<{ name: string; count: number }>;
  growth?: number; // % change vs previous period
  metadata?: Record<string, any>;
}

export class MarketIntelligenceDashboardDto {
  topProducts: WinningProductDto[];
  trendingCategories: Array<{ name: string; score: number }>;
}
