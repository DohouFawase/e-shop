import { api } from "@/config/config";
import type { PaginatedResponse } from "@/types/catalog";

export interface CustomerOrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface CustomerOrder {
  id: string;
  status: string;
  total: number | string;
  created_at: string;
  items: CustomerOrderItem[];
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  email_verified_at: string | null;
  last_login_at: string | null;
  orders_count: number;
  latest_order_status: string | null;
  latest_order_created_at: string | null;
  orders?: CustomerOrder[];
}

export const customerService = {
  async list(params: { search?: string; per_page?: number; page?: number }) {
    const { data } = await api.get<PaginatedResponse<Customer>>("/customers", { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<{ customer: Customer }>(`/customers/${encodeURIComponent(id)}`);
    return data.customer;
  },
};
