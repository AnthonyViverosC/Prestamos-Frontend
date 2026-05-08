import { useState } from "react";
import { usePayments } from "../hooks/usePayments";
import { PaymentForm } from "./PaymentForm";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import { Payment } from "@/shared/types/payment.types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CreditCard,
} from "lucide-react";

export function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isFetching } = usePayments({
    page,
    per_page: 15,
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">
            Pagos y cobros
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.total ?? 0} pagos registrados
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} className="mr-2" />
          Registrar pago
        </Button>
      </div>

      {/* Resumen rápido */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Total cobrado (página)
            </p>
            <p className="text-xl font-medium">
              $
              {data.data
                .reduce(
                  (sum: number, payment: Payment) =>
                    sum + parseFloat(payment.amount),
                  0,
                )
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Pagos en esta página
            </p>
            <p className="text-xl font-medium">{data.data.length}</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total de pagos</p>
            <p className="text-xl font-medium">{data.total}</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium">Historial de pagos</span>
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
            <CreditCard size={40} strokeWidth={1} />
            <p className="text-sm">No hay pagos registrados</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormOpen(true)}
            >
              Registrar primer pago
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Cuota</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Referencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((payment: Payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.loan?.client?.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.installment
                      ? `Cuota #${payment.installment.installment_number}`
                      : "Abono libre"}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-700">
                      ${parseFloat(payment.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.payment_date}
                  </TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={payment.method} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.reference ?? "—"}
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
              pagos
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

      {/* Modal */}
      <PaymentForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
