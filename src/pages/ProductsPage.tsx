import { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { ProductForm } from '../features/products/components/ProductForm';
import { ProductListItem } from '../features/products/components/ProductListItem';
import { SeriesManager } from '../features/products/components/SeriesManager';
import type { Product, ProductDraft } from '../features/products/types';

export const ProductsPage = () => {
  const { productsApi, seriesApi } = useAppContext();
  const { products, addProduct, updateProduct, deleteProduct } = productsApi;

  const [editing, setEditing] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSeriesOpen, setIsSeriesOpen] = useState(false);

  const handleSubmit = (draft: ProductDraft) => {
    seriesApi.ensureSeries(draft.series);
    if (editing) {
      updateProduct(editing.id, draft);
    } else {
      addProduct(draft);
    }
    setEditing(null);
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">商品</h1>
          <p className="text-xs text-gray-500">共 {products.length} 項</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsSeriesOpen(true)}
            className="rounded-full border border-indigo-300 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            管理系列
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            + 新增
          </button>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          還沒有商品，點右上「+ 新增」開始
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id}>
              <ProductListItem product={p} onEdit={handleEdit} onDelete={deleteProduct} />
            </li>
          ))}
        </ul>
      )}

      {isFormOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={handleCancel}
          role="presentation"
        >
          <div
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <ProductForm initial={editing} onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>
      )}

      {isSeriesOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setIsSeriesOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <SeriesManager onClose={() => setIsSeriesOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
