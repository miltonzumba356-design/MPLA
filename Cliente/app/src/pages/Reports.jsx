import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  FileText, Download, Send, Loader2, CheckCircle,
  CalendarDays, BarChart2, TrendingUp, Users, Link as LinkIcon,
  Star, Clock, GitCompare, MessageSquare, AlignLeft, PenLine,
  Mail, Plus, X, Phone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, Button, PageHeader, Toggle, Input } from '../components/ui'
import { fadeUp } from '../lib/utils'
import ProvinciaSelector from '../components/ProvinciaSelector'

const REPORT_TYPES = [
  { id: 'daily',   label: 'Diario',      desc: 'Resumo das ultimas 24h',    Icon: CalendarDays },
  { id: 'weekly',  label: 'Semanal',     desc: 'Resumo dos ultimos 7 dias', Icon: CalendarDays },
  { id: 'monthly', label: 'Mensal',      desc: 'Resumo do mes',             Icon: CalendarDays },
  { id: 'custom',  label: 'Customizado', desc: 'Periodo a escolha',         Icon: PenLine      },
]

const SECTIONS = [
  { id: 'summary',    label: 'Resumo de mencoes',       Icon: AlignLeft,    on: true  },
  { id: 'sentiment',  label: 'Grafico de sentimento',   Icon: TrendingUp,   on: true  },
  { id: 'sources',    label: 'Fontes de mencoes',       Icon: LinkIcon,     on: true  },
  { id: 'influencers',label: 'Top influencers',         Icon: Users,        on: true  },
  { id: 'topics',     label: 'Topicos em destaque',     Icon: Star,         on: true  },
  { id: 'recent',     label: 'Mencoes recentes',        Icon: Clock,        on: false },
  { id: 'comparison', label: 'Comparacao partidos',     Icon: GitCompare,   on: false },
  { id: 'quotes',     label: 'Citacoes seleccionadas',  Icon: MessageSquare,on: false },
]

const PAST_REPORTS = [
  { type: 'Diario',  title: 'Relatorio Diario — MPLA',  date: '05 Jun, 2026', whatsapp: true  },
  { type: 'Semanal', title: 'Relatorio Semanal — MPLA', date: '02 Jun, 2026', whatsapp: true  },
  { type: 'Diario',  title: 'Relatorio Diario — MPLA',  date: '04 Jun, 2026', whatsapp: false },
  { type: 'Diario',  title: 'Relatorio Diario — MPLA',  date: '03 Jun, 2026', whatsapp: true  },
]

