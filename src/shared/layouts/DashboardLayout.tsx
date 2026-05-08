import { Outlet, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Bell,
  CreditCard,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/loans", label: "Préstamos", icon: HandCoins },
  { to: "/payments", label: "Pagos", icon: CreditCard },
];

const secondaryNav = [
  { to: "/settings", label: "Configuración", icon: Settings },
];

const adminNav = [
  { to: "/admin/users", label: "Usuarios", icon: ShieldCheck },
];

export function DashboardLayout() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const initials = useMemo(() => {
    if (!user?.name) return "PP";
    return user.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.name]);

  return (
    <div className="min-h-screen bg-slate-100/60">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar — fijo en desktop, off-canvas en mobile */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:w-64 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1f4d] text-base font-bold text-white shadow-sm">
                P
              </div>
              <div className="leading-none">
                <p className="text-base font-semibold tracking-tight text-slate-950">
                  Prestamos<span className="text-primary">Pro</span>
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Panel asesor
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mt-8 flex-1 overflow-y-auto px-3">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              General
            </p>
            <ul className="space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                      )
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            {isAdmin && (
              <>
                <p className="mt-7 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Administración
                </p>
                <ul className="space-y-1">
                  {adminNav.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                          )
                        }
                      >
                        <Icon size={17} className="shrink-0" />
                        <span>{label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="mt-7 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Sistema
            </p>
            <ul className="space-y-1">
              {secondaryNav.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                      )
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tarjeta de usuario */}
          <div className="m-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b1f4d] text-sm font-semibold text-white"
                aria-hidden
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name ?? "Sin sesión"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.role ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                disabled={isPending}
                aria-label="Cerrar sesión"
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
              <div className="flex flex-1 items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-colors hover:text-slate-900 lg:hidden"
                  aria-label="Abrir menú"
                >
                  <Menu size={18} />
                </button>

                <div className="relative w-full max-w-md">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    placeholder="Buscar clientes, préstamos, pagos…"
                    className="h-10 border-slate-200 bg-slate-50/70 pl-11 shadow-none focus-visible:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
                  aria-label="Notificaciones"
                >
                  <Bell size={16} />
                  <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                </button>

                <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:flex">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1f4d] text-xs font-semibold text-white"
                    aria-hidden
                  >
                    {initials}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.name ?? "—"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {user?.role ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
