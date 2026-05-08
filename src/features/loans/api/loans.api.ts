import api from "@/shared/lib/axios";
import { Loan, LoanFilters, LoanForm } from "@/shared/types/loan.types";
import { PaginatedResponse } from "@/shared/types/client.types";

export const loansApi = {
  getAll: async (filters: LoanFilters): Promise<PaginatedResponse<Loan>> => {
    const response = await api.get("/loans", { params: filters });
    return response.data;
  },

  getOne: async (id: number): Promise<Loan> => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  create: async (data: LoanForm): Promise<Loan> => {
    const response = await api.post("/loans", data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/loans/${id}`);
  },
};
