import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { PageStateOption } from '../config/pages'

interface PreviewStateBarProps {
  states: readonly PageStateOption[]
  value?: string
  onChange: (state: string) => void
  theme: 'light' | 'dark'
}

export function PreviewStateBar({ states, value, onChange, theme }: PreviewStateBarProps) {
  const isDark = theme === 'dark'
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false)
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

  if (states.length === 0) return null

  const activeState = value ?? states[0].id
  const activeOption = states.find((state) => state.id === activeState) ?? states[0]
  const stateDotClass = {
    normal: isDark ? 'bg-emerald-400' : 'bg-emerald-500',
    loading: isDark ? 'bg-amber-400' : 'bg-amber-500',
    empty: isDark ? 'bg-slate-300' : 'bg-slate-500',
    error: isDark ? 'bg-rose-400' : 'bg-rose-500',
  }[activeState] ?? (isDark ? 'bg-[#a0a0a0]' : 'bg-[#808080]')

  return (
    <div
      ref={panelRef}
      data-tool-chrome="preview-state"
      className={`relative flex h-10 items-center rounded-2xl border p-1 shrink-0 ${isDark ? 'border-[#ffffff]/8 bg-[#2a2a2a]' : 'border-[#1c1c1c]/8 bg-[#f3eee7]'}`}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`页面状态：${activeOption.label}`}
        title="打开页面状态面板"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
        className={`flex shrink-0 h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4785a]/40 ${
          open
            ? isDark
              ? 'border-[#d49a7a]/35 bg-[#3b3029] text-[#f5f2ed] shadow-sm'
              : 'border-[#c4785a]/30 bg-white text-[#1c1c1c] shadow-sm'
            : isDark
              ? 'border-transparent text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#f5f2ed]'
              : 'border-transparent text-[#6b6b6b] hover:bg-white/70 hover:text-[#1c1c1c]'
        }`}
      >
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${stateDotClass}`} />
        <span className={isDark ? 'text-[#808080]' : 'text-[#9a9189]'}>状态</span>
        <span className="font-semibold">{activeOption.label}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="页面状态面板"
          className={`absolute left-0 top-full z-[1200] mt-2 min-w-[210px] rounded-2xl border p-2 shadow-2xl ${
            isDark ? 'border-[#ffffff]/10 bg-[#242424] text-[#f5f2ed]' : 'border-[#1c1c1c]/10 bg-white text-[#1c1c1c]'
          }`}
        >
          <div className={`px-2.5 pb-2 pt-1 text-[11px] font-semibold ${isDark ? 'text-[#808080]' : 'text-[#a0a0a0]'}`}>
            页面状态
          </div>
          <div className="space-y-1" role="group" aria-label="页面状态选项">
            {states.map((state) => {
              const active = activeState === state.id
              return (
                <button
                  key={state.id}
                  type="button"
                  aria-pressed={active}
                  onClick={(event) => {
                    event.stopPropagation()
                    onChange(state.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                    active
                      ? isDark
                        ? 'bg-[#3a3a3a] text-[#f5f2ed]'
                        : 'bg-[#f3eee7] text-[#1c1c1c]'
                      : isDark
                        ? 'text-[#a0a0a0] hover:bg-[#333333] hover:text-[#f5f2ed]'
                        : 'text-[#6b6b6b] hover:bg-[#f7f3ed] hover:text-[#1c1c1c]'
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
                        }[state.id] ?? (isDark ? 'bg-[#a0a0a0]' : 'bg-[#808080]')
                      }`}
                    />
                    {state.label}
                  </span>
                  {active && <Check size={14} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
