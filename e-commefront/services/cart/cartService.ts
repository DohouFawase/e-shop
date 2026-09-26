import { api } from "@/config/config";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "@/schema/cart/CartSchema";
import type { Cart } from "@/types/shop";

export interface CartResponse {
  message?: string;
  cart: Cart;
}

export interface MessageResponse {
  message: string;
}

export const cartService = {
  async get(): Promise<Cart> {
    const { data } = await api.get<{ cart: Cart }>("/cart");
    return data.cart;
  },

  async addItem(values: AddCartItemInput): Promise<CartResponse> {
    const { data } = await api.post<CartResponse>("/cart/items", values);
    return data;
  },

  async updateItem(
    productId: string,
    values: UpdateCartItemInput,
  ): Promise<CartResponse> {
    const { data } = await api.put<CartResponse>(
      `/cart/items/${encodeURIComponent(productId)}`,
      values,
    );
    return data;
  },

  async removeItem(productId: string): Promise<CartResponse> {
    const { data } = await api.delete<CartResponse>(
      `/cart/items/${encodeURIComponent(productId)}`,
    );
    return data;
  },

  async clear(): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>("/cart");
    return data;
  },
};
