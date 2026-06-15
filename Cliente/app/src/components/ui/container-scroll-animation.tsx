"use client"

import React, { useEffect, useRef, useState } from "react"
import { MotionValue, motion, useScroll, useTransform } from "framer-motion"

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent?: string | React.ReactNode
  children: React.ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const rotate = useTransform(scrollYProgress, [0, 1], [isMobile ? 8 : 14, 0])
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.92, 1] : [1.04, 1])
  const translate = useTransform(scrollYProgress, [0, 1], [20, -40])

  return (
    <div
      ref={containerRef}
      className="relative flex w-full items-center justify-center px-2 py-6 md:px-8 md:py-10"
    >
      <div className="relative w-full" style={{ perspective: "1200px" }}>
        {titleComponent && <Header translate={translate} titleComponent={titleComponent} />}
        <TabletCard rotate={rotate} scale={scale}>
          {children}
        </TabletCard>
      </div>
    </div>
  )
}

const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>
  titleComponent: string | React.ReactNode
}) => {
  return (
    <motion.div style={{ translateY: translate }} className="mx-auto max-w-5xl text-center">
      {titleComponent}
    </motion.div>
  )
}

const TabletCard = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>
  scale: MotionValue<number>
  children: React.ReactNode
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 18px 32px rgba(13,61,82,0.20), 0 44px 70px rgba(13,61,82,0.18), 0 90px 90px rgba(13,61,82,0.10)",
      }}
      className="mx-auto w-full max-w-5xl rounded-[34px] border-[10px] border-[#111111] bg-[#111111] p-2 shadow-2xl md:rounded-[42px] md:border-[14px] md:p-3"
    >
      <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-white/25 md:mb-3" />
      <div className="h-full w-full overflow-hidden rounded-[22px] bg-[#F5F5F5] md:rounded-[28px]">
        {children}
      </div>
    </motion.div>
  )
}
