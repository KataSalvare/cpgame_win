import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { PageStateOption } from '../config/pages'
import { useToolEntrance } from '../hooks/useToolEntrance'

interface PreviewStateBarProps {
  states: readonly PageStateOption[]
  value?: string
  onChange: (state: string) => void
  theme: 'light' | 'dark'
}

export function PreviewStateBar({ states, value, onChange, theme }: PreviewStateBarProps) {
  const isDark = theme === 'dark'
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const floatingPanelRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [panelPosition, setPanelPosition] = useState({ top: -9999, left: -9999 })
  const activeState = value ?? states[0]?.id
  const activeOption = states.find((state) => state.id === activeState) ?? states[0]

  useToolEntrance(floatingPanelRef, floatingPanelRef, open, { y: -6, scale: 0.98, duration: 0.18 })

  useLayoutEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const panelWidth = 220
      const edgePadding = 12
      const left = Math.max(edgePadding, Math.min(rect.left, window.innerWidth - panelWidth - edgePadding))
      setPanelPosition({ top: rect.bottom + 8, left })
    }

    let frameId: number | null = null
    const schedulePositionUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(() => {
        frameId = null
        updatePosition()
      })
    }

    updatePosition()
    window.addEventListener('resize', schedulePositionUpdate)
    document.addEventListener('scroll', schedulePositionUpdate, true)
    return () => {
      window.removeEventListener('resize', schedulePositionUpdate)
      document.removeEventListener('scroll', schedulePositionUpdate, true)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const activeIndex = Math.max(0, states.findIndex((state) => state.id === activeState))
    const frameId = window.requestAnimationFrame(() => optionRefs.current[activeIndex]?.focus())
    return () => window.cancelAnimationFrame(frameId)
  }, [activeState, open, states])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !floatingPanelRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const closeAndFocusTrigger = () => {
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const moveFocusBackToToolbar = (backwards: boolean) => {
    const toolbar = triggerRef.current?.closest('header')
    if (!toolbar) {
      closeAndFocusTrigger()
      return
    }

    const focusableButtons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
    const triggerIndex = triggerRef.current ? focusableButtons.indexOf(triggerRef.current) : -1
    const target = focusableButtons[triggerIndex + (backwards ? -1 : 1)]
    setOpen(false)
    window.requestAnimationFrame(() => (target ?? triggerRef.current)?.focus())
  }

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const currentIndex = optionRefs.current.findIndex((option) => option === document.activeElement)
    const lastIndex = states.length - 1
    let nextIndex: number | null = null

    if (event.key === 'ArrowDown') nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1
    if (event.key === 'ArrowUp') nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = lastIndex

    if (nextIndex !== null) {
      event.preventDefault()
      optionRefs.current[nextIndex]?.focus()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeAndFocusTrigger()
    } else if (event.key === 'Tab') {
      event.preventDefault()
      moveFocusBackToToolbar(event.shiftKey)
    }
  }

  if (states.length === 0) return null

  const stateDotClass = {
    normal: isDark ? 'bg-emerald-400' : 'bg-emerald-500',
    loading: isDark ? 'bg-amber-400' : 'bg-amber-500',
    empty: isDark ? 'bg-slate-300' : 'bg-slate-500',
    error: isDark ? 'bg-rose-400' : 'bg-rose-500',
  }[activeState] ?? 'bg-[var(--tool-text-muted)]'

  return (
    <div
      data-tool-chrome="preview-state"
      className="relative flex h-10 items-center rounded-2xl border border-[var(--tool-border)] bg-[var(--tool-surface-muted)] p-1 shrink-0"
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`页面状态：${activeOption.label}`}
        title="打开页面状态面板"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
        className={`flex shrink-0 h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)] ${
          open
            ? 'border-[var(--tool-brand)]/35 bg-[var(--tool-surface)] text-[var(--tool-text)] shadow-sm'
            : 'border-transparent text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]'
        }`}
      >
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${stateDotClass}`} />
        <span className="text-[var(--tool-text-subtle)]">状态</span>
        <span className="font-semibold">{activeOption.label}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={floatingPanelRef}
          role="menu"
          aria-label="页面状态面板"
          onKeyDown={handleMenuKeyDown}
          style={{ top: panelPosition.top, left: panelPosition.left }}
          className="fixed z-[2000] min-w-[210px] rounded-2xl border border-[var(--tool-border)] bg-[var(--tool-surface)] p-2 text-[var(--tool-text)] shadow-2xl"
        >
          <div className="px-2.5 pb-2 pt-1 text-[11px] font-semibold text-[var(--tool-text-subtle)]">
            页面状态
          </div>
          <div className="space-y-1">
            {states.map((state, index) => {
              const active = activeState === state.id
              return (
                <button
                  key={state.id}
                  ref={(node) => { optionRefs.current[index] = node }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  onClick={(event) => {
                    event.stopPropagation()
                    onChange(state.id)
                    closeAndFocusTrigger()
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)] ${
                    active
                      ? 'bg-[var(--tool-brand-soft)] text-[var(--tool-brand)]'
                      : 'text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        {
                          normal: isDark ? 'bg-emerald-400' : 'bg-emerald-500',
                          loading: isDark ? 'bg-amber-400' : 'bg-amber-500',
                          empty: isDark ? 'bg-slate-300' : 'bg-slate-500',
                          error: isDark ? 'bg-rose-400' : 'bg-rose-500',
                        }[state.id] ?? 'bg-[var(--tool-text-muted)]'
                      }`}
                    />
                    {state.label}
                  </span>
                  {active && <Check size={14} />}
                </button>
              )
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
