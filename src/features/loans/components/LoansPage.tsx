import { useState, useCallback } from "react";
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
import {
  Plus,
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wallet,
} from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { formatCurrency, formatDate } from "../utils/calculator";

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
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Préstamos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.total ?? 0} préstamos registrados
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} className="mr-2" />
          Nuevo préstamo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar por nombre del cliente..."
            className="pl-9"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
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

      {/* Tabla */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium">Lista de préstamos</span>
          {isFetching && !isLoading && (
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
            <Wallet size={40} strokeWidth={1} />
            <p className="text-sm">No se encontraron préstamos</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormOpen(true)}
            >
              Crear primer préstamo
            </Button>
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
              {data?.data.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">
                    {loan.client?.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(loan.principal_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(loan.installment_amount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(loan.balance)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(loan.start_date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(loan.end_date)}
                  </TableCell>
                  <TableCell>
                    <LoanStatusBadge status={loan.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetailId(loan.id)}
                      >
                        <Eye size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
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

        {/* Paginación */}
        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Página {data.current_page} de {data.last_page} — {data.total}{" "}
              resultados
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page === data.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal nuevo préstamo */}
      <LoanForm open={formOpen} onClose={() => setFormOpen(false)} />

      {/* Modal detalle */}
      <LoanDetail
        loanId={detailId}
        open={!!detailId}
        onClose={handleCloseDetail}
      />

      {/* Confirmación eliminar */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar préstamo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El préstamo, sus cuotas y los
              pagos asociados serán eliminados.
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
