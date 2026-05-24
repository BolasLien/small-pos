import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../../../utils/storage';
import { createId } from '../../../utils/id';
import type { Product, ProductDraft, ProductSeries } from '../types';

const STORAGE_KEY = 'small-pos:products';
const SEEDED_FLAG = 'small-pos:products:seeded';

const SEED_PRODUCTS: Product[] = [
  { id: 'seed-1', name: '珍珠耳環', series: '耳環', price: 280, stock: 10, isActive: true },
  { id: 'seed-2', name: '銀色戒指', series: '戒指', price: 350, stock: 6, isActive: true },
  { id: 'seed-3', name: '編織手鍊', series: '手鍊', price: 180, stock: 12, isActive: true },
  { id: 'seed-4', name: '迷你項鍊', series: '項鍊', price: 420, stock: 5, isActive: true },
];

type LegacyProduct = Omit<Product, 'series'> & {
  series?: ProductSeries;
  category?: ProductSeries;
};

const loadInitial = (): Product[] => {
  const seeded = readStorage<boolean>(SEEDED_FLAG, false);
  if (!seeded) {
    writeStorage(STORAGE_KEY, SEED_PRODUCTS);
    writeStorage(SEEDED_FLAG, true);
    return SEED_PRODUCTS;
  }
  const raw = readStorage<LegacyProduct[]>(STORAGE_KEY, []);
  return raw.map(({ category, series, ...rest }) => ({
    ...rest,
    series: series ?? category ?? '其他',
  }));
};

export type UseProductsResult = {
  products: Product[];
  addProduct: (draft: ProductDraft) => void;
  updateProduct: (id: string, draft: ProductDraft) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
};

export const useProducts = (): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>(() => loadInitial());

  useEffect(() => {
    writeStorage(STORAGE_KEY, products);
  }, [products]);

  const addProduct = useCallback((draft: ProductDraft) => {
    setProducts((prev) => [...prev, { ...draft, id: createId() }]);
  }, []);

  const updateProduct = useCallback((id: string, draft: ProductDraft) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...draft, id } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const adjustStock = useCallback((id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    );
  }, []);

  return { products, addProduct, updateProduct, deleteProduct, adjustStock };
};
