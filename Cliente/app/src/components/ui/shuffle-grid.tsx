"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const squareData = [
  { id: 1,  src: "/imagens-mpla/mpla-01.jpeg", alt: "Reuniao politica institucional" },
  { id: 2,  src: "/imagens-mpla/mpla-02.jpeg", alt: "Encontro com bandeira de Angola" },
  { id: 3,  src: "/imagens-mpla/mpla-03.jpeg", alt: "Apresentacao de plano de trabalho" },
  { id: 4,  src: "/imagens-mpla/mpla-04.jpeg", alt: "Delegados em actividade publica" },
  { id: 5,  src: "/imagens-mpla/mpla-05.jpeg", alt: "Visita de campo" },
  { id: 6,  src: "/imagens-mpla/mpla-06.jpeg", alt: "Encontro institucional" },
  { id: 7,  src: "/imagens-mpla/mpla-07.jpeg", alt: "Plenario politico" },
  { id: 8,  src: "/imagens-mpla/mpla-08.jpeg", alt: "Cerimonia institucional" },
  { id: 9,  src: "/imagens-mpla/mpla-09.jpeg", alt: "Dirigente em reuniao" },
  { id: 10, src: "/imagens-mpla/mpla-10.jpeg", alt: "Sala de reunioes" },
  { id: 11, src: "/imagens-mpla/mpla-11.jpeg", alt: "Conferencia politica" },
  { id: 12, src: "/imagens-mpla/mpla-12.jpeg", alt: "Edificio institucional" },
  { id: 13, src: "/imagens-mpla/mpla-13.jpeg", alt: "Instalacoes institucionais" },
  { id: 14, src: "/imagens-mpla/mpla-14.jpeg", alt: "Cidadao em actividade publica" },
  { id: 15, src: "/imagens-mpla/mpla-15.jpeg", alt: "Instalacoes em Angola" },
  { id: 16, src: "/imagens-mpla/mpla-16.jpeg", alt: "Actividade institucional" },
]

const shuffle = (array: typeof squareData) => {
  const arr = [...array]
  let currentIndex = arr.length

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
  }

  return arr
}

const generateSquares = () => {
  return shuffle(squareData).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="h-full w-full overflow-hidden rounded-md bg-[#FFE5E5]"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label={sq.alt}
      role="img"
    />
  ))
}

export const ShuffleGrid = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [squares, setSquares] = useState(generateSquares)

  useEffect(() => {
    const shuffleSquares = () => {
      setSquares(generateSquares())
      timeoutRef.current = setTimeout(shuffleSquares, 3000)
    }

    shuffleSquares()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="grid h-[460px] grid-cols-4 grid-rows-4 gap-2 sm:h-[560px] lg:h-[640px]">
      {squares}
    </div>
  )
}
