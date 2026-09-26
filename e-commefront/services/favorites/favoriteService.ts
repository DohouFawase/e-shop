import { api } from "@/config/config";
import type { ToggleFavoriteInput } from "@/schema/favorites/FavoriteSchema";
import type { Favorite } from "@/types/shop";

export interface FavoritesResponse {
  favorites: Favorite[];
  message: string | null;
}

export interface ToggleFavoriteResponse {
  message: string;
  favorited: boolean;
}

export const favoriteService = {
  async list(): Promise<FavoritesResponse> {
    const { data } = await api.get<FavoritesResponse>("/favorites");
    return data;
  },

  async toggle(values: ToggleFavoriteInput): Promise<ToggleFavoriteResponse> {
    const { data } = await api.post<ToggleFavoriteResponse>(
      "/favorites/toggle",
      values,
    );
    return data;
  },
};
