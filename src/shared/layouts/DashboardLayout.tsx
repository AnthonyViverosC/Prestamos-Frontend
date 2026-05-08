import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/features/auth/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  HandCoins,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/loans", label: "Préstamos", icon: HandCoins },
  { to: "/payments", label: "Pagos", icon: CreditCard },
];

export function DashboardLayout() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-background border-r border-border flex flex-col transition-all duration-200",
          sidebarOpen ? "w-56" : "w-16",
        )}
      >
        {/* Header sidebar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <span className="font-medium text-foreground truncate">
              PréstamosPro
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-border">
          {sidebarOpen && (
            <div className="mb-2 px-2">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={() => logout()}
            disabled={isPending}
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && <span className="ml-2">Cerrar sesión</span>}
          </Button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <div className="h-16 bg-background border-b border-border flex items-center px-6">
          <p className="text-sm text-muted-foreground">
            Bienvenido,{" "}
            <span className="text-foreground font-medium">{user?.name}</span>
          </p>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
