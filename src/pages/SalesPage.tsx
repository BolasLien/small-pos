import { useMemo, useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { useCart } from '../features/sales/hooks/useCart';
import { useCurrentChannel } from '../features/sales/hooks/useCurrentChannel';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { CartPanel } from '../components/CartPanel/CartPanel';
import { PaymentMethodSelector } from '../features/sales/components/PaymentMethodSelector';
import { SeriesTabs, type SeriesFilter } from '../features/sales/components/SeriesTabs';
import { ChannelPicker } from '../features/sales/components/ChannelPicker';
import { ChannelManager } from '../features/sales/components/ChannelManager';
import type { PaymentMethod } from '../features/sales/types';

export const SalesPage = () => {
  const { productsApi, salesApi, seriesApi, channelsApi } = useAppContext();
  const { products, adjustStock } = productsApi;
  const { addSale } = salesApi;
  const { channels, addChannel } = channelsApi;
  const { currentChannelId, currentChannel, setCurrentChannelId } = useCurrentChannel(channels);
  const { cartItems, totalAmount, addToCart, increase, decrease, remove, clear } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [seriesFilter, setSeriesFilter] = useState<SeriesFilter>(null);
  const [note, setNote] = useState('');
  const [isChannelManagerOpen, setIsChannelManagerOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeProducts = useMemo(() => products.filter((p) => p.isActive), [products]);

  const availableSeries = useMemo<string[]>(() => {
    const present = new Set<string>();
    activeProducts.forEach((p) => present.add(p.series));
    const ordered = seriesApi.seriess.filter((s) => present.has(s));
    const orphans = [...present].filter((s) => !seriesApi.seriess.includes(s));
    return [...ordered, ...orphans];
  }, [activeProducts, seriesApi.seriess]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2000);
  };

  const handleSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const result = addToCart(product);
    if (!result.isAdded && result.reason) {
      showToast('error', result.reason);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0 || !paymentMethod) return;
    addSale(paymentMethod, cartItems, currentChannel, note);
    cartItems.forEach((it) => adjustStock(it.productId, -it.quantity));
    clear();
    setPaymentMethod(null);
    setNote('');
    showToast('success', `已完成交易 $${totalAmount}`);
  };

  const isCheckoutDisabled = cartItems.length === 0 || !paymentMethod;

  return (
    <div className="space-y-4 pb-40">
      <header>
        <h1 className="text-xl font-bold text-gray-900">銷售</h1>
        <p className="text-xs text-gray-500">點商品加入交易，選好支付方式即可結帳</p>
      </header>

      <ChannelPicker
        channels={channels}
        currentId={currentChannelId}
        onSelect={setCurrentChannelId}
        onOpenManager={() => setIsChannelManagerOpen(true)}
        onQuickAdd={addChannel}
      />

      {availableSeries.length > 1 && (
        <SeriesTabs
          seriess={availableSeries}
          value={seriesFilter}
          onChange={setSeriesFilter}
        />
      )}

      {(seriesFilter === null
        ? activeProducts
        : activeProducts.filter((p) => p.series === seriesFilter)
      ).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          {activeProducts.length === 0
            ? '目前沒有上架商品，請至「商品」新增'
            : '此系列目前沒有商品'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(seriesFilter === null
            ? activeProducts
            : activeProducts.filter((p) => p.series === seriesFilter)
          ).map((p) => {
            const cartQuantity = cartItems.find((it) => it.productId === p.id)?.quantity ?? 0;
            return (
              <ProductCard
                key={p.id}
                product={p}
                cartQuantity={cartQuantity}
                onSelect={(prod) => handleSelect(prod.id)}
              />
            );
          })}
        </div>
      )}

      <CartPanel
        cartItems={cartItems}
        totalAmount={totalAmount}
        products={products}
        onIncrease={increase}
        onDecrease={decrease}
        onRemove={remove}
      />

      {cartItems.length > 0 && (
        <>
          <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="sale-note">
              備註（選填）
            </label>
            <textarea
              id="sale-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="例如：客人指定包裝、IG 私訊訂單編號…"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </>
      )}

      <div
        className="fixed inset-x-0 bottom-16 z-20 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">總金額</p>
            <p className="text-2xl font-bold text-gray-900">${totalAmount}</p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isCheckoutDisabled}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            完成交易
          </button>
        </div>
      </div>

      {isChannelManagerOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setIsChannelManagerOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <ChannelManager onClose={() => setIsChannelManagerOpen(false)} />
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed inset-x-0 top-4 z-40 mx-auto w-fit max-w-[90%] rounded-full px-4 py-2 text-sm text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};
