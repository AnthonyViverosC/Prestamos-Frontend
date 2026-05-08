import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

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
import { DataTableShell } from "@/shared/components/DataTableShell";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { TableSkeleton } from "@/shared/components/TableSkeleton";
import { formatCurrency, formatDate } from "@/features/loans/utils/calculator";

export function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isFetching } = usePayments({
    page,
    per_page: 15,
  });

  const payments = data?.data ?? [];
  const pageTotal = payments.reduce(
    (sum: number, payment: Payment) => sum + parseFloat(payment.amount),
    0,
  );
  const cashCount = payments.filter((payment) => payment.method === "cash").length;
  const transferCount = payments.filter(
    (payment) => payment.method === "transfer",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cobros"
        title="Pagos"
        description="Registra cobros y revisa movimientos recientes con una vista mas clara y facil de seguir."
        actions={
          <Button onClick={() => setFormOpen(true)} size="lg">
            <Plus size={16} className="mr-2" />
            Registrar pago
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pagos visibles"
          value={String(data?.total ?? 0)}
          hint="Resultados cargados en este modulo"
          icon={CreditCard}
          accentClassName="bg-blue-600"
        />
        <StatCard
          label="Cobrado en pagina"
          value={formatCurrency(pageTotal)}
          hint="Suma de los movimientos listados"
          icon={Wallet}
          accentClassName="bg-emerald-500"
        />
        <StatCard
          label="Efectivo"
          value={String(cashCount)}
          hint="Pagos recibidos en caja"
          icon={Receipt}
          accentClassName="bg-amber-500"
        />
        <StatCard
          label="Transferencias"
          value={String(transferCount)}
          hint="Pagos bancarios registrados"
          icon={Landmark}
          accentClassName="bg-sky-500"
        />
      </section>

      <DataTableShell
        title="Historial de pagos"
        subtitle="Sigue los cobros mas recientes y valida referencias rapidamente."
        loading={isFetching && !isLoading}
        footer={
          data && data.last_page > 1 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Pagina {data.current_page} de {data.last_page} · {data.total} pagos
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
          <TableSkeleton rows={7} columns={6} />
        ) : payments.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={CreditCard}
              title="No hay pagos registrados"
              description="Registra el primer pago para empezar a llevar seguimiento de cobros y referencias."
              action={
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  Registrar primer pago
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Referencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment: Payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {payment.loan?.client?.full_name ?? "Sin cliente"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Prestamo #{payment.loan?.id ?? "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {payment.installment
                      ? `Cuota #${payment.installment.installment_number}`
                      : "Abono libre"}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-emerald-700">
                      {formatCurrency(payment.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(payment.payment_date)}
                  </TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={payment.method} />
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {payment.reference ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTableShell>

      <PaymentForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
