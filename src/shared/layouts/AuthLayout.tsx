import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-foreground">PréstamosPro</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sistema de gestión de préstamos y cobros
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
