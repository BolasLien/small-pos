export const PAYMENT_METHODS = ['現金', 'Line Pay', '街口支付', '轉帳', '其他'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type CartItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type MarketInfo = {
  name: string;
  location: string;
};

export type SaleRecord = {
  id: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  items: CartItem[];
  marketName?: string;
  marketLocation?: string;
};
