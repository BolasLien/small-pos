import { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { ProductForm } from '../features/products/components/ProductForm';
import { ProductListItem } from '../features/products/components/ProductListItem';
import type { Product, ProductDraft } from '../features/products/types';

export const ProductsPage = () => {
  const { productsApi } = useAppContext();
  const { products, addProduct, updateProduct, deleteProduct } = productsApi;

  const [editing, setEditing] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (draft: ProductDraft) => {
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">商品</h1>
          <p className="text-xs text-gray-500">共 {products.length} 項</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + 新增
        </button>
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
    </div>
  );
};
