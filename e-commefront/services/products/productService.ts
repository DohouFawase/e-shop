import { api } from "@/config/config";
import type {
  CreateProductInput,
  ProductFilters,
  UpdateProductInput,
} from "@/schema/products/ProductSchema";
import type { PaginatedResponse, Product } from "@/types/catalog";

export interface ProductResponse {
  message?: string;
  product: Product;
}

export interface ProductsResponse {
  products: Product[];
  message: string | null;
}

export interface ApiMessageResponse {
  message: string;
}

function productFormData(values: CreateProductInput | UpdateProductInput) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;

    if (key === "images" && Array.isArray(value)) {
      value.forEach((file) => formData.append("images[]", file));
    } else if (typeof value === "boolean") {
      // Laravel's boolean validation accepts 1/0 in multipart form data,
      // but rejects the strings "true" and "false".
      formData.append(key, value ? "1" : "0");
    } else if (value === null) {
      formData.append(key, "");
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}

function hasProductFiles(values: CreateProductInput | UpdateProductInput) {
  return Array.isArray(values.images) && values.images.length > 0;
}

export const productService = {
  async list(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<PaginatedResponse<Product>>("/products", {
      params: filters,
    });
    return data;
  },

  async manage(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<PaginatedResponse<Product>>("/products/manage", {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<{ product: Product }>(
      `/products/${encodeURIComponent(id)}`,
    );
    return data.product;
  },

  async newArrivals(): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>("/products/new-arrivals");
    return data;
  },

  async bestSellers(): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>("/products/best-sellers");
    return data;
  },

  async latest(): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>("/products/latest");
    return data;
  },

  async create(values: CreateProductInput): Promise<ProductResponse> {
    // Le formulaire conserve `images: []` quand aucune image n’est choisie.
    // Omettre ce champ évite d’enregistrer un tableau JSON vide côté Laravel.
    const { images: _images, ...withoutImages } = values;
    const payload = hasProductFiles(values)
      ? productFormData(values)
      : withoutImages;
    const { data } = await api.post<ProductResponse>("/products", payload);
    return data;
  },

  async update(id: string, values: UpdateProductInput): Promise<ProductResponse> {
    const url = `/products/${encodeURIComponent(id)}`;

    if (hasProductFiles(values)) {
      const payload = productFormData(values);
      payload.append("_method", "PUT");
      const { data } = await api.post<ProductResponse>(url, payload);
      return data;
    }

    const { data } = await api.put<ProductResponse>(url, values);
    return data;
  },

  async delete(id: string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/products/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async deleteAll(): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>("/products/all");
    return data;
  },
};
