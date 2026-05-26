
export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  category: string;
  material: string;
  supplier: string;
  description: string;
  costPrice: number;
  marketPrice: number;
  stock: number;
  image: string;
  status: ProductStatus;
  sku: string;
}

export interface ActivityLog {
  id: string;
  productName: string;
  action: string;
  amount?: string;
  time: string;
  type: 'inventory' | 'price' | 'alert';
}

export interface LandscapeShowcaseConfig {
  id: string;
  title: string;
  description: string;
  image: string;
  productIds: string[];
  updatedAt: string;
}
