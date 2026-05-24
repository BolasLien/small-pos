export const PRODUCT_CATEGORIES = ['耳環', '戒指', '手鍊', '項鍊', '其他'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  isActive: boolean;
};

export type ProductDraft = Omit<Product, 'id'>;
