import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2, Tag, Users, Bell, Search, BarChart2 } from 'lucide-react'
import CNELogo from '../components/CNELogo'
import { Button, Input } from '../components/ui'

const STEPS = [
  { label: 'Keywords',      Icon: Tag   },
  { label: 'Comparacao',    Icon: Users },
  { label: 'Notificacoes',  Icon: Bell  },
]

const AREAS = [
  'Partido Politico', 'Agenda Politica', 'Analise Partidaria',
  'Comunicacao Institucional', 'Mobilizacao Territorial', 'Juventude e Mulher',
]

const STEP_ICONS = [Search, BarChart2, Bell]

export default function NewProject() {
  const [step, setStep]             = useState(0)
  const [name, setName]             = useState('')
  const [area, setArea]             = useState('')
  const [keywords, setKeywords]     = useState('')
  const [competitors, setCompetitors] = useState('')
  const [whatsapp, setWhatsapp]     = useState('')
  const [loading, setLoading]       = useState(false)
  const nav = useNavigate()

  async function finish() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    nav('/app/dashboard')
  }

  const canNext = step === 0 ? (name.trim() && keywords.trim()) : true
  const StepIllustIcon = STEP_ICONS[step]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 h-14 border-b border-[#E2E8F0]">
        <CNELogo variant="color" height={32} />
        <Link to="/app/dashboard"
          className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#111111] transition-colors">
          <ArrowLeft size={14} /> Voltar ao painel
        </Link>
      </div>

      <div className="flex flex-1">
        {/* Formulario */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-2xl mx-auto w-full">

          {/* Steps */}
          <div className="flex items-center gap-3 mb-10">
            {STEPS.map(({ label, Icon }, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: i <= step ? 'var(--blue)' : 'var(--border)',
                    color: '#fff',
                  }}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-sm font-medium"
                  style={{ color: i === step ? 'var(--text)' : '#94A3B8' }}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="w-8 h-px mx-1" style={{ background: 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0 — Keywords */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-[#111111] mb-2">
                  Definir area de monitorizacao
                </h1>
                <p className="text-[#64748B]">
                  Indica o nome e as keywords a monitorizar no discurso publico.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1.5 uppercase tracking-wider">
                  Nome da area
                </label>
                <Input value={name} onChange={e => setName(e.target.value)}
                  placeholder="ex: MPLA Oficial" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-2 uppercase tracking-wider">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map(a => (
                    <button key={a} onClick={() => setArea(a)}
                      className="px-4 py-2 rounded-xl border text-sm font-medium transition-all"
                      style={{
                        borderColor: area === a ? 'var(--blue)' : 'var(--border)',
                        background:  area === a ? 'var(--blue-light)' : '#fff',
                        color:       area === a ? 'var(--blue-dark)' : '#64748B',
                      }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1.5 uppercase tracking-wider">
                  Keywords / frases-chave
                </label>
                <Input value={keywords} onChange={e => setKeywords(e.target.value)}
                  placeholder="ex: MPLA, Joao Lourenco, JMPLA, OMA" required />
                <p className="text-xs text-[#94A3B8] mt-1.5">
                  Separa com virgulas. Inclui variantes e siglas.
                </p>
              </div>
            </div>
          )}

          {/* Step 1 — Comparacao */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-[#111111] mb-2">
                  Adicionar entidades a comparar
                </h1>
                <p className="text-[#64748B]">
                  Opcional — compara a presenca de diferentes partidos ou entidades.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1.5 uppercase tracking-wider">
                  Entidades / partidos
                </label>
                <textarea value={competitors} onChange={e => setCompetitors(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 transition-all resize-none bg-white"
                  placeholder="ex: MPLA, UNITA, FNLA (um por linha)" />
              </div>
              <div className="p-4 rounded-xl border border-[#FFB3B3] text-sm"
                style={{ background: 'var(--blue-light)', color: 'var(--blue-dark)' }}>
                A comparacao entre entidades aparece no separador "Comparacao" do painel.
              </div>
            </div>
          )}

          {/* Step 2 — Notificacoes */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-[#111111] mb-2">
                  Configurar notificacoes
                </h1>
                <p className="text-[#64748B]">
                  Recebe alertas e relatorios directamente no WhatsApp.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1.5 uppercase tracking-wider">
                  Numero WhatsApp
                </label>
                <div className="flex">
                  <div className="px-4 py-3 rounded-l-xl border border-r-0 text-sm text-[#64748B] bg-gray-50"
                    style={{ borderColor: 'var(--border)' }}>
                    +244
                  </div>
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-r-xl border text-sm outline-none focus:border-[#CC0000] transition bg-white"
                    style={{ borderColor: 'var(--border)' }}
                    placeholder="923 456 789" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Tipos de alerta
                </div>
                {[
                  { label: 'Alertas criticos',  desc: 'Crise reputacional, viral negativo',    always: true  },
                  { label: 'Alertas altos',     desc: 'Mencoes negativas com grande alcance',  always: false },
                  { label: 'Relatorio diario',  desc: 'Enviado as 07:00 UTC',                  always: false },
                  { label: 'Relatorio semanal', desc: 'Enviado a segunda-feira',               always: false },
                ].map(a => (
                  <div key={a.label}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] bg-white">
                    <div>
                      <div className="text-sm font-medium text-[#111111]">{a.label}</div>
                      <div className="text-xs text-[#64748B]">{a.desc}</div>
                    </div>
                    {a.always ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                        Sempre activo
                      </span>
                    ) : (
                      <div className="w-11 h-6 rounded-full relative cursor-pointer"
                        style={{ background: 'var(--blue)' }}>
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white shadow" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navegacao */}
          <div className="flex gap-3 mt-10">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={14} /> Anterior
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button variant="primary" className="flex-1 justify-center" onClick={() => setStep(s => s + 1)}
                disabled={!canNext}>
                Proximo <ArrowRight size={14} />
              </Button>
            ) : (
              <Button variant="primary" className="flex-1 justify-center" onClick={finish} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {loading ? 'A criar...' : 'Criar area de monitorizacao'}
              </Button>
            )}
          </div>
        </div>

        {/* Ilustracao lateral */}
        <div className="hidden lg:flex items-center justify-center w-1/2 p-12"
          style={{ background: 'var(--blue-xlight)' }}>
          <div className="text-center max-w-sm">
            <div className="w-28 h-28 mx-auto mb-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--blue-light)' }}>
              <StepIllustIcon size={52} style={{ color: 'var(--blue)' }} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-3">
              {step === 0 ? 'Monitorizacao inteligente'
                : step === 1 ? 'Analise comparativa'
                : 'Alertas institucionais'}
            </h3>
            <p className="text-[#64748B] text-sm leading-relaxed">
              {step === 0
                ? 'O motor do MPLA recolhe mencoes a cada 15 minutos de fontes angolanas, imprensa, redes sociais e Google.'
                : step === 1
                ? 'Compara a presenca digital dos partidos e entidades monitorizadas em tempo real.'
                : 'Recebe alertas no WhatsApp Business antes que uma mencao negativa ganhe impacto.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
