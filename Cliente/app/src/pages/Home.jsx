import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart2, Bell, MessageSquare, TrendingUp, Globe, Shield,
  ChevronRight, Zap, CalendarDays, Landmark, Mail, Phone, ExternalLink, Star
} from 'lucide-react'
import { fadeUp, stagger } from '../lib/utils'
import { Button, Card, CardContent } from '../components/ui'
import { cneInfo } from '../data/mock'
import CNELogo from '../components/CNELogo'
import { ShuffleGrid } from '../components/ui/shuffle-grid'
import { Footer } from '../components/ui/modem-animated-footer'
import { Gallery4 } from '../components/ui/gallery4'

const FEATURES = [
  { icon: Bell, title: 'Alertas em Tempo Real', desc: 'Acompanha mencoes ao MPLA, aos dirigentes, a JMPLA, a OMA e a temas sensiveis em imprensa e redes sociais.' },
  { icon: MessageSquare, title: 'Feed de Mencoes Politicas', desc: 'Centraliza publicacoes, noticias, comentarios e tendencias relevantes num painel unico.' },
  { icon: TrendingUp, title: 'IA com Contexto Angolano', desc: 'Classifica sentimento, alcance, temas emergentes e riscos reputacionais no portugues usado em Angola.' },
  { icon: Globe, title: 'Fontes Angolanas', desc: 'Monitoriza imprensa nacional, Facebook, Instagram, TikTok, X e canais digitais de debate publico.' },
  { icon: BarChart2, title: 'Relatorios Executivos', desc: 'Gera resumos diarios, semanais e personalizados para comunicacao, mobilizacao e estrategia.' },
  { icon: Shield, title: 'Analise Partidaria', desc: 'Compara presenca digital, share of voice e sentimento entre partidos e movimentos politicos.' },
]

