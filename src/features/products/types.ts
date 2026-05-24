export const PRODUCT_SERIES = ['耳環', '戒指', '手鍊', '項鍊', '其他'] as const;

export type ProductSeries = (typeof PRODUCT_SERIES)[number];

export type Product = {
  id: string;
  name: string;
  series: ProductSeries;
  price: number;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
};

export type ProductDraft = Omit<Product, 'id'>;
