import { api } from "@/config/config";
import type { ContactMessageInput } from "@/schema/contact/ContactSchema";

export interface ContactMessageResponse {
  message: string;
}

export const contactService = {
  async send(values: ContactMessageInput): Promise<ContactMessageResponse> {
    const { data } = await api.post<ContactMessageResponse>("/contact", values);
    return data;
  },
};
