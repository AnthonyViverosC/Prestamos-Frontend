import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Evita que un usuario ya autenticado entre al login
export function GuestRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
