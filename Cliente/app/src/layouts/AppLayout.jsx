import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MessageSquare, BarChart2, GitCompare,
  FileText, Plus, Bell, LogOut, ChevronRight,
  Menu, X, Mail, TrendingUp, CalendarDays, ShieldAlert
} from 'lucide-react'
import { projects, cneInfo } from '../data/mock'
import CNELogo from '../components/CNELogo'

const NAV = [
  { icon: MessageSquare, label: 'Menções',    to: 'mentions'   },
  { icon: BarChart2,     label: 'Análise',    to: 'analysis'   },
  { icon: GitCompare,    label: 'Comparação', to: 'comparison' },
  { icon: FileText,      label: 'Relatórios', to: 'reports'    },
  { icon: ShieldAlert,   label: 'Fake News',  to: 'fake-news'  },
]

export default function AppLayout() {
  const [open, setOpen]       = useState(true)
  const [expanded, setExpand] = useState(projects[0].id)
  const [active, setActive]   = useState(projects[0])
  const nav = useNavigate()

  const logout = () => { localStorage.removeItem('clacs_token'); nav('/login') }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F5F5' }}>

      {/* Sidebar MPLA */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 232, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-shrink-0 flex flex-col overflow-hidden"
            style={{ background: 'var(--sidebar)' }}
          >
            <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-white/10">
              <div className="flex items-center justify-between gap-2">
                <CNELogo variant="white" height={32} />
                <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Projecto activo highlight */}
            <div className="mx-3 my-3 p-3 rounded-xl" style={{ background: 'rgba(184,150,12,0.12)', border: '1px solid rgba(184,150,12,0.25)' }}>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-white/60">Agenda Politica</span>
                <span style={{ color: 'var(--gold)' }} className="font-bold">2026</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '35%' }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: 'var(--gold)' }}
                />
              </div>
              <div className="text-[10px] text-white/50 mt-1">Mobilizacao: 65% activa</div>
            </div>

            {/* Projectos */}
            <div className="px-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Áreas de Monitorização
                </span>
                <NavLink to="new-project" className="hover:text-white transition-colors" style={{ color: 'var(--gold)' }}>
                  <Plus size={13} />
                </NavLink>
              </div>

              {projects.map(p => (
                <div key={p.id} className="mb-1">
                  <button
                    onClick={() => { setActive(p); setExpand(expanded === p.id ? null : p.id) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all hover:bg-white/10"
                    style={{ color: active.id === p.id ? '#fff' : 'rgba(255,255,255,0.55)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: p.presenceScore >= 70 ? 'var(--gold)' : 'rgba(255,255,255,0.3)' }} />
                    <span className="flex-1 text-left truncate">{p.name}</span>
                    {p.newMentions > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white"
                        style={{ background: 'var(--gold)' }}>
                        +{p.newMentions}
                      </motion.span>
                    )}
                    <motion.div animate={{ rotate: expanded === p.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronRight size={11} className="text-white/30" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expanded === p.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-5 mt-0.5 border-l pl-3"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        {NAV.map(item => (
                          <NavLink
                            key={item.to}
                            to={`${item.to}/${p.id}`}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all mb-0.5 ${isActive
                                ? 'font-semibold'
                                : 'text-white/50 hover:bg-white/10 hover:text-white'}`
                            }
                            style={({ isActive }) => isActive ? {
                              color: 'var(--gold)',
                              background: 'rgba(184,150,12,0.12)',
                            } : {}}
                          >
                            <item.icon size={13} />
                            {item.label}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Relatórios */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40 px-1 block mb-2">
                  Relatórios
                </span>
                {[
                  [Mail,        'Email report'     ],
                  [FileText,    'PDF Institucional' ],
                  [BarChart2,   'Excel'            ],
                  [TrendingUp,  'Infografico'      ],
                ].map(([Icon, label]) => (
                  <NavLink key={label} to="reports"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:bg-white/10 hover:text-white transition-colors mt-0.5">
                    <Icon size={12} /> {label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Footer sidebar */}
            <div className="p-3 border-t border-white/10 flex-shrink-0">
              <div className="px-3 py-2 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-[10px] text-white/40 mb-0.5">MPLA Oficial</div>
                <div className="text-sm font-bold" style={{ color: 'var(--gold)' }}>1956</div>
                <div className="text-[10px] text-white/40">Angola em primeiro lugar</div>
              </div>
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/40 hover:bg-white/10 hover:text-white transition-colors">
                <LogOut size={13} /> Terminar sessão
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-6 h-14 bg-white border-b border-[#E2E8F0] flex-shrink-0 z-10">
          {!open && (
            <button onClick={() => setOpen(true)} className="text-[#64748B] hover:text-[#111111] transition-colors">
              <Menu size={18} />
            </button>
          )}
          <div className="flex items-center gap-1.5 text-sm text-[#94A3B8]">
            <LayoutDashboard size={14} />
            <span>/</span>
            <span className="text-[#111111] font-semibold">{active.name}</span>
          </div>
          <div className="flex-1" />

          {/* Agenda badge */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
            style={{ borderColor: 'var(--gold)', color: 'var(--gold-dark)', background: 'var(--gold-light)' }}>
            <CalendarDays size={12} /> Agenda 2026
          </motion.div>

          <div className="relative">
            <button className="p-2 text-[#64748B] hover:text-[#111111] transition-colors rounded-lg hover:bg-[#FFE5E5]">
              <Bell size={17} />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B8960C]" />
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: 'var(--blue-light)' }}>
            <img src="/mpla-logo.png" alt="MPLA"
              style={{ height: 22, width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ activeProject: active, projects }} />
        </main>
      </div>
    </div>
  )
}
