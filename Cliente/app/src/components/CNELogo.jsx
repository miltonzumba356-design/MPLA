export default function CNELogo({ variant = 'color', height = 38, className = '' }) {
  const style =
    variant === 'white'
      ? { height, width: 'auto', objectFit: 'contain', mixBlendMode: 'screen', filter: 'brightness(1.8)' }
      : variant === 'gold'
      ? { height, width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'sepia(1) saturate(3) hue-rotate(5deg)' }
      : { height, width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }

  return (
    <img
      src="/mpla-logo.png"
      alt="MPLA - Movimento Popular de Libertacao de Angola"
      style={style}
      className={className}
    />
  )
}

export function CNEIcon({ size = 36, variant = 'color', className = '' }) {
  const style =
    variant === 'white'
      ? { height: size, width: 'auto', objectFit: 'cover', objectPosition: 'left center', maxWidth: size * 1.2, mixBlendMode: 'screen', filter: 'brightness(1.8)' }
      : { height: size, width: 'auto', objectFit: 'cover', objectPosition: 'left center', maxWidth: size * 1.2, mixBlendMode: 'multiply' }

  return (
    <div
      className={`flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/mpla-logo.png"
        alt="MPLA"
        style={style}
      />
    </div>
  )
}

export function CNELogoSystem({ variant = 'color', height = 38, showSystem = true, className = '' }) {
  return (
    <div className={`flex flex-col items-start gap-0.5 ${className}`}>
      <CNELogo variant={variant} height={height} />
      {showSystem && (
        <span
          className="text-[9px] font-semibold tracking-widest uppercase"
          style={{ color: variant === 'white' ? 'rgba(255,255,255,0.5)' : '#B8960C' }}
        >
          Sistema de Monitorizacao Politica
        </span>
      )}
    </div>
  )
}
