import { Badge } from "@/components/ui/badge";
import { Client } from "@/shared/types/client.types";

const statusConfig = {
  active: {
    label: "Activo",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  inactive: {
    label: "Inactivo",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
  defaulter: {
    label: "Moroso",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

export function ClientStatusBadge({ status }: { status: Client["status"] }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={`rounded-full px-3 py-1 ${config.className}`}>
      {config.label}
    </Badge>
  );
}
