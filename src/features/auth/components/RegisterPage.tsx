import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Check, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";

import { useRegister } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Ingresa un correo válido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { mutate: register, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password") ?? "";
  const passwordChecks = [
    { label: "Al menos 8 caracteres", valid: password.length >= 8 },
    { label: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Un número", valid: /\d/.test(password) },
  ];

  const onSubmit = (data: RegisterForm) => register(data);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/[0.04] sm:p-10">
      <header className="mb-7">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Crear cuenta
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Configura tu acceso para empezar a operar con tu cartera.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-800">
            Nombre completo
          </label>
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className="pl-11"
              {...formRegister("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs font-medium text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="pl-11"
              {...formRegister("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-800"
          >
            Contraseña
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
              {...formRegister("password")}
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
              {...formRegister("password_confirmation")}
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
          Crear cuenta
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
