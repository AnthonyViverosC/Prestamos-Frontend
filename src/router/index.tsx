import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { RegisterPage } from "@/features/auth/components/RegisterPage";
import { DashboardLayout } from "@/shared/layouts/DashboardLayout";
import { ClientsPage } from "@/features/clients/components/ClientsPage";
import { LoansPage } from "@/features/loans/components/LoansPage";
import { PaymentsPage } from "@/features/payments/components/PaymentsPage";

const router = createBrowserRouter([
  // Rutas públicas — solo accesibles sin sesión
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
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
            element: (
              <div className="p-6">
                <h1 className="text-2xl font-medium">Dashboard</h1>
              </div>
            ),
          },
          { path: "/clients", element: <ClientsPage /> },
          { path: "/loans", element: <LoansPage /> },
          { path: "/payments", element: <PaymentsPage /> },
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
