import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Users,
  Wallet,
} from "lucide-react";

import { useAdminUsers, useDeleteAdminUser } from "../hooks/useAdminUsers";
import { AdminUser } from "../api/users.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { TableSkeleton } from "@/shared/components/TableSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { UserForm } from "./UserForm";
import { UserPasswordForm } from "./UserPasswordForm";
import { RoleBadge } from "./RoleBadge";

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editingPassword, setEditingPassword] = useState<AdminUser | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      role: role !== "all" ? role : undefined,
      page,
      per_page: 10,
    }),
    [debouncedSearch, role, page],
  );

  const { data, isLoading } = useAdminUsers(filters);
  const { mutate: deleteUser, isPending: deleting } = useDeleteAdminUser();

  const users = data?.data ?? [];

  const stats = useMemo(() => {
    return {
      total: data?.total ?? 0,
      admins: users.filter((u) => u.role === "admin").length,
      collectors: users.filter((u) => u.role === "collector").length,
      users: users.filter((u) => u.role === "user").length,
    };
  }, [data?.total, users]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteUser(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Usuarios del sistema
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Consulta, edita y administra el acceso de los usuarios.
          </p>
        </div>
      </header>

      {/* Métricas */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total"
          value={String(stats.total)}
          icon={Users}
          tone="bg-primary/10 text-primary"
        />
        <Stat
          label="Administradores"
          value={String(stats.admins)}
          icon={ShieldCheck}
          tone="bg-violet-100 text-violet-700"
        />
        <Stat
          label="Cobradores"
          value={String(stats.collectors)}
          icon={Wallet}
          tone="bg-amber-100 text-amber-700"
        />
        <Stat
          label="Usuarios"
          value={String(stats.users)}
          icon={User}
          tone="bg-slate-100 text-slate-700"
        />
      </section>

      {/* Filtros */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Buscar por nombre o correo…"
              className="pl-11"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="collector">Cobrador</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Tabla */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Listado de usuarios
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {data?.total ?? 0} resultados
            </p>
          </div>
        </header>

        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : users.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Users}
              title="No se encontraron usuarios"
              description="Ajusta los filtros para ver otros resultados."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = currentUser?.id === user.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1f4d] text-xs font-semibold text-white">
                          {initials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {user.name}
                            {isSelf && (
                              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                Tú
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            ID #{user.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label="Editar usuario"
                          onClick={() => setEditing(user)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label="Cambiar contraseña"
                          onClick={() => setEditingPassword(user)}
                        >
                          <KeyRound size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label="Eliminar usuario"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                          onClick={() => setDeleteId(user.id)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "No puedes eliminar tu propia cuenta"
                              : undefined
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-5 py-4">
            <p className="text-sm text-slate-500">
              Página {data.current_page} de {data.last_page} · {data.total}{" "}
              resultados
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page === data.last_page}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Modales */}
      <UserForm
        open={!!editing}
        onClose={() => setEditing(null)}
        user={editing}
      />
      <UserPasswordForm
        open={!!editingPassword}
        onClose={() => setEditingPassword(null)}
        user={editingPassword}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. El usuario perderá acceso al sistema y
              sus sesiones serán revocadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl p-2 ${tone}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}
