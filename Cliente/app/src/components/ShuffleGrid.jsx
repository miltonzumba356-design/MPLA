/**
 * ShuffleGrid — Componente de grelha de imagens animadas com shuffle automático
 * Adaptado de shuffle-grid.tsx para JSX + React 18 + framer-motion
 *
 * Usa imagens institucionais disponíveis em /imagens-mpla/
 * O shuffle ocorre a cada 3 segundos com animação spring suave.
 */

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays, CheckCircle, ChevronRight,
  FileText, Landmark, Users
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Imagens institucionais ──────────────────────────────────────────────────
const squareData = [
  { id: 1,  src: '/imagens-mpla/mpla-01.jpeg', alt: 'Sessao politica institucional' },
  { id: 2,  src: '/imagens-mpla/mpla-02.jpeg', alt: 'Reuniao com bandeira de Angola' },
  { id: 3,  src: '/imagens-mpla/mpla-03.jpeg', alt: 'Apresentacao de plano de trabalho' },
  { id: 4,  src: '/imagens-mpla/mpla-04.jpeg', alt: 'Delegados em actividade publica' },
  { id: 5,  src: '/imagens-mpla/mpla-05.jpeg', alt: 'Visita de campo' },
  { id: 6,  src: '/imagens-mpla/mpla-06.jpeg', alt: 'Encontro institucional' },
  { id: 7,  src: '/imagens-mpla/mpla-07.jpeg', alt: 'Plenario politico' },
  { id: 8,  src: '/imagens-mpla/mpla-08.jpeg', alt: 'Cerimonia institucional' },
  { id: 9,  src: '/imagens-mpla/mpla-09.jpeg', alt: 'Dirigente em reuniao' },
  { id: 10, src: '/imagens-mpla/mpla-10.jpeg', alt: 'Sala de reunioes' },
  { id: 11, src: '/imagens-mpla/mpla-11.jpeg', alt: 'Conferencia politica' },
  { id: 12, src: '/imagens-mpla/mpla-12.jpeg', alt: 'Edificio institucional' },
  { id: 13, src: '/imagens-mpla/mpla-13.jpeg', alt: 'Instalacoes institucionais' },
  { id: 14, src: '/imagens-mpla/mpla-14.jpeg', alt: 'Cidadao em actividade publica' },
  { id: 15, src: '/imagens-mpla/mpla-15.jpeg', alt: 'Instalacoes em Angola' },
]

// ─── Shuffle (Fisher-Yates) ───────────────────────────────────────────────────
function shuffle(array) {
  const arr = [...array]
  let currentIndex = arr.length
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
  }
  return arr
}

// ─── Gerar quadrados embaralhados ────────────────────────────────────────────
function generateSquares() {
  return shuffle(squareData).map(sq => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: 'spring' }}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      aria-label={sq.alt}
    />
  ))
}

