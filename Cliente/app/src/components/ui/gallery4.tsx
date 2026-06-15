"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRef, useState } from "react"

export interface Gallery4Item {
  id: string
  title: string
  description: string
  href: string
  image: string
}

export interface Gallery4Props {
  title?: string
  description?: string
  items: Gallery4Item[]
}

export function Gallery4({
  title = "Galeria institucional",
  description = "Momentos e actividades politicas acompanhadas pelo sistema de monitorizacao.",
  items,
}: Gallery4Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  function scrollToIndex(index: number) {
    const scroller = scrollerRef.current
    if (!scroller) return

    const target = scroller.children[index] as HTMLElement | undefined
    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
    setCurrentSlide(index)
  }

  function scrollByDirection(direction: "prev" | "next") {
    const nextIndex =
      direction === "next"
        ? Math.min(currentSlide + 1, items.length - 1)
        : Math.max(currentSlide - 1, 0)

    scrollToIndex(nextIndex)
  }

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl" style={{ color: "var(--blue-dark)" }}>
              {title}
            </h2>
            <p className="text-base leading-relaxed text-[#64748B]">{description}</p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollByDirection("prev")}
              disabled={currentSlide === 0}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-[#111111] transition hover:border-[#CC0000] hover:text-[#CC0000] disabled:opacity-40"
              aria-label="Imagem anterior"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDirection("next")}
              disabled={currentSlide === items.length - 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-[#111111] transition hover:border-[#CC0000] hover:text-[#CC0000] disabled:opacity-40"
              aria-label="Imagem seguinte"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x gap-5 overflow-x-auto scroll-smooth px-6 pb-2 [scrollbar-width:none] md:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <a
            key={item.id}
            href={item.href}
            onFocus={() => setCurrentSlide(index)}
            className="group relative h-[27rem] w-[320px] shrink-0 snap-start overflow-hidden rounded-xl lg:w-[360px]"
          >
            <img
              src={item.image}
              alt={item.title}
              className="absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111111]/35 to-[#111111]/90" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-white md:p-8">
              <div className="mb-3 text-xl font-semibold">{item.title}</div>
              <div className="mb-8 line-clamp-2 text-sm leading-relaxed text-white/75">
                {item.description}
              </div>
              <div className="flex items-center text-sm font-semibold">
                Ver detalhes
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            className="h-2 w-2 rounded-full transition-colors"
            style={{ background: currentSlide === index ? "var(--blue)" : "rgba(49,167,216,0.22)" }}
            onClick={() => scrollToIndex(index)}
            aria-label={`Ir para imagem ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
