import { CalendarDays, Loader2, NotebookText, Phone, ReceiptText } from "lucide-react";

import { useLoan } from "@/shared/hooks/useLoans";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { formatCurrency, formatDate } from "../utils/calculator";
import { InstallmentStatus } from "@/shared/types/loan.types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/shared/components/EmptyState";

interface Props {
  loanId: number | null;
  open: boolean;
  onClose: () => void;
}

const periodLabel = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
};

const installmentBadge: Record<InstallmentStatus, string> = {
  pending: "border-slate-200 bg-slate-100 text-slate-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  overdue: "border-red-200 bg-red-50 text-red-700",
};

const installmentLabel: Record<InstallmentStatus, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  partial: "Parcial",
  overdue: "Vencida",
};

export function LoanDetail({ loanId, open, onClose }: Props) {
  const { data: loan, isLoading } = useLoan(open ? loanId : null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {loan ? `Prestamo #${loan.id}` : "Detalle del prestamo"}
          </DialogTitle>
          <DialogDescription>
            Revisa cliente, resumen financiero y estado de cada cuota en un solo lugar.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !loan ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_70%,#38bdf8_100%)] p-5 text-white shadow-lg shadow-slate-900/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-100/80">
                      Cliente asociado
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {loan.client?.full_name ?? "Sin cliente"}
                    </h3>
                    {loan.client?.phone && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-slate-100">
                        <Phone size={14} />
                        {loan.client.phone}
                      </div>
                    )}
                  </div>
                  <LoanStatusBadge status={loan.status} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DetailStat label="Capital" value={formatCurrency(loan.principal_amount)} />
                  <DetailStat label="Saldo actual" value={formatCurrency(loan.balance)} />
                  <DetailStat label="Cuota estimada" value={formatCurrency(loan.installment_amount)} />
                  <DetailStat label="Pagado" value={formatCurrency(loan.total_paid)} />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-slate-600 shadow-sm">
                    <ReceiptText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Resumen del credito
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Parametros principales y calendario acordado.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard label="Total a cobrar" value={formatCurrency(loan.total_amount)} />
                  <InfoCard label="Tasa" value={`${Number(loan.interest_rate).toFixed(2)}%`} />
                  <InfoCard
                    label="Periodo"
                    value={`${periodLabel[loan.period_type]} · ${loan.period_count}`}
                  />
                  <InfoCard label="Mora" value={`${Number(loan.late_fee_rate).toFixed(2)}%`} />
                  <InfoCard label="Inicio" value={formatDate(loan.start_date)} />
                  <InfoCard label="Fin" value={formatDate(loan.end_date)} />
                </div>
              </div>
            </section>

            {loan.notes && (
              <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                    <NotebookText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Notas del prestamo
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{loan.notes}</p>
                  </div>
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-sm shadow-slate-950/[0.03]">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Cuotas ({loan.installments?.length ?? 0})
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Seguimiento detallado del estado de cada vencimiento.
                    </p>
                  </div>
                </div>
              </div>

              {!loan.installments?.length ? (
                <div className="p-5">
                  <EmptyState
                    icon={CalendarDays}
                    title="No hay cuotas generadas"
                    description="Cuando el prestamo tenga calendario de pagos, aparecera aqui."
                    className="min-h-[220px]"
                  />
                </div>
              ) : (
                <div className="max-h-[420px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead className="w-[70px]">Nro</TableHead>
                        <TableHead>Vence</TableHead>
                        <TableHead className="text-right">Cuota</TableHead>
                        <TableHead className="text-right">Capital</TableHead>
                        <TableHead className="text-right">Interes</TableHead>
                        <TableHead className="text-right">Pagado</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loan.installments.map((installment) => (
                        <TableRow key={installment.id}>
                          <TableCell className="font-semibold text-slate-700">
                            {installment.installment_number}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {formatDate(installment.due_date)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-slate-900">
                            {formatCurrency(installment.amount)}
                          </TableCell>
                          <TableCell className="text-right text-slate-500">
                            {formatCurrency(installment.principal)}
                          </TableCell>
                          <TableCell className="text-right text-slate-500">
                            {formatCurrency(installment.interest)}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            {formatCurrency(installment.paid_amount)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-700">
                            {formatCurrency(installment.balance)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`rounded-full px-3 py-1 ${installmentBadge[installment.status]}`}
                            >
                              {installmentLabel[installment.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-sky-100/80">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
