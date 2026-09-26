import { api } from "@/config/config";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/schema/categories/CategorySchema";
import type { Category } from "@/types/catalog";

export interface CategoryResponse {
  message?: string;
  category: Category;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ApiMessageResponse {
  message: string;
}

function categoryFormData(values: CreateCategoryInput | UpdateCategoryInput) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;

    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else if (value === null) {
      formData.append(key, "");
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}

function hasCategoryFile(values: CreateCategoryInput | UpdateCategoryInput) {
  return typeof File !== "undefined" && values.image instanceof File;
}

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<CategoriesResponse | Category[]>("/categories");
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.categories) ? data.categories : [];
  },

  async getById(id: string): Promise<Category> {
    const { data } = await api.get<{ category: Category }>(
      `/categories/${encodeURIComponent(id)}`,
    );
    return data.category;
  },

  async create(values: CreateCategoryInput): Promise<CategoryResponse> {
    const payload = hasCategoryFile(values) ? categoryFormData(values) : values;
    const { data } = await api.post<CategoryResponse>("/categories", payload);
    return data;
  },

  async update(id: string, values: UpdateCategoryInput): Promise<CategoryResponse> {
    const url = `/categories/${encodeURIComponent(id)}`;

    if (hasCategoryFile(values)) {
      const payload = categoryFormData(values);
      payload.append("_method", "PUT");
      const { data } = await api.post<CategoryResponse>(url, payload);
      return data;
    }

    const { data } = await api.put<CategoryResponse>(url, values);
    return data;
  },

  async delete(id: string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/categories/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async deleteAll(): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>("/categories/all");
    return data;
  },
};
