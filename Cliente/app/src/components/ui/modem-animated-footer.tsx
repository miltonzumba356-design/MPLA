"use client"

import React from "react"
import { Mail } from "lucide-react"
import { cn } from "../../lib/utils"

interface FooterLink {
  label: string
  href: string
}

interface SocialLink {
  icon: React.ReactNode
  href: string
  label: string
}

interface FooterProps {
  brandName?: string
  brandDescription?: string
  socialLinks?: SocialLink[]
  navLinks?: FooterLink[]
  creatorName?: string
  creatorUrl?: string
  brandIcon?: React.ReactNode
  className?: string
}

export const Footer = ({
  brandName = "MPLA",
  brandDescription = "Sistema de Monitorizacao Politica",
  socialLinks = [],
  navLinks = [],
  creatorName,
  creatorUrl,
  brandIcon,
  className,
}: FooterProps) => {
  return (
    <section className={cn("relative w-full overflow-hidden", className)}>
      <footer className="relative border-t border-white/10 bg-[#111111]">
        <div className="relative mx-auto flex min-h-[28rem] max-w-7xl flex-col justify-between px-6 py-10 sm:min-h-[32rem] md:min-h-[36rem]">
          <div className="z-10 flex w-full flex-col items-center text-center">
            <div className="mb-4">
              <img
                src="/mpla-logo.png"
                alt="MPLA"
                className="h-12 w-auto object-contain"
                style={{ mixBlendMode: 'screen', filter: 'brightness(1.8)' }}
              />
            </div>
            <h2 className="text-3xl font-bold text-white">{brandName}</h2>
            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-white/55 sm:text-base">
              {brandDescription}
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-5 flex gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-white/45 transition-colors hover:text-white"
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  >
                    <div className="h-6 w-6 transition-transform duration-300 hover:scale-110">
                      {link.icon}
                    </div>
                    <span className="sr-only">{link.label}</span>
                  </a>
                ))}
              </div>
            )}

            {navLinks.length > 0 && (
              <div className="mt-6 flex max-w-full flex-wrap justify-center gap-5 px-4 text-sm font-medium text-white/45">
                {navLinks.map((link, index) => (
                  <a
                    key={index}
                    className="transition-colors duration-300 hover:text-white"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="z-10 flex flex-col items-center justify-center gap-2 px-4 text-center md:flex-row md:justify-between md:text-left">
            <p className="text-sm text-white/35">
              {new Date().getFullYear()} {brandName}. Todos os direitos reservados.
            </p>
            {creatorName && creatorUrl && (
              <nav className="flex gap-4">
                <a
                  href={creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/35 transition-colors duration-300 hover:text-white"
                >
                  Desenvolvido por {creatorName}
                </a>
              </nav>
            )}
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-40 left-1/2 max-w-[95vw] -translate-x-1/2 select-none bg-gradient-to-b from-white/20 via-white/10 to-transparent bg-clip-text px-4 text-center font-extrabold leading-none tracking-normal text-transparent md:bottom-32"
          style={{ fontSize: "clamp(3rem, 12vw, 10rem)" }}
        >
          {brandName.toUpperCase()}
        </div>

        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-3xl border-2 border-white/15 bg-white/10 p-3 backdrop-blur-sm duration-300 hover:border-white/35">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg sm:h-20 sm:w-20 md:h-24 md:w-24">
            {brandIcon || (
              <Mail className="h-10 w-10 text-[#111111] sm:h-12 sm:w-12 md:h-14 md:w-14" />
            )}
          </div>
        </div>

        <div className="absolute bottom-32 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent backdrop-blur-sm" />
        <div className="absolute bottom-24 h-24 w-full bg-gradient-to-t from-[#111111] via-[#111111]/85 to-[#111111]/30 blur-[1em]" />
      </footer>
    </section>
  )
}
