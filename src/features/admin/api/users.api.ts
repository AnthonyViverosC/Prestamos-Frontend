import api from "@/shared/lib/axios";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginatedUsers {
  data: AdminUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  per_page?: number;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: string;
}

export interface AdminResetPasswordPayload {
  password: string;
  password_confirmation: string;
}

export const adminUsersApi = {
  list: async (filters: UserFilters = {}): Promise<PaginatedUsers> => {
    const response = await api.get("/admin/users", { params: filters });
    return response.data;
  },

  update: async (id: number, data: UpdateUserPayload) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data as { message: string; user: AdminUser };
  },

  destroy: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data as { message: string };
  },

  resetPassword: async (id: number, data: AdminResetPasswordPayload) => {
    const response = await api.put(`/admin/users/${id}/password`, data);
    return response.data as { message: string };
  },
};
