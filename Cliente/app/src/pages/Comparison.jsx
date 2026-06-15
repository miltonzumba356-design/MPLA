import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { competitorData, sentimentTimeline, mentionsByProvincia } from '../data/mock'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PageHeader } from '../components/ui'
import { ComparisonChart, ShareOfVoice } from '../components/Charts'
import { fadeUp } from '../lib/utils'
import { Plus } from 'lucide-react'
import ProvinciaSelector from '../components/ProvinciaSelector'

// Paleta CNE: azul + dourado + variações — sem vermelho, sem preto
const PARTY_COLORS = ['#CC0000', '#B8960C', '#5CB8DE', '#7DC4DC']

const compTimeline = sentimentTimeline.map(d => ({
  date: d.date,
  'MPLA':    d.positive,
  'UNITA':   Math.round(d.positive * 0.85),
  'FNLA':    Math.round(d.positive * 0.75),
  'CASA-CE': Math.round(d.positive * 0.65),
}))

export default function Comparison() {
  const { activeProject } = useOutletContext()
  const [provincia, setProvincia] = useState('Todas')

  return (
    <div>
      <PageHeader
        title="Análise Partidária"
        subtitle={`Presença e sentimento dos partidos${provincia !== 'Todas' ? ` · ${provincia}` : ''}`}
      >
        <Button variant="outline" size="sm">
          <Plus size={13} /> Adicionar partido
        </Button>
      </PageHeader>

      <ProvinciaSelector value={provincia} onChange={setProvincia} />

      {/* Overview table */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Presença digital dos partidos registados</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-xs text-[#64748B] uppercase tracking-wider">
                  {['Partido','Menções','Positivo','Negativo','Alcance','Presence Score'].map(h => (
                    <th key={h} className={`px-6 py-3 ${h === 'Partido' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitorData.map((c, i) => (
                  <tr key={c.name}
                    className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F5F5F5] transition-colors"
                    style={{ background: i === 0 ? 'var(--blue-light)' : undefined }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: PARTY_COLORS[i] }} />
                        <span className="font-bold" style={{ color: i === 0 ? 'var(--blue-dark)' : '#111111' }}>
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#111111]">
                      {c.mentions.toLocaleString('pt')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="blue">{c.positive}%</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="gold">{c.negative}%</Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-[#64748B]">
                      {(c.reach / 1_000_000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 text-right font-bold" style={{ color: PARTY_COLORS[i] }}>
                      {c.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Presence bars */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader><CardTitle>Presence Score por partido</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {competitorData.map((c, i) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: PARTY_COLORS[i] }} />
                      <span className="font-semibold text-[#111111]">{c.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: PARTY_COLORS[i] }}>{c.score}/100</span>
                  </div>
                  <div className="h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: PARTY_COLORS[i] }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Share of voice */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader><CardTitle>Share of Voice — Menções</CardTitle></CardHeader>
            <CardContent>
              <ShareOfVoice data={competitorData} colors={PARTY_COLORS} height={220} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sentiment comparison */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sentimento positivo — comparação histórica</CardTitle>
              <div className="flex gap-4 text-xs text-[#64748B]">
                {competitorData.map((c, i) => (
                  <span key={c.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: PARTY_COLORS[i] }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              data={compTimeline}
              brands={['MPLA', 'UNITA', 'FNLA', 'CASA-CE']}
              colors={PARTY_COLORS}
              height={220}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
