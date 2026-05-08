import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  HandCoins,
  Receipt,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Button } from "@/components/ui/button";
import { useClients } from "@/shared/hooks/useClients";
import { useLoans } from "@/shared/hooks/useLoans";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { formatCurrency, formatDate } from "@/features/loans/utils/calculator";

const quickActions = [
  {
    to: "/clients",
    label: "Nuevo cliente",
    description: "Agrega un cliente a tu cartera",
    icon: Users,
  },
  {
    to: "/loans",
    label: "Nuevo préstamo",
    description: "Registra una nueva colocación",
    icon: HandCoins,
  },
  {
    to: "/payments",
    label: "Registrar pago",
    description: "Captura un cobro entrante",
    icon: CreditCard,
  },
];

const STATUS_COLORS = ["#16a34a", "#f59e0b", "#ef4444", "#94a3b8"];

export function DashboardPage() {
  const clientsQuery = useClients({ page: 1, per_page: 250 });
  const loansQuery = useLoans({ page: 1, per_page: 250 });
  const paymentsQuery = usePayments({ page: 1, per_page: 250 });

  const loans = loansQuery.data?.data ?? [];
  const payments = paymentsQuery.data?.data ?? [];

  const totalOutstanding = loans.reduce(
    (sum, loan) => sum + toNumber(loan.balance),
    0,
  );
  const totalCollected = payments.reduce(
    (sum, payment) => sum + toNumber(payment.amount),
    0,
  );
  const now = new Date();
  const monthCollected = payments
    .filter((payment) => {
      const paymentDate = new Date(payment.payment_date);
      return (
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  const statusSummary = [
    {
      name: "Al día",
      value: loans.filter((loan) => loan.status === "active").length,
    },
    {
      name: "Vencidos",
      value: loans.filter((loan) => loan.status === "overdue").length,
    },
    {
      name: "En mora",
      value: loans.filter((loan) => loan.status === "refinanced").length,
    },
    {
      name: "Cancelados",
      value: loans.filter((loan) => loan.status === "paid").length,
    },
  ];

  const totalStatus = statusSummary.reduce((sum, item) => sum + item.value, 0);
  const totalPrincipal = loans.reduce(
    (sum, loan) => sum + toNumber(loan.principal_amount),
    0,
  );
  const progress =
    totalPrincipal > 0 ? (totalCollected / totalPrincipal) * 100 : 0;

  const activity = [
    ...payments.slice(0, 3).map((payment) => ({
      type: "Pago",
      description: payment.loan?.client?.full_name ?? "Cliente sin nombre",
      date: formatDate(payment.payment_date),
      amount: formatCurrency(payment.amount),
      status: "Registrado",
      tone: "emerald" as const,
    })),
    ...loans.slice(0, 2).map((loan) => ({
      type: "Préstamo",
      description: loan.client?.full_name ?? "Cliente sin nombre",
      date: formatDate(loan.created_at),
      amount: formatCurrency(loan.principal_amount),
      status: "Activo",
      tone: "blue" as const,
    })),
  ].slice(0, 5);

  const dateRange = formatDateRange(now);

  return (
    <div className="space-y-6">
      {/* Encabezado con periodo */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Resumen general
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Información clave de tu cartera al día de hoy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <ShieldCheck size={15} className="text-emerald-500" />
            <span className="font-medium">Sistema operativo</span>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900">
            <Calendar size={15} className="text-slate-400" />
            {dateRange}
          </button>
        </div>
      </section>

      {/* Métricas */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          label="Cobrado este mes"
          value={formatCurrency(monthCollected)}
          icon={DollarSign}
          tone="primary"
          trend="0%"
          trendLabel="vs mes anterior"
        />
        <DashboardMetric
          label="Saldo pendiente"
          value={formatCurrency(totalOutstanding)}
          icon={WalletCards}
          tone="amber"
          trend="0%"
          trendLabel="cartera viva"
        />
        <DashboardMetric
          label="Pagos registrados"
          value={String(paymentsQuery.data?.total ?? 0)}
          icon={Receipt}
          tone="emerald"
          trend="0%"
          trendLabel="últimos 30 días"
        />
        <DashboardMetric
          label="Clientes"
          value={String(clientsQuery.data?.total ?? 0)}
          icon={Users}
          tone="violet"
          trend="0%"
          trendLabel="en tu cartera"
        />
      </section>

      {/* Gráficos */}
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Estado de la cartera
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Distribución de préstamos por estado actual.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {totalStatus} préstamos
            </span>
          </header>

          <div className="mt-6 grid items-center gap-6 lg:grid-cols-[220px_1fr]">
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusSummary}
                    dataKey="value"
                    innerRadius={62}
                    outerRadius={88}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {statusSummary.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-semibold tracking-tight text-slate-950">
                  {totalStatus}
                </p>
                <p className="text-xs text-slate-500">total</p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {statusSummary.map((item, index) => {
                const percentage =
                  totalStatus > 0
                    ? Math.round((item.value / totalStatus) * 100)
                    : 0;
                return (
                  <li
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[index % STATUS_COLORS.length],
                        }}
                      />
                      <span className="text-sm text-slate-700">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.value}{" "}
                      <span className="text-xs font-medium text-slate-400">
                        ({percentage}%)
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header>
            <h2 className="text-base font-semibold text-slate-900">
              Avance de recuperación
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Capital cobrado vs. capital colocado.
            </p>
          </header>

          <div className="mt-6 grid items-center gap-5 sm:grid-cols-[170px_1fr]">
            <div className="h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="72%"
                  outerRadius="100%"
                  data={[
                    { name: "Progreso", value: Math.min(progress, 100) },
                  ]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    fill="#2563eb"
                    cornerRadius={999}
                    background={{ fill: "#eef2ff" }}
                  />
                  <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-900 text-2xl font-semibold"
                  >
                    {`${Math.round(progress)}%`}
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">
                Progreso total
              </p>
              <p className="mt-1.5 text-sm text-slate-500">
                {formatCurrency(totalCollected)} de{" "}
                {formatCurrency(totalPrincipal)}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Mantén un ritmo constante de cobranza para reducir la cartera
                viva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Actividad y acciones rápidas */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-5 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Actividad reciente
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Últimos movimientos registrados en el sistema.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/payments">
                Ver todo
                <ArrowRight size={14} />
              </Link>
            </Button>
          </header>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[0.8fr_1.6fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span>Tipo</span>
              <span>Descripción</span>
              <span>Fecha</span>
              <span>Monto</span>
              <span>Estado</span>
            </div>

            {activity.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-slate-500">
                Aún no hay actividad registrada.
              </div>
            ) : (
              activity.map((item, index) => (
                <div
                  key={`${item.type}-${index}`}
                  className="grid grid-cols-[0.8fr_1.6fr_0.8fr_0.8fr_0.8fr] items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-sm last:border-b-0"
                >
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.tone === "blue"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="truncate font-medium text-slate-800">
                    {item.description}
                  </span>
                  <span className="text-slate-500">{item.date}</span>
                  <span className="font-semibold text-slate-900">
                    {item.amount}
                  </span>
                  <span className="text-slate-500">{item.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header>
            <h2 className="text-base font-semibold text-slate-900">
              Acciones rápidas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Atajos para las tareas más frecuentes.
            </p>
          </header>

          <ul className="mt-5 space-y-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.to}>
                  <Link
                    to={action.to}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {action.label}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {action.description}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <Button asChild className="mt-5 w-full">
            <Link to="/loans">
              Ir al módulo de préstamos
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

const TONES = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
} as const;

function DashboardMetric({
  label,
  value,
  icon: Icon,
  tone,
  trend,
  trendLabel,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: keyof typeof TONES;
  trend: string;
  trendLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl p-2 ${TONES[tone]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs">
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
          <ArrowUpRight size={11} />
          {trend}
        </span>
        <span className="text-slate-500">{trendLabel}</span>
      </p>
    </div>
  );
}

function toNumber(value: string | number | undefined | null): number {
  return Number(value) || 0;
}

function formatDateRange(date: Date): string {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const formatter = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}
