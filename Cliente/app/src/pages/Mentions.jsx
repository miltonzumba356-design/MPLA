import { useState, useEffect } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, ThumbsUp, ThumbsDown, Minus, Filter, Download } from 'lucide-react'
import { AreaChart } from '../components/Charts'
import { mentionsFeed, mentionVolume } from '../data/mock'
import { api } from '../api'
import { Card, CardContent, Badge, Button, Input, PageHeader, EmptyState, FilterPill, Spinner } from '../components/ui'
import { fadeUp, stagger } from '../lib/utils'
import ProvinciaSelector from '../components/ProvinciaSelector'

const PLT = {
  instagram:     { label: 'IG',  color: '#E1306C' },
  facebook:      { label: 'FB',  color: '#1877F2' },
  twitter:       { label: 'TW',  color: '#1DA1F2' },
  tiktok:        { label: 'TK',  color: '#2D2D2D' },
  google_reviews:{ label: 'GR',  color: '#34A853' },
  rss:           { label: 'RSS', color: '#F59E0B' },
}

const SENT = {
  positive: { badge: 'green',  label: 'Positivo', icon: ThumbsUp   },
  negative: { badge: 'red',    label: 'Negativo', icon: ThumbsDown },
  neutral:  { badge: 'default',label: 'Neutro',   icon: Minus      },
  mixed:    { badge: 'yellow', label: 'Misto',    icon: Minus      },
}

function MentionCard({ m, index }) {
  const plat = PLT[m.source] || { label: m.source?.slice(0,2).toUpperCase(), color: '#64748B' }
  const sent = SENT[m.sentiment] || SENT.neutral
  const SentIcon = sent.icon
  const date = new Date(m.publishedAt || m.published_at || m.collected_at || Date.now())
    .toLocaleDateString('pt', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      variants={fadeUp}
      layout
      className="bg-white rounded-2xl border border-[#E8ECEF] p-5 hover:shadow-md hover:border-[#D1D5DB] transition-all group"
    >
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
          style={{ background: plat.color }}
        >
          {(m.avatar || m.author || '?').slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="font-semibold text-sm text-[#1C1C2E]">{m.author || 'Anónimo'}</span>

            <span className="text-xs px-1.5 py-0.5 rounded font-bold text-white"
              style={{ background: plat.color }}>{plat.label}</span>

            <Badge variant={sent.badge}>
              <SentIcon size={10} /> {sent.label}
            </Badge>

            <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">{date}</span>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{m.content}</p>

          {/* Topics */}
          {m.topics?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {m.topics.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">#{t}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>👁 {(m.reach || m.reach_estimate || 0).toLocaleString('pt')}</span>
            <span>❤️ {m.engagement || 0}</span>
            {m.url && (
              <a href={m.url} target="_blank" rel="noreferrer"
                className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all hover:text-[#2ED47A]">
                <ExternalLink size={11} /> Ver original
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Mentions() {
  const { activeProject } = useOutletContext()
  const { projectId } = useParams()
  const pid = projectId || activeProject?.id

  const [mentions, setMentions] = useState(mentionsFeed)
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')
  const [sent, setSent]         = useState('all')
  const [src, setSrc]           = useState('all')
  const [provincia, setProvincia] = useState('Todas')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.mentions(pid, { sentiment: sent, source: src })
      .then(rows => {
        if (!cancelled) setMentions(
          rows.map(m => ({
            ...m,
            publishedAt: m.published_at || m.collected_at,
            reach: m.reach_estimate ?? 0,
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setMentions(mentionsFeed)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [pid, sent, src])

  const filtered = mentions.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.content?.toLowerCase().includes(q) || m.author?.toLowerCase().includes(q)
  })

  const SENT_OPTS = [
    { val: 'all',      label: 'Todas',   color: '#1C1C2E' },
    { val: 'positive', label: 'Positivo',color: '#CC0000' },
    { val: 'negative', label: 'Negativo',color: '#B8960C' },
    { val: 'neutral',  label: 'Neutro',  color: '#94A3B8' },
    { val: 'mixed',    label: 'Misto',   color: '#F59E0B' },
  ]

  const SRC_OPTS = [
    { val: 'all',           label: 'Todas'     },
    { val: 'instagram',     label: 'Instagram' },
    { val: 'facebook',      label: 'Facebook'  },
    { val: 'tiktok',        label: 'TikTok'    },
    { val: 'twitter',       label: 'Twitter'   },
    { val: 'rss',           label: 'Imprensa'  },
    { val: 'google_reviews',label: 'Google'    },
  ]

  return (
    <div>
      <PageHeader
        title={`Menções — ${activeProject?.name}`}
        subtitle={loading ? 'A carregar...' : `${filtered.length} menções${provincia !== 'Todas' ? ` · ${provincia}` : ''}`}
      >
        <Button variant="outline" size="sm">
          <Download size={13} /> Exportar
        </Button>
      </PageHeader>

      <ProvinciaSelector value={provincia} onChange={setProvincia} />

      {/* Volume chart */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-5">
        <Card>
          <CardContent className="py-4 px-5">
            <p className="text-xs font-semibold text-gray-400 mb-3">Volume — 9 dias</p>
            <AreaChart data={mentionVolume} height={72} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-3 mb-5">
        <Input
          icon={<Search size={14} />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por conteúdo ou autor..."
        />
        <div className="flex flex-wrap gap-2">
          {SENT_OPTS.map(o => (
            <FilterPill key={o.val} label={o.label} active={sent === o.val}
              onClick={() => setSent(o.val)} color={o.color} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SRC_OPTS.map(o => (
            <FilterPill key={o.val} label={o.label} active={src === o.val}
              onClick={() => setSrc(o.val)} color={PLT[o.val]?.color || '#1C1C2E'} />
          ))}
        </div>
      </motion.div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="Sem menções" description="Tenta ajustar os filtros ou aguarda a próxima colecta." />
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {filtered.map((m, i) => <MentionCard key={m.id || i} m={m} index={i} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
