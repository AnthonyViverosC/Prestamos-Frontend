import api from "@/shared/lib/axios";
import {
  LoginForm,
  RegisterForm,
  AuthResponse,
} from "@/shared/types/auth.types";

export const authApi = {
  login: async (data: LoginForm): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterForm): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
