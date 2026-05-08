import { Badge } from "@/components/ui/badge";
import { Payment } from "@/shared/types/payment.types";

const methodConfig = {
  cash: {
    label: "Efectivo",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  transfer: {
    label: "Transferencia",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  other: {
    label: "Otro",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

export function PaymentMethodBadge({ method }: { method: Payment["method"] }) {
  const config = methodConfig[method];

  return (
    <Badge variant="outline" className={`rounded-full px-3 py-1 ${config.className}`}>
      {config.label}
    </Badge>
  );
}
