import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  HandCoins,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Wallet,
  WalletCards,
} from "lucide-react";

import { useLoans, useDeleteLoan } from "@/shared/hooks/useLoans";
import { LoanForm } from "./LoanForm";
import { LoanDetail } from "./LoanDetail";
import { LoanStatusBadge } from "./LoanStatusBadge";
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
import { formatCurrency, formatDate } from "../utils/calculator";
import { DataTableShell } from "@/shared/components/DataTableShell";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { TableSkeleton } from "@/shared/components/TableSkeleton";

export function LoansPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { mutate: deleteLoan, isPending: deleting } = useDeleteLoan();

  const filters = {
    search: debouncedSearch || undefined,
    status: status !== "all" ? status : undefined,
    page,
    per_page: 10,
  };

  const { data, isLoading, isFetching } = useLoans(filters);
  const loans = data?.data ?? [];

  const activeCount = loans.filter((loan) => loan.status === "active").length;
  const overdueCount = loans.filter((loan) => loan.status === "overdue").length;
  const pendingBalance = loans.reduce(
    (sum, loan) => sum + Number(loan.balance || 0),
    0,
  );
  const totalPlaced = loans.reduce(
    (sum, loan) => sum + Number(loan.principal_amount || 0),
    0,
  );

  const handleDelete = () => {
    if (!deleteId) return;
    deleteLoan(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleCloseDetail = useCallback(() => setDetailId(null), []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cartera"
        title="Prestamos"
        description="Consulta estado de cartera, revisa saldos y controla rapidamente cada operacion con una vista mas ordenada."
        actions={
          <Button onClick={() => setFormOpen(true)} size="lg">
            <Plus size={16} className="mr-2" />
            Nuevo prestamo
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Prestamos visibles"
          value={String(data?.total ?? 0)}
          hint="Resultados sobre el filtro actual"
          icon={HandCoins}
          accentClassName="bg-blue-600"
        />
        <StatCard
          label="Activos"
          value={String(activeCount)}
          hint="Operaciones en seguimiento"
          icon={Wallet}
          accentClassName="bg-sky-500"
        />
        <StatCard
          label="Vencidos"
          value={String(overdueCount)}
          hint="Requieren atencion inmediata"
          icon={ShieldAlert}
          accentClassName="bg-red-500"
        />
        <StatCard
          label="Saldo pendiente"
          value={formatCurrency(pendingBalance)}
          hint={`Capital colocado ${formatCurrency(totalPlaced)}`}
          icon={WalletCards}
          accentClassName="bg-amber-500"
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
              placeholder="Buscar por nombre del cliente..."
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
              <SelectItem value="paid">Pagados</SelectItem>
              <SelectItem value="overdue">Vencidos</SelectItem>
              <SelectItem value="refinanced">Refinanciados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <DataTableShell
        title="Cartera registrada"
        subtitle="Visualiza saldos, fechas clave y acciones de seguimiento."
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
          <TableSkeleton rows={6} columns={8} />
        ) : loans.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Wallet}
              title="No se encontraron prestamos"
              description="Crea un nuevo prestamo o ajusta los filtros para encontrar operaciones existentes."
              action={
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  Crear primer prestamo
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Capital</TableHead>
                <TableHead className="text-right">Cuota</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {loan.client?.full_name ?? "Sin cliente"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {loan.period_count} cuotas · {loan.period_type}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {formatCurrency(loan.principal_amount)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-800">
                    {formatCurrency(loan.installment_amount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    {formatCurrency(loan.balance)}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(loan.start_date)}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(loan.end_date)}
                  </TableCell>
                  <TableCell>
                    <LoanStatusBadge status={loan.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setDetailId(loan.id)}
                      >
                        <Eye size={15} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDeleteId(loan.id)}
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

      <LoanForm open={formOpen} onClose={() => setFormOpen(false)} />

      <LoanDetail loanId={detailId} open={!!detailId} onClose={handleCloseDetail} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar prestamo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el prestamo junto con sus cuotas y pagos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 size={14} className="mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
