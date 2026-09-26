import { api } from "@/config/config";
import type { CreateReviewInput } from "@/schema/reviews/ReviewSchema";
import type { Review } from "@/types/shop";
import type { PaginatedResponse } from "@/types/catalog";

export interface ReviewsResponse {
  reviews: Review[];
  message: string | null;
}

export interface ReviewResponse {
  message: string;
  review: Review;
}

export const reviewService = {
  async listForProduct(productId: string): Promise<ReviewsResponse> {
    const { data } = await api.get<ReviewsResponse>(
      `/products/${encodeURIComponent(productId)}/reviews`,
    );
    return data;
  },

  async create(values: CreateReviewInput): Promise<ReviewResponse> {
    const { data } = await api.post<ReviewResponse>("/reviews", values);
    return data;
  },

  async adminList(params: { search?: string; rating?: number; per_page?: number; page?: number }): Promise<PaginatedResponse<Review>> {
    const { data } = await api.get<PaginatedResponse<Review>>("/reviews", { params });
    return data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/reviews/${encodeURIComponent(id)}`);
    return data;
  },
};
