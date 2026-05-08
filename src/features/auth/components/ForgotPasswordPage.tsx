import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react";

import { useForgotPassword } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => forgotPassword(data);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/[0.04] sm:p-10">
      <header className="mb-7">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Recuperar contraseña
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para
          crear una nueva contraseña.
        </p>
      </header>

      {isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <p className="font-semibold">Correo enviado</p>
          <p className="mt-1 leading-6">
            Si tu correo está registrado, recibirás en pocos minutos un enlace
            para restablecer tu contraseña. Revisa también tu carpeta de spam.
          </p>
        </div>
      ) : (
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
                className="pl-11"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

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
                Enviar enlace
                <Send size={16} />
              </>
            )}
          </Button>
        </form>
      )}

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
