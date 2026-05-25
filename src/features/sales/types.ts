export const PAYMENT_METHODS = ['現金', 'Line Pay', '街口支付', '轉帳', '其他'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type CartItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type Channel = {
  id: string;
  name: string;
  location?: string;
};

export type ChannelDraft = Omit<Channel, 'id'>;

export type SaleRecord = {
  id: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  items: CartItem[];
  channelName?: string;
  channelLocation?: string;
  note?: string;
};

export const formatChannelLabel = (name?: string, location?: string): string => {
  if (!name && !location) return '';
  if (!location) return name ?? '';
  if (!name) return location;
  return `${name} ・ ${location}`;
};
