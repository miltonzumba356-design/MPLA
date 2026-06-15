import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { PROVINCIAS } from '../data/mock'

export default function ProvinciaSelector({ value, onChange }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2.5">
        <MapPin size={13} style={{ color: 'var(--red)' }} />
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Filtrar por Província</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {PROVINCIAS.map(p => (
          <motion.button
            key={p}
            onClick={() => onChange(p)}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={
              value === p
                ? { background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }
                : { background: '#fff', color: '#64748B', borderColor: '#E2E8F0' }
            }
          >
            {p}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
