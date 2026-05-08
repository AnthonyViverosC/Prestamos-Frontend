import { LoanStatus } from "@/shared/types/loan.types";
import { cn } from "@/lib/utils";

const statusConfig: Record<LoanStatus, { label: string; classes: string }> = {
  active: { label: "Activo", classes: "bg-blue-100 text-blue-800" },
  paid: { label: "Pagado", classes: "bg-green-100 text-green-800" },
  overdue: { label: "Vencido", classes: "bg-red-100 text-red-700" },
  refinanced: { label: "Refinanciado", classes: "bg-amber-100 text-amber-800" },
};

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-full",
        config.classes,
      )}
    >
      {config.label}
    </span>
  );
}
