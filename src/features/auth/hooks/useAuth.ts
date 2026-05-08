import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  authApi,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from "../api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { LoginForm, RegisterForm } from "@/shared/types/auth.types";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginForm) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
      toast.success(`Bienvenido, ${response.user.name}`);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Credenciales incorrectas";
      toast.error(message);
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterForm) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
      toast.success("Cuenta creada correctamente");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Error al crear la cuenta";
      toast.error(message);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      navigate("/login");
    },
    onError: () => {
      logout();
      navigate("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) => authApi.forgotPassword(data),
    onSuccess: (response) => {
      toast.success(response.message);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "No fue posible enviar el correo. Intenta nuevamente.";
      toast.error(message);
    },
  });
}

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => authApi.resetPassword(data),
    onSuccess: (response) => {
      toast.success(response.message);
      navigate("/login");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "No fue posible restablecer la contraseña.";
      toast.error(message);
    },
  });
}

export function useUpdateProfile() {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => authApi.updateProfile(data),
    onSuccess: (response) => {
      setUser(response.user);
      toast.success(response.message);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "No fue posible actualizar el perfil.";
      toast.error(message);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => authApi.changePassword(data),
    onSuccess: (response) => {
      toast.success(response.message);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "No fue posible cambiar la contraseña.";
      toast.error(message);
    },
  });
}
