import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Client } from "@/shared/types/client.types";
import {
  useCreateClient,
  useUpdateClient,
} from "../../../shared/hooks/useClients";
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

const clientSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  dni: z.string().max(20).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z
    .string()
    .email("Ingresa un correo válido")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "defaulter"]),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}

export function ClientForm({ open, onClose, client }: Props) {
  const isEditing = !!client;
  const { mutate: create, isPending: creating } = useCreateClient();
  const { mutate: update, isPending: updating } = useUpdateClient(
    client?.id ?? 0,
  );
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: "",
      dni: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      notes: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        full_name: client.full_name,
        dni: client.dni ?? "",
        phone: client.phone ?? "",
        email: client.email ?? "",
        address: client.address ?? "",
        city: client.city ?? "",
        notes: client.notes ?? "",
        status: client.status,
      });
      return;
    }

    reset({
      full_name: "",
      dni: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      notes: "",
      status: "active",
    });
  }, [client, reset]);

  const onSubmit = (data: ClientFormData) => {
    if (isEditing) {
      update(data, { onSuccess: onClose });
      return;
    }

    const payload = {
      full_name: data.full_name,
      dni: data.dni ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
      notes: data.notes ?? "",
    };
    create(payload, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEditing ? "Editar cliente" : "Nuevo cliente"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {isEditing
              ? "Actualiza la información de contacto y seguimiento."
              : "Registra los datos básicos para empezar a operar."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-6"
        >
          <Field
            id="full_name"
            label="Nombre completo"
            error={errors.full_name?.message}
            required
          >
            <Input
              id="full_name"
              placeholder="Ej. Juan Pérez"
              aria-invalid={!!errors.full_name}
              {...register("full_name")}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="dni" label="Documento">
              <Input id="dni" placeholder="12345678" {...register("dni")} />
            </Field>

            <Field
              id="phone"
              label="Teléfono"
              error={errors.phone?.message}
            >
              <Input
                id="phone"
                placeholder="+57 300 000 0000"
                {...register("phone")}
              />
            </Field>
          </div>

          <Field
            id="email"
            label="Correo electrónico"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="cliente@correo.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="city" label="Ciudad">
              <Input id="city" placeholder="Bogotá" {...register("city")} />
            </Field>

            {isEditing && (
              <Field label="Estado">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="defaulter">Moroso</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}
          </div>

          <Field id="address" label="Dirección">
            <Input
              id="address"
              placeholder="Calle 123 #45-67"
              {...register("address")}
            />
          </Field>

          <Field id="notes" label="Notas internas">
            <Textarea
              id="notes"
              placeholder="Ej. Cliente prefiere contacto por WhatsApp en la tarde."
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
              {isEditing ? "Guardar cambios" : "Crear cliente"}
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
