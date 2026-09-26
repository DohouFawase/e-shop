export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  products?: Product[];
}

export interface Product {
  id: string;
  category_id: string;
  producer_id: string;
  name: string;
  description: string | null;
  price: number | string;
  unit: string;
  stock_quantity: number;
  images: string[] | string | null;
  is_active: boolean;
  discount_price?: number | string | null;
  discount_starts_at?: string | null;
  discount_ends_at?: string | null;
  final_price?: number | string;
  is_on_discount?: boolean;
  average_rating?: number;
  reviews_count?: number;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}
