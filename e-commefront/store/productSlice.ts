import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";

import {
  productService,
  type ProductsResponse,
} from "@/services/products/productService";
import {
  createProductSchema,
  productFiltersSchema,
  updateProductSchema,
  type CreateProductInput,
  type ProductFilters,
  type UpdateProductInput,
} from "@/schema/products/ProductSchema";
import type { PaginatedResponse, Product } from "@/types/catalog";
import { getApiErrorMessage } from "@/lib/api-error";

export interface UpdateProductArgs {
  id: string;
  values: UpdateProductInput;
}

const readError = (error: unknown) =>
  getApiErrorMessage(error, "Une erreur est survenue avec les produits.");

export const fetchProducts = createAsyncThunk<
  PaginatedResponse<Product>,
  ProductFilters | undefined,
  { rejectValue: string }
>("products/fetchAll", async (filters, { rejectWithValue }) => {
  try {
    return await productService.list(productFiltersSchema.parse(filters ?? {}));
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const fetchManagedProducts = createAsyncThunk<
  PaginatedResponse<Product>,
  ProductFilters | undefined,
  { rejectValue: string }
>("products/fetchManaged", async (filters, { rejectWithValue }) => {
  try {
    return await productService.manage(productFiltersSchema.parse(filters ?? {}));
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const fetchProductById = createAsyncThunk<Product, string, { rejectValue: string }>(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await productService.getById(id);
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

function createFeaturedThunk(
  type: "newArrivals" | "bestSellers" | "latest",
  request: () => Promise<ProductsResponse>,
) {
  return createAsyncThunk<Product[], void, { rejectValue: string }>(
    `products/${type}`,
    async (_, { rejectWithValue }) => {
      try {
        const response = await request();
        return response.products;
      } catch (error) {
        return rejectWithValue(readError(error));
      }
    },
  );
}

export const fetchNewArrivals = createFeaturedThunk(
  "newArrivals",
  () => productService.newArrivals(),
);
export const fetchBestSellers = createFeaturedThunk(
  "bestSellers",
  () => productService.bestSellers(),
);
export const fetchLatestProducts = createFeaturedThunk(
  "latest",
  () => productService.latest(),
);

export const createProduct = createAsyncThunk<
  Product,
  CreateProductInput,
  { rejectValue: string }
>("products/create", async (values, { rejectWithValue }) => {
  try {
    return (await productService.create(createProductSchema.parse(values))).product;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  UpdateProductArgs,
  { rejectValue: string }
>("products/update", async ({ id, values }, { rejectWithValue }) => {
  try {
    const productId = z.string().uuid().parse(id);
    return (
      await productService.update(productId, updateProductSchema.parse(values))
    ).product;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const deleteProduct = createAsyncThunk<string, string, { rejectValue: string }>(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      const productId = z.string().uuid().parse(id);
      await productService.delete(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const deleteAllProducts = createAsyncThunk<void, void, { rejectValue: string }>(
  "products/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      await productService.deleteAll();
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface ProductState {
  items: Product[];
  selected: Product | null;
  newArrivals: Product[];
  bestSellers: Product[];
  latest: Product[];
  pagination: PaginatedResponse<Product> | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selected: null,
  newArrivals: [],
  bestSellers: [],
  latest: [],
  pagination: null,
  status: "idle",
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selected = null;
    },
    clearProductsError(state) {
      state.error = null;
    },
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = Array.isArray(action.payload?.data) ? action.payload.data : [];
        state.pagination = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(fetchManagedProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchManagedProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = Array.isArray(action.payload?.data) ? action.payload.data : [];
        state.pagination = action.payload;
      })
      .addCase(fetchManagedProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLatestProducts.fulfilled, (state, action) => {
        state.latest = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.items = state.items.map((product) =>
          product.id === action.payload.id ? action.payload : product,
        );
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((product) => product.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deleteAllProducts.fulfilled, (state) => {
        state.items = [];
        state.selected = null;
        state.pagination = null;
      })
      .addMatcher(
        isAnyOf(
          fetchProductById.pending,
          fetchNewArrivals.pending,
          fetchBestSellers.pending,
          fetchLatestProducts.pending,
          createProduct.pending,
          updateProduct.pending,
          deleteProduct.pending,
          deleteAllProducts.pending,
        ),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchProductById.fulfilled,
          fetchNewArrivals.fulfilled,
          fetchBestSellers.fulfilled,
          fetchLatestProducts.fulfilled,
          createProduct.fulfilled,
          updateProduct.fulfilled,
          deleteProduct.fulfilled,
          deleteAllProducts.fulfilled,
        ),
        (state) => {
          state.status = "succeeded";
        },
      )
      .addMatcher(
        isAnyOf(
          fetchProductById.rejected,
          fetchNewArrivals.rejected,
          fetchBestSellers.rejected,
          fetchLatestProducts.rejected,
          createProduct.rejected,
          updateProduct.rejected,
          deleteProduct.rejected,
          deleteAllProducts.rejected,
        ),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload ?? action.error.message ?? null;
        },
      );
  },
});

export const {
  clearSelectedProduct,
  clearProductsError,
  setProducts,
} = productSlice.actions;
export default productSlice.reducer;
