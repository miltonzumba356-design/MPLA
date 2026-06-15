/**
 * Design System — MPLA · ClacsListening
 * Paleta: Vermelho #CC0000 · Preto #111111 · Dourado #B8960C
 */
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../lib/utils'

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
        hover && 'hover:shadow-[0_4px_16px_rgba(204,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return <div className={cn('px-6 py-4 border-b border-[#E2E8F0]', className)}>{children}</div>
}

export function CardTitle({ children, className }) {
  return <h3 className={cn('text-sm font-bold text-[#111111]', className)}>{children}</h3>
}

export function CardContent({ children, className }) {
  return <div className={cn('p-6', className)}>{children}</div>
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeVariants = {
  default: 'bg-[#E2E8F0] text-[#64748B]',
  blue:    'bg-[#FFE5E5] text-[#CC0000]',
  gold:    'bg-[#FBF6E3] text-[#8A6E08]',
  green:   'bg-[#E8FAF0] text-[#1DB865]',   // mantido para sentimento positivo
  yellow:  'bg-[#FEF3C7] text-[#D97706]',
  navy:    'bg-[#7A0000] text-white',
  // ⚠️ sem red — substituído por gold-dark para negativo
  negative: 'bg-[#FBF6E3] text-[#8A6E08]',
  red:      'bg-[#FBF6E3] text-[#8A6E08]',  // alias — usa dourado em vez de vermelho
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
const btnVariants = {
  primary: 'bg-[#CC0000] text-white hover:bg-[#7A0000] shadow-[0_4px_20px_rgba(204,0,0,0.28)]',
  gold:    'bg-[#B8960C] text-white hover:bg-[#8A6E08] shadow-[0_4px_20px_rgba(184,150,12,0.25)]',
  outline: 'border border-[#E2E8F0] text-[#111111] hover:bg-[#F5F5F5] hover:border-[#CC0000]',
  ghost:   'text-[#64748B] hover:bg-[#FFE5E5] hover:text-[#CC0000]',
  light:   'bg-[#FFE5E5] text-[#CC0000] hover:bg-[#d0e4f5]',
}

export function Button({ children, variant = 'primary', size = 'md', className, disabled, ...props }) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-8 py-3.5 text-base' }
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        btnVariants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ className, icon, ...props }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">{icon}</span>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#111111]',
          'placeholder:text-[#94A3B8] outline-none bg-white',
          'focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 transition-all',
          icon && 'pl-10',
          className
        )}
        {...props}
      />
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, delta, deltaPositive = true, icon, accent }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{label}</span>
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: accent ? `${accent}18` : '#FFE5E5', color: accent || '#CC0000' }}>
              {icon}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold mb-1"
          style={{ color: accent || '#111111' }}>
          {value}
        </div>
        {delta && (
          <div className={cn(
            'text-xs font-medium flex items-center gap-1',
            deltaPositive ? 'text-[#1DB865]' : 'text-[#B8960C]'  // dourado em vez de vermelho para negativo
          )}>
            {deltaPositive
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />} {delta}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">{title}</h1>
        {subtitle && <p className="text-sm text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </motion.div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ emoji = '🔍', title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-base font-semibold text-[#111111] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#64748B] max-w-xs">{description}</p>}
    </motion.div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{ width: size, height: size }}
      className="border-2 border-[#E2E8F0] border-t-[#CC0000] rounded-full"
    />
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn('w-11 h-6 rounded-full relative transition-colors duration-200',
        checked ? 'bg-[#CC0000]' : 'bg-[#CBD5E1]')}>
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  )
}

// ─── FilterPill ───────────────────────────────────────────────────────────────
export function FilterPill({ label, active, onClick, color }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
        active
          ? 'text-white border-transparent'
          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CC0000] hover:text-[#CC0000]'
      )}
      style={active ? { background: color || '#CC0000' } : {}}>
      {label}
    </motion.button>
  )
}

// ─── SectionDivider ──────────────────────────────────────────────────────────
export function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-[#E2E8F0]" />
      <div className="w-2 h-2 rounded-full bg-[#B8960C]" />
      <div className="flex-1 h-px bg-[#E2E8F0]" />
    </div>
  )
}
