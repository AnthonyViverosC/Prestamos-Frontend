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

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
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
          {
            path: "/clients",
            element: (
              <div className="p-6">
                <h1 className="text-2xl font-medium">Clientes</h1>
              </div>
            ),
          },
          {
            path: "/loans",
            element: (
              <div className="p-6">
                <h1 className="text-2xl font-medium">Préstamos</h1>
              </div>
            ),
          },
          {
            path: "/payments",
            element: (
              <div className="p-6">
                <h1 className="text-2xl font-medium">Pagos</h1>
              </div>
            ),
          },
        ],
      },
    ],
  },
  { path: "/", element: <Navigate to="/dashboard" /> },
  { path: "*", element: <Navigate to="/dashboard" /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
