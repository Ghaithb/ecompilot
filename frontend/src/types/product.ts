export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  attributes: Record<string, string>;
  cost?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  categories: string[];
  tags: string[];
  images: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}