import { api } from "@/config/config";

export interface ContactMessageReply {
  id: string;
  contact_message_id: string;
  admin_id: string | null;
  body: string;
  status: "sending" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
  admin?: { id: string; first_name: string; last_name: string; email: string } | null;
}

export interface ContactInboxMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read_at: string | null;
  replies: ContactMessageReply[];
  created_at: string;
  updated_at: string;
}

interface ContactInboxResponse {
  messages: { data: ContactInboxMessage[]; current_page: number; last_page: number; total: number };
  unread_count: number;
}

export const contactInboxService = {
  async list(): Promise<ContactInboxResponse> {
    const { data } = await api.get<ContactInboxResponse>("/dashboard/contact-messages");
    return data;
  },
  async markRead(id: string): Promise<void> {
    await api.post(`/dashboard/contact-messages/${encodeURIComponent(id)}/read`);
  },
  async reply(id: string, body: string): Promise<ContactMessageReply> {
    const { data } = await api.post<{ reply: ContactMessageReply }>(
      `/dashboard/contact-messages/${encodeURIComponent(id)}/replies`,
      { body },
    );
    return data.reply;
  },
};
