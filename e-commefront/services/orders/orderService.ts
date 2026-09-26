import { api } from "@/config/config";
import type {
  CreateOrderInput,
  OrderFilters,
  UpdateOrderStatusInput,
} from "@/schema/orders/OrderSchema";
import type { Order, OrderList } from "@/types/shop";
import { getVisitorId } from "@/services/dashboard/visitorTracking";

export interface OrderResponse {
  message?: string;
  order: Order;
  payment?: { authorization_url: string; reference: string } | null;
  payment_error?: string | null;
}

export interface MessageResponse {
  message: string;
}

export const orderService = {
  async create(values: CreateOrderInput): Promise<OrderResponse> {
    const visitorId = getVisitorId();
    const { data } = await api.post<OrderResponse>("/orders", values, {
      headers: visitorId ? { "X-Visitor-Id": visitorId } : undefined,
    });
    return data;
  },

  async myOrders(): Promise<OrderList> {
    const { data } = await api.get<OrderList>("/my-orders");
    return data;
  },

  async adminList(filters: OrderFilters = {}): Promise<OrderList> {
    const { data } = await api.get<OrderList>("/orders", { params: filters });
    return data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await api.get<{ order: Order }>(
      `/orders/${encodeURIComponent(id)}`,
    );
    return data.order;
  },

  async cancel(id: string): Promise<OrderResponse> {
    const { data } = await api.put<OrderResponse>(
      `/orders/${encodeURIComponent(id)}/cancel`,
    );
    return data;
  },

  async updateStatus(
    id: string,
    values: UpdateOrderStatusInput,
  ): Promise<OrderResponse> {
    const { data } = await api.put<OrderResponse>(
      `/orders/${encodeURIComponent(id)}/status`,
      values,
    );
    return data;
  },
};
