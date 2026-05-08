import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { paymentsApi } from "../api/payments.api";
import { PaymentFilters, PaymentForm } from "@/shared/types/payment.types";

export const paymentKeys = {
  all: ["payments"] as const,
  list: (filters: PaymentFilters) => ["payments", "list", filters] as const,
};

export function usePayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => paymentsApi.getAll(filters),
    staleTime: 1000 * 60,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentForm) => paymentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      qc.invalidateQueries({ queryKey: ["loans"] });
      toast.success("Pago registrado correctamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al registrar el pago",
      );
    },
  });
}
