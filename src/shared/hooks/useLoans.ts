import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { loansApi } from "@/features/loans/api/loans.api";
import { LoanFilters, LoanForm } from "@/shared/types/loan.types";

export const loanKeys = {
  all: ["loans"] as const,
  list: (filters: LoanFilters) => ["loans", "list", filters] as const,
  detail: (id: number) => ["loans", "detail", id] as const,
};

export function useLoans(filters: LoanFilters) {
  return useQuery({
    queryKey: loanKeys.list(filters),
    queryFn: () => loansApi.getAll(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLoan(id: number | null | undefined) {
  return useQuery({
    queryKey: loanKeys.detail(id ?? 0),
    queryFn: () => loansApi.getOne(id as number),
    enabled: !!id,
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LoanForm) => loansApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanKeys.all });
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Préstamo creado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear préstamo");
    },
  });
}

export function useDeleteLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => loansApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanKeys.all });
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Préstamo eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar préstamo");
    },
  });
}
