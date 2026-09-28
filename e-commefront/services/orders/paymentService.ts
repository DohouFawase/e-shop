import { api } from "@/config/config";
import type { Order } from "@/types/shop";

type PaymentResult = { status: "paid" | "pending" | "failed"; order: Order };
type PaymentLink = { payment?: { authorization_url: string; reference: string }; payment_status?: "paid" };

export const paymentService = {
  async verify(reference: string): Promise<PaymentResult> {
    const { data } = await api.post<PaymentResult>("/payments/verify", { reference });
    return data;
  },

  async retry(orderId: string): Promise<PaymentLink> {
    const { data } = await api.post<PaymentLink>(`/orders/${encodeURIComponent(orderId)}/payment/retry`);
    return data;
  },
};
