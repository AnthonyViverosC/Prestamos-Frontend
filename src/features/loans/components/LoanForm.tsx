import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { useCreateLoan } from "@/shared/hooks/useLoans";
import { useClients } from "@/shared/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calculateAmortization, formatCurrency } from "../utils/calculator";

const loanSchema = z.object({
  client_id: z.number().int().positive("Selecciona un cliente"),
  principal_amount: z.number().positive("Debe ser mayor a 0"),
  interest_rate: z
    .number()
    .min(0, "No puede ser negativo")
    .max(100, "Máximo 100%"),
  period_type: z.enum(["daily", "weekly", "monthly"]),
  period_count: z.number().int().min(1, "Mínimo 1 cuota"),
  start_date: z.string().min(1, "Selecciona una fecha"),
  late_fee_rate: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === "number" && Number.isNaN(value)) {
        return undefined;
      }
      return Number(value);
    },
    z.number().min(0).optional(),
  ),
  notes: z.string().optional(),
});

type LoanFormInput = z.input<typeof loanSchema>;
type LoanFormData = z.output<typeof loanSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const PERIOD_LABELS: Record<string, string> = {
  daily: "Diaria",
  weekly: "Semanal",
  monthly: "Mensual",
};

export function LoanForm({ open, onClose }: Props) {
  const { mutate: create, isPending } = useCreateLoan();
  const [clientSearch, setClientSearch] = useState("");

  const { data: clientsData } = useClients({
    search: clientSearch || undefined,
    status: "active",
    per_page: 20,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<LoanFormInput, unknown, LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      client_id: 0,
      principal_amount: 0,
      interest_rate: 0,
      period_type: "monthly",
      period_count: 12,
      start_date: today(),
      late_fee_rate: 0,
      notes: "",
    },
  });

  const principal = watch("principal_amount");
  const rate = watch("interest_rate");
  const count = watch("period_count");
  const type = watch("period_type");
  const startDate = watch("start_date");

  const calculation = useMemo(
    () =>
      calculateAmortization({
        principal: Number(principal),
        interestRate: Number(rate),
        periodCount: Number(count),
        periodType: type,
        startDate,
      }),
    [principal, rate, count, type, startDate],
  );

  const hasValidPreview =
    Number(principal) > 0 && Number(count) > 0 && startDate.length > 0;

  const onSubmit = (data: LoanFormData) => {
    create(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Nuevo préstamo
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Configura las condiciones del préstamo. La proyección se calcula al
            final.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-6"
        >
          <Field
            label="Cliente"
            error={errors.client_id?.message}
            required
          >
            <Controller
              control={control}
              name="client_id"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger aria-invalid={!!errors.client_id}>
                    <SelectValue placeholder="Selecciona un cliente activo" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="border-b border-slate-100 p-2">
                      <Input
                        placeholder="Buscar por nombre o documento…"
                        value={clientSearch}
                        onChange={(event) =>
                          setClientSearch(event.target.value)
                        }
                        onKeyDown={(event) => event.stopPropagation()}
                        className="h-9"
                      />
                    </div>
                    {clientsData?.data.length === 0 && (
                      <div className="px-3 py-3 text-sm text-slate-500">
                        Sin resultados
                      </div>
                    )}
                    {clientsData?.data.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        <span className="font-medium">{client.full_name}</span>
                        {client.dni && (
                          <span className="ml-2 text-xs text-slate-500">
                            · {client.dni}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              id="principal_amount"
              label="Monto"
              error={errors.principal_amount?.message}
              required
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  $
                </span>
                <Input
                  id="principal_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  aria-invalid={!!errors.principal_amount}
                  className="pl-8"
                  {...register("principal_amount", { valueAsNumber: true })}
                />
              </div>
            </Field>

            <Field
              id="interest_rate"
              label="Tasa (%)"
              error={errors.interest_rate?.message}
              required
            >
              <div className="relative">
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  aria-invalid={!!errors.interest_rate}
                  className="pr-9"
                  {...register("interest_rate", { valueAsNumber: true })}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  %
                </span>
              </div>
            </Field>

            <Field
              id="period_count"
              label="Cuotas"
              error={errors.period_count?.message}
              required
            >
              <Input
                id="period_count"
                type="number"
                min="1"
                placeholder="12"
                aria-invalid={!!errors.period_count}
                {...register("period_count", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Frecuencia" required>
              <Controller
                control={control}
                name="period_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diaria</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              id="start_date"
              label="Fecha de inicio"
              error={errors.start_date?.message}
              required
            >
              <Input
                id="start_date"
                type="date"
                aria-invalid={!!errors.start_date}
                {...register("start_date")}
              />
            </Field>
          </div>

          <Field id="late_fee_rate" label="Mora mensual">
            <div className="relative">
              <Input
                id="late_fee_rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                className="pr-9"
                {...register("late_fee_rate", { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                %
              </span>
            </div>
          </Field>

          <Field id="notes" label="Notas internas">
            <Textarea
              id="notes"
              placeholder="Acuerdos especiales, contexto del préstamo…"
              rows={3}
              {...register("notes")}
            />
          </Field>

          {/* Resumen de proyección */}
          {hasValidPreview && (
            <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                Proyección
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryItem
                  label="Cuota"
                  value={formatCurrency(calculation.installment)}
                  emphasis
                />
                <SummaryItem
                  label="Total"
                  value={formatCurrency(calculation.total)}
                />
                <SummaryItem
                  label="Interés"
                  value={formatCurrency(calculation.totalInterest)}
                />
                <SummaryItem
                  label="Frecuencia"
                  value={`${PERIOD_LABELS[type] ?? "—"} · ${Number(count)}`}
                />
              </div>
            </div>
          )}

          <DialogFooter className="-mx-6 -mb-6 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Crear préstamo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
        {hint && !error && (
          <span className="text-xs text-slate-400">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function SummaryItem({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p
        className={
          emphasis
            ? "mt-1 truncate text-base font-semibold tracking-tight text-slate-950"
            : "mt-1 truncate text-sm font-semibold text-slate-900"
        }
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
