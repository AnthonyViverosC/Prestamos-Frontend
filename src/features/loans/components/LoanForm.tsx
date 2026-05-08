import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLoan } from "@/shared/hooks/useLoans";
import { useClients } from "@/shared/hooks/useClients";
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
import {
  calculateAmortization,
  formatCurrency,
} from "../utils/calculator";
import { AmortizationTable } from "./AmortizationTable";

const loanSchema = z.object({
  client_id: z.coerce.number().int().positive("Selecciona un cliente"),
  principal_amount: z.coerce.number().positive("Debe ser mayor a 0"),
  interest_rate: z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .max(100, "Máximo 100%"),
  period_type: z.enum(["daily", "weekly", "monthly"]),
  period_count: z.coerce.number().int().min(1, "Mínimo 1 cuota"),
  start_date: z.string().min(1, "Selecciona una fecha"),
  late_fee_rate: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

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
  } = useForm<LoanFormData>({
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo préstamo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client_id">Cliente *</Label>
              <Controller
                control={control}
                name="client_id"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar cliente..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      {clientsData?.data.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.full_name}
                          {c.dni ? ` · ${c.dni}` : ""}
                        </SelectItem>
                      ))}
                      {clientsData?.data.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Sin resultados
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.client_id && (
                <p className="text-xs text-destructive">
                  {errors.client_id.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start_date">Fecha de inicio *</Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-xs text-destructive">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="principal_amount">Monto del préstamo *</Label>
              <Input
                id="principal_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000000"
                {...register("principal_amount")}
              />
              {errors.principal_amount && (
                <p className="text-xs text-destructive">
                  {errors.principal_amount.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="interest_rate">Tasa de interés (% por período) *</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="2.5"
                {...register("interest_rate")}
              />
              {errors.interest_rate && (
                <p className="text-xs text-destructive">
                  {errors.interest_rate.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Tipo de período *</Label>
              <Controller
                control={control}
                name="period_type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="period_count">Número de cuotas *</Label>
              <Input
                id="period_count"
                type="number"
                min="1"
                placeholder="12"
                {...register("period_count")}
              />
              {errors.period_count && (
                <p className="text-xs text-destructive">
                  {errors.period_count.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="late_fee_rate">Mora (% mensual)</Label>
              <Input
                id="late_fee_rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                {...register("late_fee_rate")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                placeholder="Información adicional..."
                {...register("notes")}
              />
            </div>
          </div>

          {/* Resumen y tabla en tiempo real */}
          <div className="grid grid-cols-3 gap-3 bg-muted/40 rounded-md p-3">
            <Stat label="Cuota" value={formatCurrency(calculation.installment)} />
            <Stat label="Total a pagar" value={formatCurrency(calculation.total)} />
            <Stat
              label="Interés total"
              value={formatCurrency(calculation.totalInterest)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tabla de amortización</Label>
            <AmortizationTable rows={calculation.rows} maxHeight="280px" />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Crear préstamo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
