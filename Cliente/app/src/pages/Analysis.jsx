import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Eye, Activity } from 'lucide-react'
import { sentimentTimeline, mentionVolume, sourceBreakdown, topInfluencers, mentionsByProvincia } from '../data/mock'
import { Card, CardHeader, CardTitle, CardContent, StatCard, PageHeader } from '../components/ui'
import { SentimentChart, VolumeBar, DonutChart } from '../components/Charts'
import { fadeUp, stagger } from '../lib/utils'
import ProvinciaSelector from '../components/ProvinciaSelector'

const PLT_COLOR = { instagram: '#E1306C', rss: '#F59E0B', tiktok: '#2D2D2D', facebook: '#1877F2' }

export default function Analysis() {
  const { activeProject } = useOutletContext()
  const [provincia, setProvincia] = useState('Todas')

  const provData = provincia === 'Todas'
    ? mentionsByProvincia
    : mentionsByProvincia.filter(p => p.provincia === provincia)

  const maxMentions = Math.max(...mentionsByProvincia.map(p => p.mentions))

  return (
    <div>
      <PageHeader title={`Análise — ${activeProject?.name}`} subtitle={`Últimos 9 dias${provincia !== 'Todas' ? ` · ${provincia}` : ''}`} />

      <ProvinciaSelector value={provincia} onChange={setProvincia} />

      {/* KPI strip */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total menções',    value: '1.243', delta: '+8%',   icon: <TrendingUp size={14} /> },
          { label: 'Alcance total',    value: '4.1M',  delta: '+15%',  icon: <Eye size={14} /> },
          { label: 'Presence Score',   value: '88',    delta: '+3pt',  icon: <Activity size={14} />, accent: '#CC0000' },
          { label: 'Score sentimento', value: '+0.71', delta: '+0.05', icon: <Users size={14} />,    accent: '#3B82F6' },
        ].map(s => (
          <motion.div key={s.label} variants={fadeUp}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Top influencers */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4 mb-6">
        {topInfluencers.slice(0, 2).map((inf, i) => (
          <motion.div key={inf.name} variants={fadeUp}>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: i === 0 ? '#CC0000' : '#3B82F6' }}>
                  {inf.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">#{i + 1} Influencer mais activo</p>
                  <p className="font-bold text-[#111111]">{inf.name}</p>
                  <p className="text-sm text-gray-500">{inf.followers.toLocaleString('pt')} seguidores · {inf.mentions} menções</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <motion.div className="lg:col-span-2" variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tendência de Sentimento</CardTitle>
                <div className="flex gap-4 text-xs text-gray-500">
                  {[['Positivo','#CC0000'],['Negativo','#B8960C'],['Neutro','#94A3B8']].map(([l,c]) => (
                    <span key={l} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent><SentimentChart data={sentimentTimeline} height={200} /></CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardHeader><CardTitle>Fontes de menções</CardTitle></CardHeader>
            <CardContent>
              <DonutChart data={sourceBreakdown} height={150} />
              <div className="space-y-2 mt-4">
                {sourceBreakdown.map(s => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 text-gray-600">{s.name}</span>
                    <span className="font-semibold">{s.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader><CardTitle>Volume de menções — 9 dias</CardTitle></CardHeader>
            <CardContent><VolumeBar data={mentionVolume} height={180} /></CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader><CardTitle>Top Influencers & Fontes</CardTitle></CardHeader>
            <CardContent className="p-0">
              {topInfluencers.map((inf, i) => (
                <div key={inf.name}
                  className="flex items-center gap-3 px-6 py-3 border-b border-[#E8ECEF] last:border-0 hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: PLT_COLOR[inf.platform] || '#64748B' }}>
                    {inf.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">{inf.name}</p>
                    <p className="text-xs text-gray-400">{inf.followers.toLocaleString('pt')} seguidores</p>
                  </div>
                  <span className="text-sm font-bold"
                    style={{ color: inf.sentiment === 'positive' ? '#CC0000' : '#F59E0B' }}>
                    {inf.mentions}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Menções por Província */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Menções por Província</CardTitle>
              <span className="text-xs text-[#64748B]">{provincia === 'Todas' ? '18 províncias' : provincia}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(provincia === 'Todas' ? mentionsByProvincia : provData).map((p, i) => (
              <div key={p.provincia}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-[#111111] w-36 flex-shrink-0">{p.provincia}</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.mentions / maxMentions) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.03, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: 'var(--red)' }}
                      />
                    </div>
                    <span className="font-bold text-[#111111] w-12 text-right">{p.mentions.toLocaleString('pt')}</span>
                    <span className="text-[#1DB865] w-10 text-right">{p.positive}%+</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
