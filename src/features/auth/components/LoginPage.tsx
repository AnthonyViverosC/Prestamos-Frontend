import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Loader2, Mail } from "lucide-react";
import { useState } from "react";

import { useLogin } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => login(data);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/[0.04] sm:p-10">
      <header className="mb-7">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Iniciar sesión
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Accede con tu cuenta para gestionar clientes, préstamos y cobros.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-800"
          >
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
              aria-describedby={errors.email ? "email-error" : undefined}
              className="pl-11"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-800"
            >
              Contraseña
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
            >
              ¿La olvidaste?
            </button>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "password-error" : undefined
              }
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
          {errors.password && (
            <p
              id="password-error"
              className="text-xs font-medium text-destructive"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
          />
          Mantener la sesión iniciada
        </label>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Iniciar sesión
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Crear una ahora
        </Link>
      </p>
    </div>
  );
}
