export const DEFAULT_SERIES: string[] = ['耳環', '戒指', '手鍊', '項鍊', '其他'];

export type ProductSeries = string;

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
