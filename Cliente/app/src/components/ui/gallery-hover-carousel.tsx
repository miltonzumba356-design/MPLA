"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface GalleryHoverCarouselItem {
  id: string
  title: string
  summary: string
  url: string
  image: string
}

type GalleryHoverCarouselProps = {
  heading?: string
  demoUrl?: string
  items?: GalleryHoverCarouselItem[]
  className?: string
}

const defaultItems: GalleryHoverCarouselItem[] = [
  {
    id: "item-1",
    title: "Alertas em tempo real",
    summary:
      "Detecta menções negativas com alcance crescente e envia sinais rápidos para a equipa agir antes da crise.",
    url: "/login",
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "item-2",
    title: "Feed de menções",
    summary:
      "Junta Instagram, Facebook, TikTok, Google Reviews e imprensa num fluxo único para leitura e resposta.",
    url: "/login",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "item-3",
    title: "Análise de sentimento",
    summary:
      "Classifica perceção positiva, negativa, neutra ou mista com contexto do mercado angolano.",
    url: "/login",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "item-4",
    title: "Relatórios executivos",
    summary:
      "Transforma dados em resumos prontos para WhatsApp, PDF e reuniões de gestão.",
    url: "/login",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "item-5",
    title: "Comparação com concorrentes",
    summary:
      "Acompanha share of voice, alcance e reputação frente às marcas que disputam a mesma atenção.",
    url: "/login",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
]

export default function GalleryHoverCarousel({
  heading = "Tudo o que precisas",
  demoUrl = "/login",
  items = defaultItems,
  className,
}: GalleryHoverCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = items[activeIndex]

  useEffect(() => {
    api?.scrollTo(activeIndex)
  }, [activeIndex, api])

  function move(direction: number) {
    setActiveIndex((current) => (current + direction + items.length) % items.length)
  }

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-bold text-[#1C1C2E]">{heading}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
            Ferramentas poderosas construídas especificamente para o mercado angolano.
          </p>
        </div>
        <Button asChild>
          <a href={demoUrl}>
            Experimentar painel <ArrowRight size={16} />
          </a>
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative min-h-[460px] overflow-hidden rounded-[2rem] bg-[#16213E] shadow-2xl shadow-[#16213E]/10">
          <Carousel setApi={setApi} className="h-full">
            <CarouselContent
              className="h-full transition-transform duration-500"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {items.map((item) => (
                <CarouselItem key={item.id} className="relative min-h-[460px]">
                  <img
                    src={item.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(22,33,62,0.98),rgba(28,28,46,0.76)_48%,rgba(46,212,122,0.22))]" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 text-white md:p-8">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#A7F3C8]">
                0{activeIndex + 1} / 0{items.length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
                  aria-label="Próximo"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="max-w-xl">
              <h3 className="text-3xl font-bold leading-tight md:text-5xl">
                {activeItem.title}
              </h3>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/72 md:text-base">
                {activeItem.summary}
              </p>
              <a
                href={activeItem.url}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2ED47A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1DB865]"
              >
                Ver no painel <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </Card>

        <div className="grid gap-3">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "group rounded-2xl border p-4 text-left transition-all",
                activeIndex === index
                  ? "border-[#2ED47A] bg-[#E8FAF0] shadow-lg shadow-[#2ED47A]/10"
                  : "border-[#E8ECEF] bg-white hover:border-[#A7F3C8] hover:bg-[#F8FFFB]",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                    activeIndex === index
                      ? "bg-[#2ED47A] text-white"
                      : "bg-[#E8FAF0] text-[#1DB865]",
                  )}
                >
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#1C1C2E]">{item.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">
                    {item.summary}
                  </p>
                </div>
                <ArrowRight
                  size={17}
                  className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#1DB865]"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
