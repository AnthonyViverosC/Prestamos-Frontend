import { Badge } from "@/components/ui/badge";
import { LoanStatus } from "@/shared/types/loan.types";

const statusConfig: Record<LoanStatus, { label: string; className: string }> = {
  active: {
    label: "Activo",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  paid: {
    label: "Pagado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  overdue: {
    label: "Vencido",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  refinanced: {
    label: "Refinanciado",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={`rounded-full px-3 py-1 ${config.className}`}>
      {config.label}
    </Badge>
  );
}
