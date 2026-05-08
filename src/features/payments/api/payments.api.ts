import api from "@/shared/lib/axios";
import {
  Payment,
  PaymentFilters,
  PaymentForm,
} from "@/shared/types/payment.types";
import { PaginatedResponse } from "@/shared/types/client.types";

export const paymentsApi = {
  getAll: async (
    filters: PaymentFilters,
  ): Promise<PaginatedResponse<Payment>> => {
    const response = await api.get("/payments", { params: filters });
    return response.data;
  },

  create: async (data: PaymentForm): Promise<Payment> => {
    const response = await api.post("/payments", data);
    return response.data;
  },
};