const GALLERY_ITEMS = [
  { id: 'agenda', title: 'Agenda politica', description: 'Acompanhamento de temas, prioridades e mensagens publicas do partido.', href: '#agenda', image: '/imagens-mpla/mpla-16.jpeg' },
  { id: 'mobilizacao', title: 'Mobilizacao nacional', description: 'Leitura de actividade territorial, juventude, mulher e estruturas de base.', href: '#agenda', image: '/imagens-mpla/mpla-01.jpeg' },
  { id: 'comunicacao', title: 'Comunicacao oficial', description: 'Monitorizacao da recepcao publica aos comunicados e iniciativas do MPLA.', href: '#funcionalidades', image: '/imagens-mpla/mpla-06.jpeg' },
  { id: 'lideranca', title: 'Lideranca', description: 'Acompanhamento de mencoes aos dirigentes nacionais e provinciais.', href: '#lideranca', image: '/imagens-mpla/mpla-11.jpeg' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <CNELogo variant="color" height={38} />
          <div className="hidden md:flex gap-8">
            {[
              ['Funcionalidades', '#funcionalidades'],
              ['Agenda 2026', '#agenda'],
              ['Partidos', '#partidos'],
              ['Contacto', '#contacto'],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-[#64748B] hover:text-[#CC0000] transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#64748B] font-medium hover:text-[#111111]">Entrar</Link>
            <Link to="/login">
              <Button size="sm" variant="primary" className="rounded-full">Aceder ao sistema</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 text-center" style={{ background: 'linear-gradient(180deg,#fff 0%,#FFF7F7 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-6 border"
              style={{ color: '#7A6000', background: '#FBF6E3', borderColor: '#D4B44A' }}>
              <Landmark size={13} />
              MPLA - Angola - Monitorizacao Politica
            </motion.div>

            <h1 className="text-5xl md:text-[60px] font-extrabold leading-[1.1] mb-6" style={{ color: 'var(--red-darker)' }}>
              Social listening para<br />
              <span style={{ color: 'var(--red)' }}>comunicacao politica</span>
              <br />
              <span style={{ color: 'var(--gold)' }}>do MPLA</span>
            </h1>

            <p className="text-lg text-[#64748B] max-w-2xl mx-auto mb-10 leading-relaxed">
              Painel de reputacao, sentimento e actividade publica para acompanhar o MPLA, a agenda politica, os dirigentes, a JMPLA, a OMA e o debate nacional em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button variant="primary" size="lg" className="rounded-full">
                  Aceder ao painel <ChevronRight size={16} />
                </Button>
              </Link>
              <a href="#funcionalidades">
                <Button variant="outline" size="lg" className="rounded-full">Ver funcionalidades</Button>
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="mt-12">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-2xl" style={{ border: '2px solid var(--red-pale)' }}>
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/fTsyEXG6xS0?rel=0&modestbranding=1"
                  title="MPLA - Video institucional"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--red-darker)' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            ['1956', 'Fundacao do MPLA'],
            ['2026', 'Agenda politica'],
            ['1.045M', 'Cartoes emitidos'],
            ['18', 'Provincias monitorizadas'],
          ].map(([v, l]) => (
            <motion.div key={l} variants={fadeUp} className="text-center">
              <div className="text-4xl font-black mb-1" style={{ color: 'var(--gold)' }}>{v}</div>
              <div className="text-sm text-white/55">{l}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="funcionalidades" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-4" style={{ background: 'var(--red-pale)', color: 'var(--red)' }}>
              <Zap size={12} /> Funcionalidades do sistema
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--red-darker)' }}>Inteligencia para decisao politica</h2>
            <p className="text-[#64748B] text-lg max-w-lg mx-auto">Construido para equipas de comunicacao, mobilizacao e analise reputacional.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <motion.div key={f.title} variants={fadeUp}>
                <Card hover className="h-full">
                  <CardContent className="p-7">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--red-pale)', color: 'var(--red)' }}>
                      <f.icon size={22} />
                    </div>
                    <h3 className="font-bold text-[#111111] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="agenda" className="py-24 px-6" style={{ background: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.72fr_1.28fr] gap-12 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-4" style={{ background: 'var(--gold-light)', color: 'var(--gold-dark)' }}>
              <CalendarDays size={13} /> Agenda Politica 2026
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--red-darker)' }}>Leitura continua da opiniao publica</h2>
            <p className="text-[#64748B] text-lg leading-relaxed max-w-lg">
              Visualiza mencoes, temas em crescimento, percepcao publica e comparacao com outros partidos, com dados preparados para relatorios executivos.
            </p>
            <a href={`https://${cneInfo.website}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7A0000]" style={{ background: 'var(--red)' }}>
              Site oficial <ExternalLink size={16} />
            </a>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:-mr-8">
            <ShuffleGrid />
          </motion.div>
        </div>
      </section>

      <section id="lideranca" className="py-24 px-6" style={{ background: 'var(--red-darker)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 mx-auto" style={{ background: 'var(--gold)', border: '4px solid rgba(255,255,255,0.15)' }}>
              <Landmark size={32} color="white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{cneInfo.presidente}</h2>
            <p className="text-white/55 mb-2">Presidente do MPLA e Presidente da Republica</p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8" style={{ background: 'rgba(184,150,12,0.2)', color: 'var(--gold)' }}>
              <Star size={13} /> Direccao actual do partido
            </div>
            <blockquote className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto italic">"{cneInfo.missao}"</blockquote>
            <p className="text-sm text-white/40 mt-4">Vice-Presidente: {cneInfo.vicePresidente} - Secretario-Geral: {cneInfo.secretarioGeral}</p>
          </motion.div>
        </div>
      </section>

      <Gallery4 title="Actividade politica monitorizada" description="Registos e mockups visuais para acompanhar mobilizacao, comunicacao, lideranca e organizacao territorial." items={GALLERY_ITEMS} />

      <Footer
        brandName="MPLA"
        brandDescription={`${cneInfo.sede}. Sistema de monitorizacao politica, reputacao e percepcao publica.`}
        navLinks={[
          { label: 'Funcionalidades', href: '#funcionalidades' },
          { label: 'Agenda 2026', href: '#agenda' },
          { label: 'Partidos', href: '#partidos' },
          { label: 'Contacto', href: '#contacto' },
          { label: 'Entrar', href: '/login' },
        ]}
        socialLinks={[
          { icon: <Mail size={22} />, href: `mailto:${cneInfo.email}`, label: 'Email' },
          { icon: <Phone size={22} />, href: `tel:${cneInfo.telefone.replace(/\s/g, '')}`, label: 'Telefone' },
          { icon: <Globe size={22} />, href: `https://${cneInfo.website}`, label: 'Website' },
          { icon: <ExternalLink size={22} />, href: `https://${cneInfo.facebook}`, label: 'Facebook' },
        ]}
        brandIcon={<img src="/mpla-logo.png" alt="MPLA" className="h-12 w-12 object-contain sm:h-16 sm:w-16 md:h-20 md:w-20" style={{ mixBlendMode: 'multiply' }} />}
      />
    </div>
  )
}

