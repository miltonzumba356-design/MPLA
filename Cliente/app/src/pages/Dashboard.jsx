import { Link, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, ArrowUpRight, CalendarDays } from 'lucide-react'
import CNELogo from '../components/CNELogo'
import { stagger, fadeUp } from '../lib/utils'
import { Card, CardContent, Button, Badge, PageHeader, StatCard } from '../components/ui'
import { cneInfo } from '../data/mock'

function PresenceRing({ score }) {
  const r = 24, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 70 ? '#CC0000' : '#B8960C'

  return (
    <div className="relative w-14 h-14">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E2E8F0" strokeWidth="5" />
        <motion.circle
          cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
        style={{ color }}>{score}</span>
    </div>
  )
}

export default function Dashboard() {
  const { projects } = useOutletContext()

  return (
    <div>
      {/* Header institucional MPLA */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-5 rounded-2xl border flex items-center gap-4"
        style={{ background: 'var(--blue-light)', borderColor: '#FFB3B3' }}
      >
        <div className="flex-shrink-0">
          <CNELogo variant="color" height={36} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-[#111111]">{cneInfo.nome}</div>
          <div className="text-sm text-[#64748B]">
            Presidente: {cneInfo.presidente} · {cneInfo.membros} · Agenda 2026
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'var(--gold)', color: 'white' }}>
          <CalendarDays size={14} /> MPLA
        </div>
      </motion.div>

      <PageHeader title="Áreas de Monitorização" subtitle={`${projects.length} projectos activos`}>
        <Button as={Link} to="/app/new-project" size="md" variant="primary">
          <Plus size={15} /> Nova área
        </Button>
      </PageHeader>

      {/* KPI strip */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Menções totais',      value: '10.261', delta: '+22%'  },
          { label: 'Sentimento positivo', value: '72%',    delta: '+6pp'  },
          { label: 'Sentimento neutro',   value: '20%',    delta: '-2pp'  },
          { label: 'Alcance estimado',    value: '8.9M',   delta: '+14%'  },
        ].map((s, i) => (
          <motion.div key={s.label} variants={fadeUp}>
            <StatCard {...s} deltaPositive={i !== 2} />
          </motion.div>
        ))}
      </motion.div>

      {/* Projects table */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card>
          <div className="px-6 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Projectos de Monitorização
            </span>
            <span className="text-xs text-[#64748B]">Actualizado há 2 min</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {['Área','Presence Score','Menções','Estado',''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F5F5F5] transition-colors group"
                >
                  <td className="px-6 py-5">
                    <Link to={`/app/mentions/${p.id}`}
                      className="font-semibold text-[#111111] hover:text-[#CC0000] transition-colors flex items-center gap-2">
                      {p.name}
                      <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#64748B]">{p.industry}</span>
                      {p.newMentions > 0 && (
                        <Badge variant="gold">+{p.newMentions} novas</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5"><PresenceRing score={p.presenceScore} /></td>
                  <td className="px-6 py-5">
                    <span className="text-lg font-bold text-[#111111]">{p.total.toLocaleString('pt')}</span>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant="blue">Activo</Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-[#FFE5E5] text-[#64748B] hover:text-[#CC0000] transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-[#FBF6E3] text-[#64748B] hover:text-[#B8960C] transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>
      </motion.div>

      {/* Partidos quick list */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">
              Partidos Políticos Monitorizados
            </div>
            <div className="flex flex-wrap gap-2">
              {['MPLA','JMPLA','OMA','UNITA','FNLA','CASA-CE','P-NJANGO','PRS'].map(p => (
                <span key={p}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all hover:scale-105"
                  style={{ borderColor: 'var(--blue-light)', color: 'var(--blue-dark)', background: 'var(--blue-light)' }}>
                  {p}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