export default function Reports() {
  const { activeProject } = useOutletContext()
  const [provincia, setProvincia] = useState('Todas')
  const [type, setType] = useState('daily')
  const [sections, setSections] = useState(
    Object.fromEntries(SECTIONS.map(s => [s.id, s.on]))
  )

  // Email
  const [sendEmail, setSendEmail] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')

  // WhatsApp multi-número
  const [sendWa, setSendWa] = useState(true)
  const [waNumbers, setWaNumbers] = useState(['+244 9'])
  const [waInput, setWaInput] = useState('')
  const [addingNumber, setAddingNumber] = useState(false)

  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  function toggleSection(id) {
    setSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function addWaNumber() {
    const n = waInput.trim()
    if (n && !waNumbers.includes(n)) {
      setWaNumbers(prev => [...prev, n])
    }
    setWaInput('')
    setAddingNumber(false)
  }

  function removeWaNumber(num) {
    setWaNumbers(prev => prev.filter(n => n !== num))
  }

  async function generate() {
    setDone(false)
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    setGenerating(false)
    setDone(true)
  }

  return (
    <div>
      <PageHeader title={`Relatorios — ${activeProject?.name}`} />

      <ProvinciaSelector value={provincia} onChange={setProvincia} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Tipo */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <CardHeader><CardTitle>Tipo de relatorio</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {REPORT_TYPES.map(rt => (
                    <button key={rt.id} onClick={() => setType(rt.id)}
                      className="p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: type === rt.id ? 'var(--red)' : 'var(--border)',
                        background:  type === rt.id ? '#FFF0F0' : '#fff',
                      }}>
                      <rt.Icon size={18} className="mb-2"
                        style={{ color: type === rt.id ? 'var(--red)' : '#94A3B8' }} />
                      <div className="text-sm font-semibold text-[#111111]">{rt.label}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{rt.desc}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Secções */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Incluir dados</CardTitle>
                  <button className="text-xs text-[#64748B] hover:text-[#CC0000]"
                    onClick={() => setSections(Object.fromEntries(SECTIONS.map(s => [s.id, true])))}>
                    Seleccionar tudo
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {SECTIONS.map(s => (
                    <button key={s.id} onClick={() => toggleSection(s.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                      style={{
                        borderColor: sections[s.id] ? 'var(--red)' : 'var(--border)',
                        background:  sections[s.id] ? '#FFF0F0' : '#fff',
                      }}>
                      <s.Icon size={14}
                        style={{ color: sections[s.id] ? 'var(--red)' : '#94A3B8', flexShrink: 0 }} />
                      <span className="text-xs font-medium text-[#111111] flex-1">{s.label}</span>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: sections[s.id] ? 'var(--red)' : '#D1D5DB',
                          background:  sections[s.id] ? 'var(--red)' : '#fff',
                        }}>
                        {sections[s.id] && <CheckCircle size={10} color="white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Envio por Email */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: sendEmail ? '#FFF0F0' : '#F5F5F5' }}>
                    <Mail size={18} style={{ color: sendEmail ? 'var(--red)' : '#94A3B8' }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#111111]">Enviar por Email</div>
                    <div className="text-xs text-[#64748B]">O relatorio sera enviado para o email indicado</div>
                  </div>
                  <Toggle checked={sendEmail} onChange={setSendEmail} />
                </div>

                <AnimatePresence>
                  {sendEmail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Input
                        icon={<Mail size={14} />}
                        type="email"
                        placeholder="exemplo@mpla.ao"
                        value={emailAddress}
                        onChange={e => setEmailAddress(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Envio por WhatsApp — múltiplos números */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: sendWa ? '#E8FAF0' : '#F5F5F5' }}>
                    <Phone size={18} style={{ color: sendWa ? '#1DB865' : '#94A3B8' }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#111111]">Enviar por WhatsApp</div>
                    <div className="text-xs text-[#64748B]">Pode adicionar varios numeros</div>
                  </div>
                  <Toggle checked={sendWa} onChange={setSendWa} />
                </div>

                <AnimatePresence>
                  {sendWa && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-2"
                    >
                      {/* Lista de números */}
                      {waNumbers.map(num => (
                        <div key={num} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                          <Phone size={13} className="text-[#1DB865] flex-shrink-0" />
                          <span className="text-sm text-[#111111] flex-1 font-mono">{num}</span>
                          <button onClick={() => removeWaNumber(num)}
                            className="text-[#94A3B8] hover:text-[#CC0000] transition-colors flex-shrink-0">
                            <X size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Adicionar número */}
                      <AnimatePresence>
                        {addingNumber ? (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="flex gap-2"
                          >
                            <Input
                              icon={<Phone size={14} />}
                              placeholder="+244 9XX XXX XXX"
                              value={waInput}
                              onChange={e => setWaInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && addWaNumber()}
                              className="flex-1"
                            />
                            <button onClick={addWaNumber}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors"
                              style={{ background: '#1DB865' }}>
                              Adicionar
                            </button>
                            <button onClick={() => { setAddingNumber(false); setWaInput('') }}
                              className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#E2E8F0] text-[#64748B] hover:bg-[#F5F5F5] transition-colors">
                              <X size={14} />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setAddingNumber(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#D1D5DB] text-xs text-[#64748B] hover:border-[#1DB865] hover:text-[#1DB865] transition-colors w-full"
                          >
                            <Plus size={13} /> Adicionar número
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gerar */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Button
              variant="primary"
              className="w-full justify-center py-4 rounded-2xl text-sm"
              onClick={generate}
              disabled={generating}
            >
              {generating && <Loader2 size={16} className="animate-spin" />}
              {done && <CheckCircle size={16} />}
              {generating ? 'A gerar relatorio...' : done ? 'Relatorio gerado com sucesso' : 'Gerar relatorio'}
            </Button>
          </motion.div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <CardHeader><CardTitle>Sobre os relatorios</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {[
                    'Gerados automaticamente por IA',
                    'Filtro por provincia disponivel',
                    'Envio por Email e WhatsApp',
                    'Multiplos destinatarios WhatsApp',
                    'Exportacao em PDF e Excel',
                    'Historico completo disponivel',
                  ].map(t => (
                    <li key={t} className="flex items-start gap-2 text-xs text-[#64748B]">
                      <CheckCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--red)' }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <CardHeader><CardTitle>Ultimos relatorios</CardTitle></CardHeader>
              <CardContent className="p-0">
                {PAST_REPORTS.map((r, i) => (
                  <div key={i}
                    className="flex items-start gap-3 px-5 py-3 border-b border-[#E2E8F0] last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#FFF0F0' }}>
                      <FileText size={14} style={{ color: 'var(--red)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#111111] truncate">{r.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#64748B]">{r.date}</span>
                        {r.whatsapp && (
                          <span className="flex items-center gap-1 text-xs text-[#1DB865]">
                            <Phone size={10} /> WA
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-[#64748B] hover:text-[#111111] transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