// ─── Grelha com shuffle automático ───────────────────────────────────────────
function ShuffleGrid() {
  const timeoutRef = useRef(null)
  const [squares, setSquares] = useState(generateSquares)

  useEffect(() => {
    function shuffleSquares() {
      setSquares(generateSquares())
      timeoutRef.current = setTimeout(shuffleSquares, 3000)
    }
    shuffleSquares()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-2 h-[440px] w-full">
      {squares}
    </div>
  )
}

// ─── Preparativos 2027 — dados ────────────────────────────────────────────────
const ELECTIONS_TIMELINE = [
  { year: '1992', label: 'Primeiras eleicoes multipartidarias', done: true  },
  { year: '2008', label: 'Eleicoes Legislativas',               done: true  },
  { year: '2012', label: 'Eleicoes Gerais',                     done: true  },
  { year: '2017', label: 'Eleicoes Gerais',                     done: true  },
  { year: '2026', label: 'Agenda politica — em execucao',       done: false },
]

const UPDATES = [
  { date: '05 Jun 2026', text: 'MPLA reforca mobilizacao nacional e proximidade comunitaria.' },
  { date: '21 Mai 2026', text: 'Estruturas provinciais avaliam comunicacao e organizacao de base.' },
  { date: '20 Mai 2026', text: 'INDRA apresenta plano para solucao tecnologica e logistica.' },
  { date: '15 Mai 2026', text: 'JMPLA promove debates sobre emprego e participacao civica.' },
]

// ─── Componente principal exportado ──────────────────────────────────────────
export default function EleicoesShuffleSection() {
  return (
    <section
      id="agenda2026"
      className="py-24 px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header da secção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'var(--gold-light)', color: 'var(--gold-dark)' }}
          >
            <CalendarDays size={13} />
            Agenda Politica 2026
          </div>
          <h2
            className="text-4xl font-bold mb-3"
            style={{ color: 'var(--blue-dark)' }}
          >
            Estado actual dos preparativos
          </h2>
          <p className="text-[#64748B] max-w-xl mx-auto">
            O MPLA acompanha a agenda politica, mobilizacao territorial e percepcao publica em tempo real.
          </p>
        </motion.div>

        {/* Layout principal: texto + grelha */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 mb-16">

          {/* Coluna esquerda — conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Historico eleitoral */}
            <div className="mb-8">
              <div
                className="flex items-center gap-2 text-sm font-bold mb-4"
                style={{ color: 'var(--blue-dark)' }}
              >
                <Landmark size={16} style={{ color: 'var(--blue)' }} />
                Historico politico de Angola
              </div>
              <div className="relative">
                {/* Linha vertical */}
                <div
                  className="absolute left-[11px] top-2 bottom-2 w-0.5"
                  style={{ background: 'var(--blue-light)' }}
                />
                <div className="space-y-3">
                  {ELECTIONS_TIMELINE.map((e, i) => (
                    <motion.div
                      key={e.year}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 pl-2"
                    >
                      {/* Dot */}
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                        style={{
                          background: e.done ? 'var(--blue)' : 'var(--gold)',
                          border: '2px solid white',
                          boxShadow: '0 0 0 2px ' + (e.done ? 'var(--blue-light)' : 'var(--gold-light)'),
                        }}
                      >
                        {e.done
                          ? <CheckCircle size={13} color="white" />
                          : <CalendarDays size={13} color="white" />
                        }
                      </div>
                      <div className="flex-1 flex items-center justify-between py-2 border-b border-[#E2E8F0] last:border-0">
                        <span className="text-sm text-[#64748B]">{e.label}</span>
                        <span
                          className="text-sm font-bold ml-3 flex-shrink-0"
                          style={{ color: e.done ? 'var(--blue)' : 'var(--gold)' }}
                        >
                          {e.year}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ultimas actualizacoes */}
            <div className="mb-8">
              <div
                className="flex items-center gap-2 text-sm font-bold mb-4"
                style={{ color: 'var(--blue-dark)' }}
              >
                <FileText size={16} style={{ color: 'var(--blue)' }} />
                Ultimas actualizacoes
              </div>
              <div className="space-y-3">
                {UPDATES.map((u, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 p-3 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#FFB3B3] transition-colors"
                  >
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 h-fit"
                      style={{ background: 'var(--blue-light)', color: 'var(--blue-dark)' }}
                    >
                      {u.date}
                    </span>
                    <p className="text-xs text-[#64748B] leading-relaxed">{u.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Partidos registados */}
            <div>
              <div
                className="flex items-center gap-2 text-sm font-bold mb-3"
                style={{ color: 'var(--blue-dark)' }}
              >
                <Users size={16} style={{ color: 'var(--blue)' }} />
                Partidos politicos registados (8)
              </div>
              <div className="flex flex-wrap gap-2">
                {['MPLA','UNITA','FNLA','CASA-CE','P-NJANGO','PHA','PRS','APN'].map(p => (
                  <span
                    key={p}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all hover:scale-105 cursor-default"
                    style={{
                      borderColor: 'var(--blue-light)',
                      color: 'var(--blue-dark)',
                      background: 'var(--blue-light)',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <Link to="/login" className="mt-8 inline-flex">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold"
                style={{
                  background: 'var(--blue)',
                  boxShadow: '0 4px 20px rgba(49,167,216,0.30)',
                }}
              >
                Aceder ao sistema de monitorizacao
                <ChevronRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Coluna direita — Shuffle Grid com imagens institucionais */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ShuffleGrid />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
