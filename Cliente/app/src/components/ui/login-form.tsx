import { FormEvent, ReactNode, useState } from "react"
import { AlertTriangle, Eye, EyeOff, Mail, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

interface LoginFormProps {
  email: string
  password: string
  loading?: boolean
  error?: string
  logo?: ReactNode
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDemoCredentials?: () => void
  className?: string
}

export default function LoginForm({
  email,
  password,
  loading = false,
  error = "",
  logo,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onDemoCredentials,
  className,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("flex min-h-[700px] w-full overflow-hidden rounded-2xl bg-white shadow-[0_18px_55px_rgba(13,61,82,0.10)]", className)}>
      <div className="relative hidden w-full overflow-hidden md:block">
        <img
          className="h-full w-full object-cover"
          src="/imagens-mpla/mpla-16.jpeg"
          alt="MPLA"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#111111]/85 via-[#111111]/35 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-sm text-white">
          <div className="mb-4 h-1 w-20 rounded-full bg-[#B8960C]" />
          <h2 className="text-3xl font-bold leading-tight">
            Monitorizacao politica institucional
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Acesso reservado aos utilizadores autorizados do MPLA.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-10">
        <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col items-center justify-center">
          {logo && <div className="mb-8">{logo}</div>}

          <div className="mb-4 flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "var(--blue-light)" }}>
            <Shield size={14} style={{ color: "var(--blue)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--blue)" }}>
              Acesso restrito MPLA
            </span>
          </div>

          <h1 className="text-4xl font-semibold" style={{ color: "var(--text)" }}>
            Entrar
          </h1>
          <p className="mt-3 text-center text-sm text-[#64748B]">
            Introduza as suas credenciais para continuar.
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
                style={{ background: "var(--gold-light)", color: "var(--gold-dark)", border: "1px solid #D4B44A" }}
              >
                <AlertTriangle size={14} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="my-6 flex w-full items-center gap-4">
            <div className="h-px w-full bg-[#E2E8F0]" />
            <p className="w-full text-nowrap text-center text-sm text-[#64748B]">
              credenciais institucionais
            </p>
            <div className="h-px w-full bg-[#E2E8F0]" />
          </div>

          <div className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-full border border-[#CBD5E1] bg-transparent pl-5 transition-colors focus-within:border-[#CC0000] focus-within:ring-2 focus-within:ring-[#CC0000]/20">
            <Mail size={16} className="text-[#64748B]" />
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="utilizador@mpla.ao"
              className="h-full w-full bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#94A3B8]"
              required
            />
          </div>

          <div className="mt-5 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full border border-[#CBD5E1] bg-transparent pl-5 pr-4 transition-colors focus-within:border-[#CC0000] focus-within:ring-2 focus-within:ring-[#CC0000]/20">
            <Shield size={16} className="text-[#64748B]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Palavra-passe"
              className="h-full w-full bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#94A3B8]"
              required
              minLength={4}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-[#94A3B8] transition-colors hover:text-[#64748B]"
              aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="mt-6 flex w-full items-center justify-between text-[#64748B]">
            <label className="flex items-center gap-2 text-sm">
              <input className="h-4 w-4 accent-[#CC0000]" type="checkbox" />
              Lembrar-me
            </label>
            <a className="text-sm underline" href="mailto:contacto@mpla.ao">
              Ajuda
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 h-11 w-full rounded-full bg-[#CC0000] text-sm font-semibold text-white transition-colors hover:bg-[#7A0000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          {onDemoCredentials && (
            <button
              type="button"
              onClick={onDemoCredentials}
              className="mt-4 text-sm font-semibold underline"
              style={{ color: "var(--gold-dark)" }}
            >
              Usar credenciais demo
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
