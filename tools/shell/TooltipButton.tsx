import { forwardRef, useId } from 'react'
import type React from 'react'

interface TooltipButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: React.ReactNode
  tooltipDisabled?: boolean
  wrapperClassName?: string
}

export const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(function TooltipButton(
  { tooltip, tooltipDisabled = false, children, wrapperClassName = '', 'aria-describedby': ariaDescribedBy, ...props },
  ref,
) {
  const tooltipId = useId()

  return (
    <div className={`relative group ${wrapperClassName || 'inline-flex'}`}>
      <button {...props} ref={ref} aria-describedby={[ariaDescribedBy, !tooltipDisabled && tooltipId].filter(Boolean).join(' ') || undefined}>{children}</button>
      {!tooltipDisabled && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 rounded-lg bg-[var(--tool-text)] text-[var(--tool-surface)] text-[11px] font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-180 motion-reduce:transition-none z-[1100] pointer-events-none shadow-[var(--tool-shadow-float)]"
        >
          {tooltip}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--tool-text)] rotate-45" />
        </div>
      )}
    </div>
  )
})
