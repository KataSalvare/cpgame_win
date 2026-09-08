import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Keyboard, Moon, MoreHorizontal, Sun } from 'lucide-react'
import type { Theme } from '../lib/shortcuts'
import { TooltipButton } from './TooltipButton'

interface ToolbarMoreMenuProps {
  theme: Theme
  toggleTheme: () => void
  onOpenShortcuts: () => void
}

export function ToolbarMoreMenu({ theme, toggleTheme, onOpenShortcuts }: ToolbarMoreMenuProps) {
  const isDark = theme === 'dark'
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!open) return

    const frameId = window.requestAnimationFrame(() => itemRefs.current[0]?.focus())
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      window.requestAnimationFrame(() => triggerRef.current?.focus())
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      window.cancelAnimationFrame(frameId)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const currentIndex = itemRefs.current.findIndex((item) => item === document.activeElement)
    const lastIndex = itemRefs.current.length - 1
    let nextIndex: number | null = null

    if (event.key === 'ArrowDown') nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1
    if (event.key === 'ArrowUp') nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = lastIndex

    if (nextIndex !== null) {
      event.preventDefault()
      itemRefs.current[nextIndex]?.focus()
    }
  }

  const buttonClass = 'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[var(--tool-text-muted)] transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]'

  return (
    <div ref={rootRef} className="relative min-[1400px]:hidden">
      <TooltipButton
        tooltip="更多工具"
        tooltipDisabled={open}
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="更多工具"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)] ${
          open
            ? 'bg-[var(--tool-brand-soft)] text-[var(--tool-brand)]'
            : 'text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]'
        }`}
      >
        <MoreHorizontal size={16} />
      </TooltipButton>

      {open && (
        <div
          role="menu"
          aria-label="更多工具"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-[1200] mt-2 min-w-[176px] rounded-2xl border border-[var(--tool-border)] bg-[var(--tool-surface)] p-2 shadow-2xl"
        >
          <button
            ref={(node) => { itemRefs.current[0] = node }}
            type="button"
            role="menuitem"
            className={buttonClass}
            onClick={() => {
              toggleTheme()
              setOpen(false)
              window.requestAnimationFrame(() => triggerRef.current?.focus())
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            {isDark ? '切换到白天模式' : '切换到黑夜模式'}
          </button>
          <button
            ref={(node) => { itemRefs.current[1] = node }}
            type="button"
            role="menuitem"
            className={buttonClass}
            onClick={() => {
              setOpen(false)
              onOpenShortcuts()
            }}
          >
            <Keyboard size={15} />
            快捷键设置
          </button>
        </div>
      )}
    </div>
  )
}
