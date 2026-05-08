import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Save,
  Shield,
  User,
} from "lucide-react";

import {
  useChangePassword,
  useUpdateProfile,
} from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type Tab = "profile" | "password";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo válido"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "La contraseña actual es requerida"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Configuración
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Mi cuenta
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Actualiza tu información personal y la contraseña de acceso.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar de tabs */}
        <nav className="flex gap-2 lg:flex-col">
          <TabButton
            active={tab === "profile"}
            onClick={() => setTab("profile")}
            icon={User}
            label="Perfil"
            description="Nombre y correo"
          />
          <TabButton
            active={tab === "password"}
            onClick={() => setTab("password")}
            icon={Shield}
            label="Contraseña"
            description="Cambiar contraseña"
          />
        </nav>

        {/* Contenido */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {tab === "profile" ? <ProfileSection /> : <PasswordSection />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof User;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
        active
          ? "border-primary/20 bg-primary/[0.06] text-primary"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-slate-100 text-slate-500 group-hover:bg-white",
        )}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs text-slate-500">
          {description}
        </span>
      </span>
    </button>
  );
}

function ProfileSection() {
  const user = useAuthStore((state) => state.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileForm) => {
    updateProfile(data, {
      onSuccess: (response) => {
        reset({
          name: response.user.name,
          email: response.user.email,
        });
      },
    });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "??";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <header className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-950">
          Información personal
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Esta información será visible en tu sesión y en los reportes.
        </p>
      </header>

      <div className="space-y-5 px-6 py-6">
        {/* Avatar y rol */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0b1f4d] text-base font-semibold text-white"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name ?? "—"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.role ? `Rol · ${user.role}` : "Sin rol asignado"}
            </p>
          </div>
        </div>

        <Field
          id="name"
          label="Nombre completo"
          error={errors.name?.message}
          required
        >
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className="pl-11"
              {...register("name")}
            />
          </div>
        </Field>

        <Field
          id="email"
          label="Correo electrónico"
          error={errors.email?.message}
          required
        >
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="pl-11"
              {...register("email")}
            />
          </div>
        </Field>
      </div>

      <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            user && reset({ name: user.name, email: user.email })
          }
          disabled={isPending || !isDirty}
        >
          Descartar
        </Button>
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Guardar cambios
        </Button>
      </footer>
    </form>
  );
}

function PasswordSection() {
  const { mutate: changePassword, isPending } = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const password = watch("password") ?? "";
  const passwordChecks = [
    { label: "Al menos 8 caracteres", valid: password.length >= 8 },
    { label: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Un número", valid: /\d/.test(password) },
  ];

  const onSubmit = (data: PasswordForm) => {
    changePassword(data, {
      onSuccess: () =>
        reset({
          current_password: "",
          password: "",
          password_confirmation: "",
        }),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <header className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-950">
          Cambiar contraseña
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Para mayor seguridad, las demás sesiones se cerrarán al cambiar tu
          contraseña.
        </p>
      </header>

      <div className="space-y-5 px-6 py-6">
        <Field
          id="current_password"
          label="Contraseña actual"
          error={errors.current_password?.message}
          required
        >
          <div className="relative">
            <KeyRound
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="current_password"
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={!!errors.current_password}
              className="pl-11 pr-11"
              {...register("current_password")}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              aria-label={
                showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

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
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              aria-invalid={!!errors.password}
              className="pl-11 pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
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
          label="Confirmar nueva contraseña"
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
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={!!errors.password_confirmation}
              className="pl-11"
              {...register("password_confirmation")}
            />
          </div>
        </Field>
      </div>

      <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            reset({
              current_password: "",
              password: "",
              password_confirmation: "",
            })
          }
          disabled={isPending || !isDirty}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Shield size={16} />
          )}
          Actualizar contraseña
        </Button>
      </footer>
    </form>
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
