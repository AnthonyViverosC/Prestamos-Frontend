import api from "@/shared/lib/axios";
import {
  Client,
  ClientFilters,
  ClientForm,
  PaginatedResponse,
} from "@/shared/types/client.types";

export const clientsApi = {
  getAll: async (
    filters: ClientFilters,
  ): Promise<PaginatedResponse<Client>> => {
    const response = await api.get("/clients", { params: filters });
    return response.data;
  },

  getOne: async (id: number): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data: Omit<ClientForm, "status">): Promise<Client> => {
    const response = await api.post("/clients", data);
    return response.data;
  },

  update: async (id: number, data: Partial<ClientForm>): Promise<Client> => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};
