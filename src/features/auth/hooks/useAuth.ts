import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authApi } from "../api/auth.api";
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
