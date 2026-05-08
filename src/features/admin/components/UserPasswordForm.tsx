import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminUser } from "../api/users.api";
import { useResetUserPassword } from "../hooks/useAdminUsers";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

export function UserPasswordForm({ open, onClose, user }: Props) {
  const { mutate: resetPassword, isPending } = useResetUserPassword();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  useEffect(() => {
    if (!open) {
      reset({ password: "", password_confirmation: "" });
      setShowPassword(false);
    }
  }, [open, reset]);

  const password = watch("password") ?? "";
  const passwordChecks = [
    { label: "Al menos 8 caracteres", valid: password.length >= 8 },
    { label: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Un número", valid: /\d/.test(password) },
  ];

  const onSubmit = (data: FormData) => {
    if (!user) return;
    resetPassword({ id: user.id, data }, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Cambiar contraseña
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Define una nueva contraseña para{" "}
            <span className="font-semibold text-slate-700">
              {user?.name ?? ""}
            </span>
            . Sus sesiones activas se cerrarán.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-6"
        >
          <Field
            id="password"
            label="Nueva contraseña"
            error={errors.password?.message}
            required
          >
            <div className="relative">
              <KeyRound
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                aria-invalid={!!errors.password}
                className="pl-11 pr-11"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && (
              <ul className="mt-2 grid gap-1 sm:grid-cols-3">
                {passwordChecks.map((check) => (
                  <li
                    key={check.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      check.valid ? "text-emerald-600" : "text-slate-400",
                    )}
                  >
                    <Check
                      size={12}
                      className={check.valid ? "" : "opacity-40"}
                    />
                    {check.label}
                  </li>
                ))}
              </ul>
            )}
          </Field>

          <Field
            id="password_confirmation"
            label="Confirmar contraseña"
            error={errors.password_confirmation?.message}
            required
          >
            <div className="relative">
              <KeyRound
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="password_confirmation"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={!!errors.password_confirmation}
                className="pl-11"
                {...register("password_confirmation")}
              />
            </div>
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
              Cambiar contraseña
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
  error,
  required,
  children,
}: {
  id?: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
