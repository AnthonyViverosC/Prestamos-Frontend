import { Outlet } from "react-router-dom";
import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: BarChart3,
    title: "Control total de tu cartera",
    description:
      "Visualiza saldo, mora y avance de cobranza en un solo panel claro.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad y trazabilidad",
    description:
      "Cada operación queda registrada con respaldo y permisos definidos.",
  },
  {
    icon: Sparkles,
    title: "Operación sin fricción",
    description:
      "Formularios cortos, atajos y validaciones que aceleran tu día a día.",
  },
];

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Panel de marca — visible solo en desktop */}
        <aside className="relative hidden overflow-hidden bg-[#0b1f4d] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_40%),linear-gradient(135deg,#081a44_0%,#0b1f4d_55%,#0a1638_100%)]" />
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between px-10 py-12 text-white xl:px-16 xl:py-14">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#0b1f4d] shadow-lg shadow-blue-950/40">
                P
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Prestamos<span className="text-sky-300">Pro</span>
              </span>
            </div>

            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-sky-200 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Plataforma para asesores
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight xl:text-[2.7rem]">
                Gestiona tu cartera con
                <span className="block text-sky-300">claridad y control.</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                Una experiencia diseñada para prestar, hacer seguimiento y
                cobrar sin perder contexto en ningún paso.
              </p>

              <ul className="mt-10 space-y-4">
                {highlights.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sky-300 backdrop-blur">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-300/90">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <p>© {new Date().getFullYear()} PrestamosPro</p>
              <div className="flex gap-5">
                <span className="transition-colors hover:text-slate-200">
                  Términos
                </span>
                <span className="transition-colors hover:text-slate-200">
                  Privacidad
                </span>
                <span className="transition-colors hover:text-slate-200">
                  Soporte
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Panel de formulario */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Cabecera de marca para mobile */}
            <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b1f4d] text-lg font-bold text-white shadow-lg shadow-blue-900/30">
                P
              </div>
              <p className="text-base font-semibold tracking-tight text-slate-900">
                Prestamos<span className="text-primary">Pro</span>
              </p>
            </div>
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
