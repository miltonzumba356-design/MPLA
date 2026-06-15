import { useState, type FormEvent } from "react"
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  RadioTower,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "register"

type AuthPayload = {
  mode: AuthMode
  name?: string
  company?: string
  email: string
  password: string
}

type AuthSwitchProps = {
  className?: string
  error?: string
  loading?: boolean
  onSubmit: (payload: AuthPayload) => void | Promise<void>
}

const FIELD_CLASS =
  "h-12 w-full rounded-xl border border-white/70 bg-white/80 px-4 text-sm text-[#1C1C2E] outline-none transition placeholder:text-slate-400 focus:border-[#2ED47A] focus:bg-white focus:ring-4 focus:ring-[#2ED47A]/15"

export default function AuthSwitch({
  className,
  error,
  loading = false,
  onSubmit,
}: AuthSwitchProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      mode,
      name: name.trim(),
      company: company.trim(),
      email,
      password,
    })
  }

  function fillDemo() {
    setMode("login")
    setEmail("admin@reservaao.ao")
    setPassword("admin1234")
  }

  return (
    <div
      className={cn(
        "grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 shadow-2xl shadow-[#16213E]/15 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]",
        className,
      )}
    >
      <aside className="relative hidden min-h-[620px] overflow-hidden bg-[#16213E] p-8 text-white lg:block">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(22,33,62,0.98),rgba(28,28,46,0.86)_48%,rgba(46,212,122,0.34))]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2ED47A] text-[#16213E]">
              <RadioTower size={21} />
            </div>
            <div>
              <div className="text-xl font-bold">
                Clacs<span className="text-[#2ED47A]">Listening</span>
              </div>
              <div className="text-xs text-white/55">Reputation intelligence</div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#A7F3C8]">
              <Sparkles size={14} /> Monitorização activa
            </div>
            <h2 className="max-w-sm text-4xl font-bold leading-tight">
              Uma entrada única para gerir sinais, crises e relatórios.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
              O painel junta menções, sentimento, concorrência e alertas numa experiência consistente com a landing page.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["1.243", "menções"],
                ["68%", "positivo"],
                ["15min", "alertas"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-2xl font-bold text-[#2ED47A]">{value}</div>
                  <div className="mt-1 text-xs text-white/55">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="p-5 sm:p-8 lg:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="lg:hidden">
            <div className="text-xl font-bold text-[#1C1C2E]">
              Clacs<span className="text-[#2ED47A]">Listening</span>
            </div>
            <div className="text-xs text-slate-500">Social listening para Angola</div>
          </div>
          <div className="ml-auto inline-flex rounded-full bg-[#16213E]/5 p-1">
            {[
              ["login", "Entrar"],
              ["register", "Criar conta"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value as AuthMode)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition-all sm:text-sm",
                  mode === value
                    ? "bg-[#16213E] text-white shadow-lg shadow-[#16213E]/20"
                    : "text-slate-500 hover:text-[#16213E]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8FAF0] px-3 py-1 text-xs font-semibold text-[#1DB865]">
            <ShieldCheck size={14} />
            Acesso protegido
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1C1C2E] sm:text-4xl">
            {mode === "login" ? "Entrar no painel" : "Começar monitorização"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === "login"
              ? "Usa as credenciais da tua equipa ou o acesso demo para abrir o dashboard."
              : "Cria o perfil inicial para preparar a tua marca, keywords e alertas."}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-[#FF4757]/15 bg-[#FFE4E6] px-4 py-3 text-sm font-medium text-[#FF4757]">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Maria Silva"
                  required
                />
              </Field>
              <Field label="Empresa">
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="ReservaAO"
                  required
                />
              </Field>
            </div>
          )}

          <Field label="Email profissional">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={FIELD_CLASS}
              placeholder="nome@empresa.ao"
              required
            />
          </Field>

          <Field label="Palavra-passe">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={cn(FIELD_CLASS, "pr-12")}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#16213E]"
                aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-slate-500">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-[#2ED47A]" />
              Manter sessão iniciada
            </label>
            {mode === "login" && (
              <a href="#" className="font-semibold text-[#1DB865]">
                Recuperar acesso
              </a>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2ED47A] text-sm font-bold text-white shadow-lg shadow-[#2ED47A]/25 transition-all hover:-translate-y-0.5 hover:bg-[#1DB865] disabled:translate-y-0 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="spin" /> : null}
            {mode === "login" ? "Entrar agora" : "Criar espaço de trabalho"}
            {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        <button
          type="button"
          onClick={fillDemo}
          className="mt-5 flex w-full items-center justify-center rounded-xl border border-[#2ED47A]/20 bg-[#E8FAF0] px-4 py-3 text-sm font-bold text-[#1DB865] transition hover:border-[#2ED47A]/40 hover:bg-[#DDF8EA]"
        >
          Usar acesso demo
        </button>
      </section>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#1C1C2E]">{label}</span>
      {children}
    </label>
  )
}

export const Component = AuthSwitch
