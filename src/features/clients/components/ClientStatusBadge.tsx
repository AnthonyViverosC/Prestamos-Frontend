import { Client } from "@/shared/types/client.types";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Activo", classes: "bg-green-100 text-green-800" },
  inactive: { label: "Inactivo", classes: "bg-gray-100 text-gray-700" },
  defaulter: { label: "Moroso", classes: "bg-red-100 text-red-700" },
};

export function ClientStatusBadge({ status }: { status: Client["status"] }) {
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
