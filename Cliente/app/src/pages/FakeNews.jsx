import { useState, useEffect } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, ShieldCheck, ShieldAlert, ShieldOff, Send, Loader2, History } from 'lucide-react'
import { api } from '../api'
import { Card, CardContent, Badge, Button, Input, PageHeader, EmptyState, Spinner } from '../components/ui'
import { fadeUp, stagger } from '../lib/utils'

const VERDICT = {
  true:      { label: 'Campanha verdadeira', badge: 'green',  Icon: ShieldCheck },
  false:     { label: 'Campanha falsa',       badge: 'red',    Icon: ShieldOff   },
  uncertain: { label: 'Inconclusiva',         badge: 'yellow', Icon: ShieldAlert },
}

const LINK_SAFETY = {
  safe:       { label: 'Link seguro',             badge: 'green'   },
  suspicious: { label: 'Link suspeito',           badge: 'yellow'  },
  phishing:   { label: 'Possível phishing',       badge: 'red'     },
  malware:    { label: 'Possível malware',        badge: 'red'     },
  unknown:    { label: 'Segurança desconhecida',  badge: 'default' },
}

function ResultCard({ result }) {
  const v = VERDICT[result.verdict] || VERDICT.uncertain
  const l = LINK_SAFETY[result.link_safety] || LINK_SAFETY.unknown
  const VIcon = v.Icon

  return (
    <motion.div variants={fadeUp}>
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#FFE5E5', color: '#CC0000' }}>
              <VIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#111111] mb-1">{result.title}</h3>
              <a href={result.url} target="_blank" rel="noreferrer"
                className="text-xs text-[#64748B] hover:text-[#CC0000] flex items-center gap-1 truncate">
                <Link2 size={11} className="flex-shrink-0" /> <span className="truncate">{result.url}</span>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={v.badge}><VIcon size={11} /> {v.label}</Badge>
            <Badge variant={l.badge}>{l.label}</Badge>
            <Badge variant="default">Confiança: {Math.round((result.verdict_confidence || 0) * 100)}%</Badge>
          </div>

          {result.description && (
            <p className="text-xs text-gray-500 mb-3">{result.description}</p>
          )}

          {result.verdict_reasoning && (
            <p className="text-sm text-gray-700 leading-relaxed mb-2">{result.verdict_reasoning}</p>
          )}
          {result.link_reasoning && (
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{result.link_reasoning}</p>
          )}

          {result.risk_indicators?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#E8ECEF]">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Indicadores técnicos do link
              </p>
              <ul className="space-y-1">
                {result.risk_indicators.map((ind, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="mt-1 w-1 h-1 rounded-full bg-[#B8960C] flex-shrink-0" /> {ind}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function FakeNews() {
  const { activeProject } = useOutletContext()
  const { projectId } = useParams()
  const pid = projectId || activeProject?.id

  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl]                 = useState('')
  const [analysing, setAnalysing]     = useState(false)
  const [error, setError]             = useState('')
  const [result, setResult]           = useState(null)

  const [history, setHistory]               = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (!pid) return
    let cancelled = false
    setLoadingHistory(true)
    api.fakeNewsChecks(pid)
      .then(rows => { if (!cancelled) setHistory(rows) })
      .catch(() => { if (!cancelled) setHistory([]) })
      .finally(() => { if (!cancelled) setLoadingHistory(false) })
    return () => { cancelled = true }
  }, [pid])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !url.trim() || !pid) return
    setAnalysing(true)
    setError('')
    try {
      const res = await api.checkFakeNews({ project_id: Number(pid), title, description, url })
      setResult(res)
      setHistory(h => [res, ...h])
      setTitle(''); setDescription(''); setUrl('')
    } catch (err) {
      setError(err.message || 'Não foi possível concluir a análise.')
    } finally {
      setAnalysing(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Fake News"
        subtitle="Cola o link, o título e a descrição de uma campanha para verificar se é verdadeira e se o link é seguro"
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1.5 uppercase tracking-wider">
                Título da campanha
              </label>
              <Input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="ex: Governo vai distribuir subsidio de 50.000 Kz" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1.5 uppercase tracking-wider">
                Descrição
              </label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 transition-all resize-none bg-white"
                placeholder="Descreve o contexto da campanha ou notícia..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1.5 uppercase tracking-wider">
                Link a verificar
              </label>
              <Input icon={<Link2 size={14} />} value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://..." required />
            </div>

            {error && (
              <div className="text-sm text-[#CC0000] bg-[#FFE5E5] rounded-xl px-4 py-2.5">{error}</div>
            )}

            <Button type="submit" disabled={analysing || !title.trim() || !url.trim()}>
              {analysing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {analysing ? 'A analisar...' : 'Analisar campanha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && <ResultCard result={result} />}

      <div className="flex items-center gap-2 mb-3">
        <History size={14} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Histórico de verificações</span>
      </div>

      {loadingHistory ? (
        <div className="flex justify-center py-10"><Spinner size={28} /></div>
      ) : history.length === 0 ? (
        <EmptyState emoji="🕵️" title="Sem verificações ainda"
          description="Cola um link e os dados da campanha acima para começar." />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
          <AnimatePresence>
            {history.filter(h => h.id !== result?.id).map(h => <ResultCard key={h.id} result={h} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
