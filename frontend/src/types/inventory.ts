export interface InventorySummary {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount?: number;
  // platforms grouping comes from the backend (marketplaces / sales channels)
  platforms?: Array<{
    name: string;
    products: Array<{
      sku: string;
      stock: number;
    }>;
  }>;
}

// Flattened inventory row returned by GET /inventory/items
export interface InventoryItem {
  productId: string;
  title: string;
  category?: string;
  image?: string;
  sku: string;
  variantName: string;
  price: number;
  inventory: number;
  status: 'ok' | 'low' | 'out';
}

export interface InventoryProduct {
  _id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryProductInput {
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  images?: string[];
}