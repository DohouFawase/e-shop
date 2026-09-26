import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";

import { addCartItemSchema, updateCartItemSchema, type AddCartItemInput, type UpdateCartItemInput } from "@/schema/cart/CartSchema";
import { cartService } from "@/services/cart/cartService";
import type { Cart } from "@/types/shop";
import { getApiErrorMessage } from "@/lib/api-error";

export interface UpdateCartItemArgs {
  productId: string;
  values: UpdateCartItemInput;
}

const readError = (error: unknown) =>
  getApiErrorMessage(error, "Une erreur est survenue avec le panier.");

export const fetchCart = createAsyncThunk<Cart, void, { rejectValue: string }>(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.get();
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const addCartItem = createAsyncThunk<Cart, AddCartItemInput, { rejectValue: string }>(
  "cart/addItem",
  async (values, { rejectWithValue }) => {
    try {
      const input = addCartItemSchema.parse(values);
      return (await cartService.addItem(input)).cart;
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const updateCartItem = createAsyncThunk<Cart, UpdateCartItemArgs, { rejectValue: string }>(
  "cart/updateItem",
  async ({ productId, values }, { rejectWithValue }) => {
    try {
      const id = z.string().uuid().parse(productId);
      return (await cartService.updateItem(id, updateCartItemSchema.parse(values))).cart;
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const removeCartItem = createAsyncThunk<Cart, string, { rejectValue: string }>(
  "cart/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      return (await cartService.removeItem(z.string().uuid().parse(productId))).cart;
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const clearCart = createAsyncThunk<void, void, { rejectValue: string }>(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clear();
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

interface CartState {
  cart: Cart | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CartState = { cart: null, status: "idle", error: null };
const requests = [fetchCart, addCartItem, updateCartItem, removeCartItem, clearCart];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError(state) {
      state.error = null;
    },
    setCart(state, action: PayloadAction<Cart>) {
      state.cart = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        if (state.cart) {
          state.cart.items = [];
          state.cart.total = 0;
        }
      })
      .addMatcher(isAnyOf(...requests.map((request) => request.pending)), (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addMatcher(isAnyOf(...requests.map((request) => request.fulfilled)), (state) => {
        state.status = "succeeded";
      })
      .addMatcher(isAnyOf(...requests.map((request) => request.rejected)), (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { clearCartError, setCart } = cartSlice.actions;
export default cartSlice.reducer;
