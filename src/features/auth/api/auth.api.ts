import api from "@/shared/lib/axios";
import {
  LoginForm,
  RegisterForm,
  AuthResponse,
} from "@/shared/types/auth.types";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: { id: number; name: string; email: string; role: string };
}

export interface MessageResponse {
  message: string;
}

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

  forgotPassword: async (
    data: ForgotPasswordPayload,
  ): Promise<MessageResponse> => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordPayload,
  ): Promise<MessageResponse> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfilePayload,
  ): Promise<UpdateProfileResponse> => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordPayload,
  ): Promise<MessageResponse> => {
    const response = await api.put("/auth/password", data);
    return response.data;
  },
};
