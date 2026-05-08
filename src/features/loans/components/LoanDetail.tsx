import { useLoan } from "@/shared/hooks/useLoans";
import {
  Dialog,
  DialogContent,
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
import { Loader2 } from "lucide-react";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { formatCurrency, formatDate } from "../utils/calculator";
import { InstallmentStatus } from "@/shared/types/loan.types";
import { cn } from "@/lib/utils";

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
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-green-100 text-green-800",
  partial: "bg-amber-100 text-amber-800",
  overdue: "bg-red-100 text-red-700",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {loan ? `Préstamo #${loan.id}` : "Detalle del préstamo"}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !loan ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="text-lg font-medium">
                  {loan.client?.full_name ?? "—"}
                </p>
                {loan.client?.phone && (
                  <p className="text-xs text-muted-foreground">
                    {loan.client.phone}
                  </p>
                )}
              </div>
              <LoanStatusBadge status={loan.status} />
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/40 rounded-md p-4">
              <Stat
                label="Capital"
                value={formatCurrency(loan.principal_amount)}
              />
              <Stat
                label="Cuota"
                value={formatCurrency(loan.installment_amount)}
              />
              <Stat
                label="Total"
                value={formatCurrency(loan.total_amount)}
              />
              <Stat
                label="Saldo"
                value={formatCurrency(loan.balance)}
                accent
              />
              <Stat
                label="Pagado"
                value={formatCurrency(loan.total_paid)}
              />
              <Stat
                label="Tasa"
                value={`${Number(loan.interest_rate).toFixed(2)}%`}
              />
              <Stat
                label="Período"
                value={`${periodLabel[loan.period_type]} · ${loan.period_count}`}
              />
              <Stat
                label="Mora"
                value={`${Number(loan.late_fee_rate).toFixed(2)}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Inicio: </span>
                <span className="font-medium">{formatDate(loan.start_date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fin: </span>
                <span className="font-medium">{formatDate(loan.end_date)}</span>
              </div>
            </div>

            {loan.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Notas</p>
                <p>{loan.notes}</p>
              </div>
            )}

            {/* Cuotas */}
            <div>
              <p className="text-sm font-medium mb-2">
                Cuotas ({loan.installments?.length ?? 0})
              </p>
              <div className="border border-border rounded-md overflow-auto max-h-[360px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[50px]">N°</TableHead>
                      <TableHead>Vence</TableHead>
                      <TableHead className="text-right">Cuota</TableHead>
                      <TableHead className="text-right">Capital</TableHead>
                      <TableHead className="text-right">Interés</TableHead>
                      <TableHead className="text-right">Pagado</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loan.installments?.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">
                          {i.installment_number}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(i.due_date)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(i.amount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(i.principal)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(i.interest)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(i.paid_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(i.balance)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              installmentBadge[i.status],
                            )}
                          >
                            {installmentLabel[i.status]}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium",
          accent && "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}
