import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePayment } from "../hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import api from "@/shared/lib/axios";

const paymentSchema = z.object({
  loan_id: z.number().min(1, "Selecciona un préstamo"),

  installment_id: z.number().nullable(),

  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),

  payment_date: z.string().min(1, "La fecha es requerida"),

  method: z.enum(["cash", "transfer", "other"]),

  reference: z.string().optional().or(z.literal("")),

  notes: z.string().optional().or(z.literal("")),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

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

export function PaymentForm({ open, onClose, defaultLoanId }: Props) {
  const { mutate: createPayment, isPending } = useCreatePayment();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  const {
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
      payment_date: new Date().toISOString().split("T")[0],
      method: "cash",
      reference: "",
      notes: "",
    },
  });

  const selectedLoanId = watch("loan_id");

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  // Cargar préstamos
  useEffect(() => {
    if (!open) return;

    setLoadingLoans(true);

    api
      .get("/loans", {
        params: {
          status: "active",
          per_page: 100,
        },
      })
      .then((r) => {
        setLoans(r.data.data ?? []);
      })
      .finally(() => {
        setLoadingLoans(false);
      });
  }, [open]);

  // Cargar cuotas
  useEffect(() => {
    if (!selectedLoanId) return;

    api.get(`/loans/${selectedLoanId}`).then((r) => {
      const pending = (r.data.installments ?? []).filter(
        (i: Installment) => i.status !== "paid",
      );

      setInstallments(pending);
    });
  }, [selectedLoanId]);

  // Autollenar monto
  const selectedInstallmentId = watch("installment_id");

  useEffect(() => {
    if (!selectedInstallmentId) return;

    const inst = installments.find((i) => i.id === selectedInstallmentId);

    if (inst) {
      setValue("amount", parseFloat(inst.balance));
    }
  }, [selectedInstallmentId, installments, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
      setInstallments([]);
    }

    if (defaultLoanId) {
      setValue("loan_id", defaultLoanId);
    }
  }, [open, defaultLoanId, reset, setValue]);

  const onSubmit = (data: PaymentFormData) => {
    createPayment(data, {
      onSuccess: onClose,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 py-2">
            {/* Prestamo */}
            <div className="flex flex-col gap-1.5">
              <Label>Préstamo *</Label>

              {loadingLoans ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Cargando préstamos...
                </div>
              ) : (
                <Select
                  value={selectedLoanId ? String(selectedLoanId) : ""}
                  onValueChange={(v) => {
                    setValue("loan_id", Number(v));

                    setValue("installment_id", null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un préstamo" />
                  </SelectTrigger>

                  <SelectContent>
                    {loans.map((loan) => (
                      <SelectItem key={loan.id} value={String(loan.id)}>
                        {loan.client.full_name} — Saldo: $
                        {parseFloat(loan.balance).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {errors.loan_id && (
                <p className="text-xs text-destructive">
                  {errors.loan_id.message}
                </p>
              )}
            </div>

            {/* Cuotas */}
            {installments.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Cuota a pagar</Label>

                <Select
                  value={
                    selectedInstallmentId
                      ? String(selectedInstallmentId)
                      : "none"
                  }
                  onValueChange={(v) =>
                    setValue("installment_id", v === "none" ? null : Number(v))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuota (opcional)" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">Abono libre</SelectItem>

                    {installments.map((inst) => (
                      <SelectItem key={inst.id} value={String(inst.id)}>
                        Cuota #{inst.installment_number} — Vence:{" "}
                        {inst.due_date} — ${parseFloat(inst.balance).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Saldo */}
            {selectedLoan && (
              <div className="bg-muted rounded-md px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Saldo pendiente del préstamo
                </span>

                <span className="text-sm font-medium">
                  ${parseFloat(selectedLoan.balance).toFixed(2)}
                </span>
              </div>
            )}

            {/* Monto y fecha */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount">Monto *</Label>

                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...register("amount")}
                />

                {errors.amount && (
                  <p className="text-xs text-destructive">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="payment_date">Fecha de pago *</Label>

                <Input
                  id="payment_date"
                  type="date"
                  {...register("payment_date")}
                />

                {errors.payment_date && (
                  <p className="text-xs text-destructive">
                    {errors.payment_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Metodo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Método de pago</Label>

                <Select
                  value={watch("method")}
                  onValueChange={(v) =>
                    setValue("method", v as "cash" | "transfer" | "other")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>

                    <SelectItem value="transfer">Transferencia</SelectItem>

                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reference">Referencia</Label>

                <Input
                  id="reference"
                  placeholder="# comprobante"
                  {...register("reference")}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas</Label>

              <Input
                id="notes"
                placeholder="Observaciones del pago..."
                {...register("notes")}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Registrar pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
