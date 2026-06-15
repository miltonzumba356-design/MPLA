import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

export function Button({ className, asChild, children, ...props }: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>

    return React.cloneElement(children, {
      className: cn(
        "inline-flex items-center justify-center rounded-full bg-[#2ED47A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1DB865]",
        child.props.className,
        className,
      ),
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[#2ED47A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1DB865]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
