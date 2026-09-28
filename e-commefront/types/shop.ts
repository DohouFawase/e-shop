import type { Category, PaginatedResponse, Product } from "@/types/catalog";

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  subtotal: number | string;
  product: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number | string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  product: Product & { category?: Category };
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_item_id: string;
  rating: number;
  comment: string | null;
  user?: { id: string; first_name: string; last_name: string; email?: string };
  product?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number | string;
  quantity: number;
  subtotal: number | string;
  product?: { id: string; images?: string[] | string | null } | null;
}

export interface Order {
  id: string;
  user_id: string;
  user?: { id: string; first_name: string; last_name: string; email?: string };
  status: OrderStatus;
  payment_method?: 'cash_on_delivery' | 'cinetpay' | 'paystack';
  payment_status?: 'unpaid' | 'pending' | 'paid' | 'failed';
  payment_provider?: string | null;
  payment_reference?: string | null;
  paid_at?: string | null;
  total: number | string;
  shipping_address: string;
  phone: string;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export type OrderList = PaginatedResponse<Order>;

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  location?: string | null;
  timezone?: string | null;
  email_verified_at?: string | null;
}
