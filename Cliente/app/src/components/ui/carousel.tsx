import * as React from "react"
import { cn } from "@/lib/utils"

export type CarouselApi = {
  scrollTo: (index: number) => void
  selectedScrollSnap: () => number
}

export function Carousel({
  className,
  setApi,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  setApi?: (api: CarouselApi) => void
}) {
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    setApi?.({
      scrollTo: setSelected,
      selectedScrollSnap: () => selected,
    })
  }, [selected, setApi])

  return (
    <div
      className={cn("overflow-hidden", className)}
      data-selected={selected}
      {...props}
    >
      {children}
    </div>
  )
}

export function CarouselContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex", className)} {...props} />
}

export function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 shrink-0 grow-0 basis-full", className)} {...props} />
}
