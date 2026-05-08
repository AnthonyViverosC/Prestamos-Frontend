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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import api from "@/shared/lib/axios";

const paymentSchema = z.object({
  loan_id: z.coerce.number().int().positive("Selecciona un prestamo"),
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

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoadingLoans(true);

    api
      .get("/loans", {
        params: {
          status: "active",
          per_page: 100,
        },
      })
      .then((response) => {
        setLoans(response.data.data ?? []);
      })
      .finally(() => {
        setLoadingLoans(false);
      });
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
    if (!selectedInstallmentId) {
      return;
    }

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Prestamo *</Label>

              {loadingLoans ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Cargando prestamos...
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un prestamo" />
                      </SelectTrigger>

                      <SelectContent>
                        {loans.map((loan) => (
                          <SelectItem key={loan.id} value={String(loan.id)}>
                            {loan.client.full_name} - Saldo: $
                            {parseFloat(loan.balance).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}

              {errors.loan_id && (
                <p className="text-xs text-destructive">
                  {errors.loan_id.message}
                </p>
              )}
            </div>

            {installments.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Cuota a pagar</Label>

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
                        <SelectValue placeholder="Selecciona una cuota (opcional)" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="none">Abono libre</SelectItem>

                        {installments.map((installment) => (
                          <SelectItem
                            key={installment.id}
                            value={String(installment.id)}
                          >
                            Cuota #{installment.installment_number} - Vence:{" "}
                            {installment.due_date} - $
                            {parseFloat(installment.balance).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {selectedLoan && (
              <div className="flex items-center justify-between rounded-md bg-muted px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Saldo pendiente del prestamo
                </span>

                <span className="text-sm font-medium">
                  ${parseFloat(selectedLoan.balance).toFixed(2)}
                </span>
              </div>
            )}

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

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Metodo de pago</Label>

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
