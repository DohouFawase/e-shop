import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";

import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/schema/categories/CategorySchema";
import { categoryService } from "@/services/categories/categoryService";
import type { Category } from "@/types/catalog";
import { getApiErrorMessage } from "@/lib/api-error";

export interface UpdateCategoryArgs {
  id: string;
  values: UpdateCategoryInput;
}

const readError = (error: unknown) =>
  getApiErrorMessage(error, "Une erreur est survenue avec les catégories.");

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await categoryService.list();
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const fetchCategoryById = createAsyncThunk<
  Category,
  string,
  { rejectValue: string }
>("categories/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await categoryService.getById(z.string().uuid().parse(id));
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryInput,
  { rejectValue: string }
>("categories/create", async (values, { rejectWithValue }) => {
  try {
    return (await categoryService.create(createCategorySchema.parse(values))).category;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  UpdateCategoryArgs,
  { rejectValue: string }
>("categories/update", async ({ id, values }, { rejectWithValue }) => {
  try {
    const categoryId = z.string().uuid().parse(id);
    return (
      await categoryService.update(categoryId, updateCategorySchema.parse(values))
    ).category;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("categories/delete", async (id, { rejectWithValue }) => {
  try {
    const categoryId = z.string().uuid().parse(id);
    await categoryService.delete(categoryId);
    return categoryId;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const deleteAllCategories = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("categories/deleteAll", async (_, { rejectWithValue }) => {
  try {
    await categoryService.deleteAll();
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface CategoryState {
  items: Category[];
  selected: Category | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  selected: null,
  status: "idle",
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearSelectedCategory(state) {
      state.selected = null;
    },
    clearCategoriesError(state) {
      state.error = null;
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.items = state.items.map((category) =>
          category.id === action.payload.id ? action.payload : category,
        );
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((category) => category.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deleteAllCategories.fulfilled, (state) => {
        state.items = [];
        state.selected = null;
      })
      .addMatcher(
        isAnyOf(
          fetchCategoryById.pending,
          createCategory.pending,
          updateCategory.pending,
          deleteCategory.pending,
          deleteAllCategories.pending,
        ),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchCategoryById.fulfilled,
          createCategory.fulfilled,
          updateCategory.fulfilled,
          deleteCategory.fulfilled,
          deleteAllCategories.fulfilled,
        ),
        (state) => {
          state.status = "succeeded";
        },
      )
      .addMatcher(
        isAnyOf(
          fetchCategoryById.rejected,
          createCategory.rejected,
          updateCategory.rejected,
          deleteCategory.rejected,
          deleteAllCategories.rejected,
        ),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload ?? action.error.message ?? null;
        },
      );
  },
});

export const {
  clearSelectedCategory,
  clearCategoriesError,
  setCategories,
} = categorySlice.actions;
export default categorySlice.reducer;
