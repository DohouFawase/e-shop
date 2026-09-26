import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import { toggleFavoriteSchema, type ToggleFavoriteInput } from "@/schema/favorites/FavoriteSchema";
import { favoriteService } from "@/services/favorites/favoriteService";
import type { Favorite } from "@/types/shop";
import { getApiErrorMessage } from "@/lib/api-error";

const readError = (error: unknown) =>
  getApiErrorMessage(error, "Une erreur est survenue avec les favoris.");

export const fetchFavorites = createAsyncThunk<Favorite[], void, { rejectValue: string }>(
  "favorites/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return (await favoriteService.list()).favorites;
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export interface ToggleFavoriteResult {
  productId: string;
  favorited: boolean;
}

export const toggleFavorite = createAsyncThunk<
  ToggleFavoriteResult,
  ToggleFavoriteInput,
  { rejectValue: string }
>("favorites/toggle", async (values, { rejectWithValue }) => {
  try {
    const input = toggleFavoriteSchema.parse(values);
    const response = await favoriteService.toggle(input);
    return { productId: input.product_id, favorited: response.favorited };
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

interface FavoriteState {
  items: Favorite[];
  productIds: string[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: FavoriteState = {
  items: [],
  productIds: [],
  status: "idle",
  error: null,
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavoritesError(state) {
      state.error = null;
    },
    setFavorites(state, action: PayloadAction<Favorite[]>) {
      state.items = action.payload;
      state.productIds = action.payload.map((favorite) => favorite.product_id);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
        state.productIds = action.payload.map((favorite) => favorite.product_id);
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { productId, favorited } = action.payload;
        if (favorited && !state.productIds.includes(productId)) {
          state.productIds.push(productId);
        } else if (!favorited) {
          state.productIds = state.productIds.filter((id) => id !== productId);
          state.items = state.items.filter((favorite) => favorite.product_id !== productId);
        }
      })
      .addMatcher(isAnyOf(fetchFavorites.pending, toggleFavorite.pending), (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addMatcher(isAnyOf(fetchFavorites.fulfilled, toggleFavorite.fulfilled), (state) => {
        state.status = "succeeded";
      })
      .addMatcher(isAnyOf(fetchFavorites.rejected, toggleFavorite.rejected), (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { clearFavoritesError, setFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
