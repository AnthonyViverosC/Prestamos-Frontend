import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { RegisterPage } from "@/features/auth/components/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/components/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/components/ResetPasswordPage";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { DashboardLayout } from "@/shared/layouts/DashboardLayout";
import { ClientsPage } from "@/features/clients/components/ClientsPage";
import { LoansPage } from "@/features/loans/components/LoansPage";
import { PaymentsPage } from "@/features/payments/components/PaymentsPage";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { UsersPage } from "@/features/admin/components/UsersPage";

const router = createBrowserRouter([
  // Rutas públicas — solo accesibles sin sesión
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  // Rutas protegidas — requieren sesión activa
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          { path: "/clients", element: <ClientsPage /> },
          { path: "/loans", element: <LoansPage /> },
          { path: "/payments", element: <PaymentsPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/admin/users", element: <UsersPage /> },
        ],
      },
    ],
  },
  // Redirecciones
  { path: "/", element: <Navigate to="/dashboard" /> },
  { path: "*", element: <Navigate to="/dashboard" /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
