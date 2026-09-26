import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";

import {
  createOrderSchema,
  orderFiltersSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type OrderFilters,
  type UpdateOrderStatusInput,
} from "@/schema/orders/OrderSchema";
import { orderService } from "@/services/orders/orderService";
import type { Order, OrderList } from "@/types/shop";
import { getApiErrorMessage } from "@/lib/api-error";

export interface UpdateOrderStatusArgs {
  id: string;
  values: UpdateOrderStatusInput;
}

const readError = (error: unknown) =>
  getApiErrorMessage(error, "Une erreur est survenue avec les commandes.");

export const createOrder = createAsyncThunk<Order, CreateOrderInput, { rejectValue: string }>(
  "orders/create",
  async (values, { rejectWithValue }) => {
    try {
      return (await orderService.create(createOrderSchema.parse(values))).order;
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const fetchMyOrders = createAsyncThunk<OrderList, void, { rejectValue: string }>(
  "orders/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.myOrders();
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const fetchAdminOrders = createAsyncThunk<
  OrderList,
  OrderFilters | undefined,
  { rejectValue: string }
>("orders/fetchAdmin", async (filters, { rejectWithValue }) => {
  try {
    return await orderService.adminList(orderFiltersSchema.parse(filters ?? {}));
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const fetchOrderById = createAsyncThunk<Order, string, { rejectValue: string }>(
  "orders/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.getById(z.string().uuid().parse(id));
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const cancelOrder = createAsyncThunk<Order, string, { rejectValue: string }>(
  "orders/cancel",
  async (id, { rejectWithValue }) => {
    try {
      return (await orderService.cancel(z.string().uuid().parse(id))).order;
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const updateOrderStatus = createAsyncThunk<
  Order,
  UpdateOrderStatusArgs,
  { rejectValue: string }
>("orders/updateStatus", async ({ id, values }, { rejectWithValue }) => {
  try {
    return (
      await orderService.updateStatus(
        z.string().uuid().parse(id),
        updateOrderStatusSchema.parse(values),
      )
    ).order;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

interface OrderState {
  myOrders: Order[];
  adminOrders: Order[];
  selected: Order | null;
  myPagination: OrderList | null;
  adminPagination: OrderList | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: OrderState = {
  myOrders: [],
  adminOrders: [],
  selected: null,
  myPagination: null,
  adminPagination: null,
  status: "idle",
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrdersError(state) {
      state.error = null;
    },
    setSelectedOrder(state, action: PayloadAction<Order | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.myOrders = [action.payload, ...state.myOrders];
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload.data;
        state.myPagination = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminOrders = action.payload.data;
        state.adminPagination = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.myOrders = state.myOrders.map((order) =>
          order.id === action.payload.id ? action.payload : order,
        );
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.adminOrders = state.adminOrders.map((order) =>
          order.id === action.payload.id ? action.payload : order,
        );
        state.myOrders = state.myOrders.map((order) =>
          order.id === action.payload.id ? action.payload : order,
        );
      })
      .addMatcher(
        isAnyOf(
          createOrder.pending,
          fetchMyOrders.pending,
          fetchAdminOrders.pending,
          fetchOrderById.pending,
          cancelOrder.pending,
          updateOrderStatus.pending,
        ),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          createOrder.fulfilled,
          fetchMyOrders.fulfilled,
          fetchAdminOrders.fulfilled,
          fetchOrderById.fulfilled,
          cancelOrder.fulfilled,
          updateOrderStatus.fulfilled,
        ),
        (state) => {
          state.status = "succeeded";
        },
      )
      .addMatcher(
        isAnyOf(
          createOrder.rejected,
          fetchMyOrders.rejected,
          fetchAdminOrders.rejected,
          fetchOrderById.rejected,
          cancelOrder.rejected,
          updateOrderStatus.rejected,
        ),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload ?? action.error.message ?? null;
        },
      );
  },
});

export const { clearOrdersError, setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
