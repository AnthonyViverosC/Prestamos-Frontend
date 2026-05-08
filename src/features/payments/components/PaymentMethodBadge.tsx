import { Payment } from "@/shared/types/payment.types";
import { cn } from "@/lib/utils";

const methodConfig = {
  cash: { label: "Efectivo", classes: "bg-green-100 text-green-800" },
  transfer: { label: "Transferencia", classes: "bg-blue-100 text-blue-800" },
  other: { label: "Otro", classes: "bg-gray-100 text-gray-700" },
};

export function PaymentMethodBadge({ method }: { method: Payment["method"] }) {
  const config = methodConfig[method];
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
