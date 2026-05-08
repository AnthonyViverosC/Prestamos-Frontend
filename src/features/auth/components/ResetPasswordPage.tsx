import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useState } from "react";

import { useResetPassword } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const { mutate: resetPassword, isPending } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch("password") ?? "";
  const passwordChecks = [
    { label: "Al menos 8 caracteres", valid: password.length >= 8 },
    { label: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Un número", valid: /\d/.test(password) },
  ];

  const onSubmit = (data: FormData) =>
    resetPassword({ token, email, ...data });

  if (!token || !email) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/[0.04] sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Enlace inválido
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          El enlace de recuperación es incorrecto o ya expiró. Solicita uno
          nuevo desde la página de recuperación de contraseña.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to="/forgot-password">Solicitar nuevo enlace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/[0.04] sm:p-10">
      <header className="mb-7">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Nueva contraseña
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Crea una contraseña nueva para tu cuenta{" "}
          <span className="font-semibold text-slate-700">{email}</span>.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-800"
          >
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="pl-11 pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
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
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    check.valid ? "text-emerald-600" : "text-slate-400"
                  }`}
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
          {errors.password && (
            <p className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password_confirmation"
            className="text-sm font-medium text-slate-800"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="password_confirmation"
              type={showPassword ? "text" : "password"}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              aria-invalid={!!errors.password_confirmation}
              className="pl-11"
              {...register("password_confirmation")}
            />
          </div>
          {errors.password_confirmation && (
            <p className="text-xs font-medium text-destructive">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          Restablecer contraseña
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
      >
        <ArrowLeft size={14} />
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
