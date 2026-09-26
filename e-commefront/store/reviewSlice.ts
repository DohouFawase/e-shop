import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";

import { createReviewSchema, type CreateReviewInput } from "@/schema/reviews/ReviewSchema";
import { reviewService } from "@/services/reviews/reviewService";
import type { Review } from "@/types/shop";
import { getApiErrorMessage } from "@/lib/api-error";

const readError = (error: unknown) =>
  getApiErrorMessage(error, "Une erreur est survenue avec les avis.");

export const fetchProductReviews = createAsyncThunk<
  { productId: string; reviews: Review[] },
  string,
  { rejectValue: string }
>("reviews/fetchForProduct", async (productId, { rejectWithValue }) => {
  try {
    const id = z.string().uuid().parse(productId);
    const response = await reviewService.listForProduct(id);
    return { productId: id, reviews: response.reviews };
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const createReview = createAsyncThunk<
  Review,
  CreateReviewInput,
  { rejectValue: string }
>("reviews/create", async (values, { rejectWithValue }) => {
  try {
    const response = await reviewService.create(createReviewSchema.parse(values));
    return response.review;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

interface ReviewState {
  byProductId: Record<string, Review[]>;
  activeProductId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ReviewState = {
  byProductId: {},
  activeProductId: null,
  status: "idle",
  error: null,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewsError(state) {
      state.error = null;
    },
    setActiveProductReviews(
      state,
      action: PayloadAction<{ productId: string; reviews: Review[] }>,
    ) {
      state.activeProductId = action.payload.productId;
      state.byProductId[action.payload.productId] = action.payload.reviews;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProductReviews.pending, (state, action) => {
        state.activeProductId = action.meta.arg;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.activeProductId = action.payload.productId;
        state.byProductId[action.payload.productId] = action.payload.reviews;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        const productId = action.payload.product_id;
        state.byProductId[productId] = [
          action.payload,
          ...(state.byProductId[productId] ?? []),
        ];
      })
      .addMatcher(isAnyOf(fetchProductReviews.pending, createReview.pending), (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addMatcher(isAnyOf(fetchProductReviews.fulfilled, createReview.fulfilled), (state) => {
        state.status = "succeeded";
      })
      .addMatcher(isAnyOf(fetchProductReviews.rejected, createReview.rejected), (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { clearReviewsError, setActiveProductReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
