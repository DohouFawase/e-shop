import { api } from "@/config/config";

export interface AdminNotification {
  id: string;
  type: string;
  data: {
    order_id?: string;
    customer_name?: string;
    total?: number | string;
    message?: string;
    url?: string;
    review_id?: string;
    product_id?: string;
    rating?: number;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedNotifications {
  data: AdminNotification[];
}

export const notificationService = {
  async list(): Promise<AdminNotification[]> {
    const { data } = await api.get<PaginatedNotifications>("/notifications");
    return data.data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ unread_count: number }>(
      "/notifications/unread-count",
    );
    return data.unread_count;
  },

  async markRead(id: string): Promise<void> {
    await api.put(`/notifications/${encodeURIComponent(id)}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.put("/notifications/read-all");
  },
};
