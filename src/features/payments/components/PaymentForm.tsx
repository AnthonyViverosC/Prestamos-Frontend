import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { useCreatePayment } from "../hooks/usePayments";
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
import api from "@/shared/lib/axios";
import { formatCurrency, formatDate } from "@/features/loans/utils/calculator";

const paymentSchema = z.object({
  loan_id: z.coerce.number().int().positive("Selecciona un préstamo"),
  installment_id: z.number().int().positive().nullable(),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  payment_date: z.string().min(1, "La fecha es requerida"),
  method: z.enum(["cash", "transfer", "other"]),
  reference: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type PaymentFormData = z.output<typeof paymentSchema>;

interface Loan {
  id: number;
  client: {
    full_name: string;
  };
  balance: string;
  status: string;
}

interface Installment {
  id: number;
  installment_number: number;
  due_date: string;
  amount: string;
  balance: string;
  status: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  defaultLoanId?: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export function PaymentForm({ open, onClose, defaultLoanId }: Props) {
  const { mutate: createPayment, isPending } = useCreatePayment();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof paymentSchema>, unknown, PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      loan_id: defaultLoanId ?? 0,
      installment_id: null,
      amount: 0,
      payment_date: today(),
      method: "cash",
      reference: "",
      notes: "",
    },
  });

  const selectedLoanId = watch("loan_id");
  const selectedInstallmentId = watch("installment_id");
  const selectedLoan = loans.find((loan) => loan.id === selectedLoanId);
  const selectedInstallment = installments.find(
    (installment) => installment.id === selectedInstallmentId,
  );

  useEffect(() => {
    if (!open) return;
    setLoadingLoans(true);
    api
      .get("/loans", { params: { status: "active", per_page: 100 } })
      .then((response) => setLoans(response.data.data ?? []))
      .finally(() => setLoadingLoans(false));
  }, [open]);

  useEffect(() => {
    if (!selectedLoanId) {
      setInstallments([]);
      return;
    }
    api.get(`/loans/${selectedLoanId}`).then((response) => {
      const pending = (response.data.installments ?? []).filter(
        (installment: Installment) => installment.status !== "paid",
      );
      setInstallments(pending);
    });
  }, [selectedLoanId]);

  useEffect(() => {
    if (!selectedInstallmentId) return;
    const installment = installments.find(
      (entry) => entry.id === selectedInstallmentId,
    );
    if (installment) {
      setValue("amount", parseFloat(installment.balance));
    }
  }, [selectedInstallmentId, installments, setValue]);

  useEffect(() => {
    if (!open) {
      reset({
        loan_id: defaultLoanId ?? 0,
        installment_id: null,
        amount: 0,
        payment_date: today(),
        method: "cash",
        reference: "",
        notes: "",
      });
      setInstallments([]);
      return;
    }
    if (defaultLoanId) {
      setValue("loan_id", defaultLoanId);
    }
  }, [defaultLoanId, open, reset, setValue]);

  const onSubmit = (data: PaymentFormData) => {
    createPayment(
      {
        ...data,
        reference: data.reference ?? "",
        notes: data.notes ?? "",
      },
      {
        onSuccess: () => {
          reset({
            loan_id: defaultLoanId ?? 0,
            installment_id: null,
            amount: 0,
            payment_date: today(),
            method: "cash",
            reference: "",
            notes: "",
          });
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Registrar pago
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Asocia el pago a un préstamo activo y a una cuota específica si
            aplica.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-6"
        >
          <Field
            label="Préstamo"
            error={errors.loan_id?.message}
            required
          >
            {loadingLoans ? (
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                Cargando préstamos…
              </div>
            ) : (
              <Controller
                control={control}
                name="loan_id"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      setValue("installment_id", null);
                    }}
                  >
                    <SelectTrigger aria-invalid={!!errors.loan_id}>
                      <SelectValue placeholder="Selecciona un préstamo activo" />
                    </SelectTrigger>
                    <SelectContent>
                      {loans.length === 0 && (
                        <div className="px-3 py-3 text-sm text-slate-500">
                          No hay préstamos activos
                        </div>
                      )}
                      {loans.map((loan) => (
                        <SelectItem key={loan.id} value={String(loan.id)}>
                          <span className="font-medium">
                            {loan.client.full_name}
                          </span>
                          <span className="ml-2 text-xs text-slate-500">
                            · saldo {formatCurrency(loan.balance)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </Field>

          {/* Tarjeta-resumen del préstamo seleccionado */}
          {selectedLoan && (
            <div className="grid gap-3 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 sm:grid-cols-3">
              <SummaryItem
                label="Cliente"
                value={selectedLoan.client.full_name}
              />
              <SummaryItem
                label="Saldo"
                value={formatCurrency(selectedLoan.balance)}
                emphasis
              />
              <SummaryItem
                label="Cuota seleccionada"
                value={
                  selectedInstallment
                    ? `#${selectedInstallment.installment_number} · ${formatCurrency(selectedInstallment.balance)}`
                    : "Abono libre"
                }
              />
            </div>
          )}

          {installments.length > 0 && (
            <Field
              label="Cuota a pagar"
              hint="Si no eliges, se registra como abono libre."
            >
              <Controller
                control={control}
                name="installment_id"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cuota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Abono libre</SelectItem>
                      {installments.map((installment) => (
                        <SelectItem
                          key={installment.id}
                          value={String(installment.id)}
                        >
                          Cuota #{installment.installment_number} · vence{" "}
                          {formatDate(installment.due_date)} ·{" "}
                          {formatCurrency(installment.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="amount"
              label="Monto recibido"
              error={errors.amount?.message}
              required
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  aria-invalid={!!errors.amount}
                  className="pl-8"
                  {...register("amount")}
                />
              </div>
            </Field>

            <Field
              id="payment_date"
              label="Fecha del pago"
              error={errors.payment_date?.message}
              required
            >
              <Input
                id="payment_date"
                type="date"
                aria-invalid={!!errors.payment_date}
                {...register("payment_date")}
              />
            </Field>

            <Field label="Método de pago">
              <Controller
                control={control}
                name="method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field id="reference" label="Referencia">
              <Input
                id="reference"
                placeholder="Comprobante o nota corta"
                {...register("reference")}
              />
            </Field>
          </div>

          <Field id="notes" label="Notas">
            <Textarea
              id="notes"
              placeholder="Observaciones útiles para el seguimiento del pago."
              rows={3}
              {...register("notes")}
            />
          </Field>

          <DialogFooter className="-mx-6 -mb-6 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Registrar pago
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
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p
        className={
          emphasis
            ? "mt-1 text-lg font-semibold tracking-tight text-slate-950"
            : "mt-1 truncate text-sm font-semibold text-slate-900"
        }
      >
        {value}
      </p>
    </div>
  );
}
