import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  Users,
  UserRoundCheck,
  ShieldAlert,
  Ban,
} from "lucide-react";

import { useClients, useDeleteClient } from "../../../shared/hooks/useClients";
import { ClientForm } from "./ClientForm";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { Client } from "@/shared/types/client.types";
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
import { EmptyState } from "@/shared/components/EmptyState";
import { DataTableShell } from "@/shared/components/DataTableShell";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { TableSkeleton } from "@/shared/components/TableSkeleton";

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { mutate: deleteClient, isPending: deleting } = useDeleteClient();

  const filters = {
    search: debouncedSearch || undefined,
    status: status !== "all" ? status : undefined,
    page,
    per_page: 10,
  };

  const { data, isLoading, isFetching } = useClients(filters);
  const clients = data?.data ?? [];

  const activeCount = clients.filter((client) => client.status === "active").length;
  const inactiveCount = clients.filter((client) => client.status === "inactive").length;
  const defaulterCount = clients.filter((client) => client.status === "defaulter").length;

  const handleEdit = useCallback((client: Client) => {
    setSelected(client);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setSelected(null);
  }, []);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteClient(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="CRM"
        title="Clientes"
        description="Administra tu base de clientes con un flujo mas claro, filtros utiles y acceso rapido a edicion y seguimiento."
        actions={
          <Button onClick={() => setFormOpen(true)} size="lg">
            <UserPlus size={16} className="mr-2" />
            Nuevo cliente
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clientes visibles"
          value={String(data?.total ?? 0)}
          hint="Resultados sobre el filtro actual"
          icon={Users}
          accentClassName="bg-sky-500"
        />
        <StatCard
          label="Activos"
          value={String(activeCount)}
          hint="Disponibles para nuevas operaciones"
          icon={UserRoundCheck}
          accentClassName="bg-emerald-500"
        />
        <StatCard
          label="Morosos"
          value={String(defaulterCount)}
          hint="Requieren seguimiento cercano"
          icon={ShieldAlert}
          accentClassName="bg-red-500"
        />
        <StatCard
          label="Inactivos"
          value={String(inactiveCount)}
          hint="Sin actividad operativa reciente"
          icon={Ban}
          accentClassName="bg-slate-500"
        />
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-sm shadow-slate-950/[0.03] sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Buscar por nombre, documento o telefono..."
              className="pl-11"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="defaulter">Morosos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <DataTableShell
        title="Base de clientes"
        subtitle="Consulta, edita y depura rapidamente los registros."
        loading={isFetching && !isLoading}
        footer={
          data && data.last_page > 1 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Pagina {data.current_page} de {data.last_page} · {data.total} resultados
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === data.last_page}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : clients.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Users}
              title="No se encontraron clientes"
              description="Ajusta los filtros o registra un nuevo cliente para empezar a trabajar con una base organizada."
              action={
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  Crear primer cliente
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Prestamos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900">{client.full_name}</p>
                      <p className="text-xs text-slate-500">{client.email ?? "Sin correo"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{client.dni ?? "—"}</TableCell>
                  <TableCell className="text-slate-500">{client.phone ?? "—"}</TableCell>
                  <TableCell className="text-slate-500">{client.city ?? "—"}</TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {client.loans_count ?? 0}
                  </TableCell>
                  <TableCell>
                    <ClientStatusBadge status={client.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon-sm" onClick={() => handleEdit(client)}>
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDeleteId(client.id)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTableShell>

      <ClientForm open={formOpen} onClose={handleCloseForm} client={selected} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el registro del cliente. Asegurate de que no
              exista informacion operativa que necesites conservar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <LoaderSpinner />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LoaderSpinner() {
  return <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}
