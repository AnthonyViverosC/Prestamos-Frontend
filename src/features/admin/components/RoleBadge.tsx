import { ShieldCheck, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES = {
  admin: {
    label: "Administrador",
    icon: ShieldCheck,
    className: "bg-violet-100 text-violet-700 ring-violet-200",
  },
  collector: {
    label: "Cobrador",
    icon: Wallet,
    className: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  user: {
    label: "Usuario",
    icon: User,
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
} as const;

export function RoleBadge({ role }: { role: string }) {
  const config = (ROLES as Record<string, (typeof ROLES)[keyof typeof ROLES]>)[
    role
  ];
  const Icon = config?.icon ?? User;
  const label = config?.label ?? role;
  const className =
    config?.className ?? "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        className,
      )}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}
