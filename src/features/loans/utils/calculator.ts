import { PeriodType } from "@/shared/types/loan.types";

export interface AmortizationRow {
  number: number;
  due_date: string;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface AmortizationResult {
  installment: number;
  total: number;
  totalInterest: number;
  rows: AmortizationRow[];
}

interface Params {
  principal: number;
  interestRate: number;
  periodCount: number;
  periodType: PeriodType;
  startDate: string;
}

function addPeriods(start: Date, n: number, type: PeriodType): Date {
  const d = new Date(start);
  if (type === "daily") d.setDate(d.getDate() + n);
  else if (type === "weekly") d.setDate(d.getDate() + n * 7);
  else d.setMonth(d.getMonth() + n);
  return d;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function calculateAmortization(params: Params): AmortizationResult {
  const P = Number(params.principal) || 0;
  const n = Number(params.periodCount) || 0;
  const r = (Number(params.interestRate) || 0) / 100;

  if (P <= 0 || n <= 0) {
    return { installment: 0, total: 0, totalInterest: 0, rows: [] };
  }

  const installment =
    r > 0 ? (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) : P / n;

  let balance = P;
  const start = params.startDate ? new Date(params.startDate) : new Date();
  const rows: AmortizationRow[] = [];

  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principal = installment - interest;
    balance = Math.max(balance - principal, 0);

    rows.push({
      number: i,
      due_date: toISO(addPeriods(start, i, params.periodType)),
      amount: round(installment),
      principal: round(principal),
      interest: round(interest),
      balance: round(balance),
    });
  }

  const total = round(installment * n);
  return {
    installment: round(installment),
    total,
    totalInterest: round(total - P),
    rows,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(value: number | string | undefined): string {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(value: string | undefined | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
