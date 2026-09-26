import { api } from "@/config/config";

export type DashboardPeriod = "day" | "week" | "month";
export interface DashboardStats {
  period: DashboardPeriod;
  summary: {
    customers_total: number;
    products_active: number;
    orders_period: number;
    revenue_period: number;
    average_order_value: number;
    customers_new_period: number;
    visits_period: number;
    page_views_period: number;
    conversions_period: number;
    conversion_rate: number;
  };
  previous: {
    customers_new_period: number;
    orders_period: number;
    revenue_period: number;
    visits_period: number;
    conversions_period: number;
    conversion_rate: number;
  };
  top_products: Array<{ product_id: string; product_name: string; units_sold: number; revenue: number }>;
  low_stock_products: Array<{ id: string; name: string; stock_quantity: number; category?: { name: string } }>;
  series: Array<{ label: string; customers: number; orders: number; revenue: number; visits: number; page_views: number; conversions: number; conversion_rate: number }>;
  statuses: Record<string, number>;
  recent_orders: Array<{
    id: string;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    total: number | string;
    created_at: string;
    items_count: number;
    user?: { first_name: string; last_name: string; email: string };
  }>;
}

export const dashboardService = {
  async stats(period: DashboardPeriod): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>("/dashboard/stats", { params: { period } });
    return data;
  },
};
