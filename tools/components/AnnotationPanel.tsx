import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Annotation, AnnotationCategory } from '../lib/annotations'

export type Theme = 'light' | 'dark'

interface AnnotationPanelProps {
  annotations: Annotation[]
  categories: AnnotationCategory[]
  selectedCategories: Set<string>
  onToggleCategory: (key: string) => void
  selectedId: string | null
  theme: Theme
  onSelect: (id: string, clientX: number, clientY: number) => void
}

export default function AnnotationPanel({
  annotations,
  categories,
  selectedCategories,
  onToggleCategory,
  selectedId,
  theme,
  onSelect,
}: AnnotationPanelProps) {
  const isDark = theme === 'dark'
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map((c) => c.key)))

  const grouped = useMemo(() => {
    const map: Record<string, Annotation[]> = {}
    categories.forEach((c) => {
      map[c.key] = annotations.filter((a) => a.category === c.key).sort((a, b) => a.number - b.number)
    })
    return map
  }, [annotations, categories])

  const toggleExpand = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const visibleCategories = categories.filter((c) => selectedCategories.has(c.key))

  const textPrimary = 'text-[var(--tool-text)]'
  const textSecondary = 'text-[var(--tool-text-muted)]'
  const textMuted = 'text-[var(--tool-text-subtle)]'
  const borderClass = 'border-[var(--tool-border)]'
  const hoverSurface = 'hover:bg-[var(--tool-surface-hover)]'
  const selectedSurface = 'bg-[var(--tool-brand-soft)] text-[var(--tool-brand)]'

  return (
    <div className="h-full flex flex-col">
      {/* 分类筛选 */}
      <div className={`px-4 py-3 border-b ${borderClass}`}>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategories.has(cat.key)
            const count = grouped[cat.key]?.length || 0
            return (
              <button
                key={cat.key}
                onClick={() => onToggleCategory(cat.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all duration-200 hover:opacity-85"
                style={{
                  borderColor: cat.color,
                  backgroundColor: isSelected
                    ? cat.color
                    : isDark
                      ? `${cat.color}25`
                      : `${cat.color}14`,
                  color: isSelected ? '#ffffff' : cat.color,
                }}
              >
                <span>{cat.label}</span>
                <span
                  className="text-[10px] px-1 py-0 rounded-full"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)',
                    color: isSelected ? '#ffffff' : cat.color,
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Annotation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {visibleCategories.length === 0 && (
          <div className={`px-3 py-8 text-center text-sm ${textMuted}`}>
            请选择分类以查看批注
          </div>
        )}
        {visibleCategories.map((cat) => {
          const items = grouped[cat.key] || []
          const isExpanded = expandedCategories.has(cat.key)

          return (
            <div key={cat.key} className="rounded-xl overflow-hidden">
              <button
                onClick={() => toggleExpand(cat.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl ${hoverSurface}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className={textPrimary}>{cat.label}</span>
                  <span className={`text-xs ${textMuted}`}>({items.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown size={14} className={textMuted} />
                ) : (
                  <ChevronRight size={14} className={textMuted} />
                )}
              </button>

              {isExpanded && (
                <div className="pb-1 pt-0.5">
                  {items.length === 0 ? (
                    <div className={`px-3 py-2 text-xs ${textMuted}`}>暂无标注</div>
                  ) : (
                    items.map((item) => (
                      <button
                        key={item.id}
                        onClick={(e) => onSelect(item.id, e.clientX, e.clientY)}
                        className={[
                          'w-full text-left px-3 py-2.5 rounded-xl mx-1 mb-1 text-sm transition-all duration-200',
                          selectedId === item.id
                            ? selectedSurface
                            : `${textSecondary} ${hoverSurface}`,
                        ].join(' ')}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          >
                            {item.number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold truncate ${selectedId === item.id ? 'tool-accent' : textPrimary}`}>
                              {item.title || '未命名标注'}
                            </div>
                            <div className={`text-xs line-clamp-2 mt-0.5 ${selectedId === item.id ? 'opacity-80' : textMuted}`}>
                              {item.content}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
