import { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react'
import { X, Plus, Trash2, Check } from 'lucide-react'
import { DEFAULT_CATEGORY_KEYS, type Annotation, type AnnotationCategory } from '../lib/annotations'

export type Theme = 'light' | 'dark'

interface AnnotationModalProps {
  isOpen: boolean
  onClose: () => void
  annotation: Annotation | null
  annotations: Annotation[]
  categories: AnnotationCategory[]
  theme: Theme
  anchor: { x: number; y: number }
  readOnly?: boolean
  onSave: (annotation: Annotation) => void
  onDelete: (id: string) => void
  onAddCategory: (category: AnnotationCategory) => void
  onDeleteCategory: (key: string) => void
  onSwitchAnnotation?: (id: string) => void
  onAddRelatedAnnotation?: (selector: string, category: string) => void
}

const PRESET_COLORS = [
  '#d65a31', '#2a9d8f', '#e9c46a', '#e76f51', '#264653', '#f4a261', '#8ab17d', '#9b5de5', '#00bbf9', '#f15bb5'
]

const CORNERS: { key: NonNullable<Annotation['position']>; label: string }[] = [
  { key: 'top-left', label: '左上' },
  { key: 'top-right', label: '右上' },
  { key: 'bottom-left', label: '左下' },
  { key: 'bottom-right', label: '右下' },
]

const pickColor = (categories: AnnotationCategory[]): string => {
  const used = new Set(categories.map((c) => c.color))
  return PRESET_COLORS.find((c) => !used.has(c)) ?? '#6b7280'
}

export default function AnnotationModal({
  isOpen,
  onClose,
  annotation,
  annotations,
  categories,
  theme,
  anchor,
  readOnly = false,
  onSave,
  onDelete,
  onAddCategory,
  onDeleteCategory,
  onSwitchAnnotation,
  onAddRelatedAnnotation,
}: AnnotationModalProps) {
  const isDark = theme === 'dark'
  const isNew = annotation?.title === '' && annotation?.content === ''
  const canEdit = !readOnly
  const modalRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    title: annotation?.title || '',
    content: annotation?.content || '',
    category: annotation?.category || categories[0]?.key || 'other',
    position: annotation?.position || 'top-left',
  })

  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    queueMicrotask(() =>
      setForm({
        title: annotation?.title || '',
        content: annotation?.content || '',
        category: annotation?.category || categories[0]?.key || 'other',
        position: annotation?.position || 'top-left',
      })
    )
  }, [annotation, categories])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSave = () => {
    if (!annotation) return
    onSave({
      ...annotation,
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      position: form.position as NonNullable<Annotation['position']>,
    })
    onClose()
  }

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (!name) return
    const key = `cat-${Date.now()}`
    onAddCategory({ key, label: name, color: pickColor(categories) })
    setNewCategoryName('')
    setShowCategoryInput(false)
  }

  const categoryOrder = useMemo(() => new Map(categories.map((c, i) => [c.key, i])), [categories])

  const elementAnnotations = useMemo(() => {
    if (!annotation?.selector) return []
    return annotations
      .filter((a) => a.selector === annotation.selector)
      .sort((a, b) => (categoryOrder.get(a.category) ?? Infinity) - (categoryOrder.get(b.category) ?? Infinity))
  }, [annotations, annotation, categoryOrder])

  const tabAnnotations = useMemo(() => {
    if (!annotation) return elementAnnotations
    if (elementAnnotations.some((a) => a.id === annotation.id)) return elementAnnotations
    return [...elementAnnotations, annotation]
  }, [elementAnnotations, annotation])

  const unusedCategories = useMemo(
    () => categories.filter((c) => !tabAnnotations.some((a) => a.category === c.key)),
    [categories, tabAnnotations]
  )

  const MODAL_WIDTH = 380
  const estimatedStyle = useMemo(() => {
    const padding = 16
    const gap = 8
    const markerHalf = 12
    const vw = window.innerWidth
    const vh = window.innerHeight
    const isEdit = !readOnly
    const width = Math.min(MODAL_WIDTH, vw - 32)
    const height = Math.min(isEdit ? 520 : 260, vh * 0.85)

    let left = anchor.x + markerHalf + gap
    if (left + width > vw - padding) {
      left = anchor.x - markerHalf - gap - width
    }
    left = Math.max(padding, Math.min(left, vw - width - padding))

    const spaceBelow = vh - padding - (anchor.y + markerHalf + gap)
    const spaceAbove = anchor.y - markerHalf - gap - padding
    let top: number
    if (spaceBelow >= height) {
      top = anchor.y + markerHalf + gap
    } else if (spaceAbove >= height) {
      top = anchor.y - markerHalf - gap - height
    } else {
      top = spaceBelow >= spaceAbove ? vh - height - padding : padding
    }

    return { left, top }
  }, [anchor, readOnly])

  useLayoutEffect(() => {
    if (!isOpen || !modalRef.current) return
    const el = modalRef.current
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const padding = 16
    let left = rect.left
    let top = rect.top
    if (left + rect.width > vw - padding) {
      left = vw - rect.width - padding
    }
    if (left < padding) left = padding
    if (top + rect.height > vh - padding) {
      top = vh - rect.height - padding
    }
    if (top < padding) top = padding
    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [isOpen, estimatedStyle])

  if (!isOpen || !annotation) return null

  const inputBase = 'w-full px-3 py-2 text-sm rounded-xl border border-[var(--tool-border)] bg-[var(--tool-surface-muted)] text-[var(--tool-text)] placeholder-[var(--tool-text-subtle)] outline-none transition-all duration-200 focus:border-[var(--tool-focus)] focus:ring-2 focus:ring-[var(--tool-focus)]/20'

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <div
        ref={modalRef}
        style={estimatedStyle}
        className={[
          'absolute pointer-events-auto w-[380px] max-w-[calc(100vw-32px)] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-tool-enter border',
          'bg-[var(--tool-surface)] border-[var(--tool-border)]',
        ].join(' ')}
      >
        {canEdit ? (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--tool-border)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--tool-text)]">
                {isNew ? '新增批注' : '编辑批注'}
              </h2>
              <p className="text-xs mt-0.5 text-[var(--tool-text-subtle)]">
                {isNew ? '为选中的元素添加说明' : `标记 #${annotation.number}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--tool-text-muted)] transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-xl text-[var(--tool-text-muted)] transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]"
          >
            <X size={16} />
          </button>
        )}

        <div className="px-5 py-3 border-b border-[var(--tool-border)]">
          <div className="flex flex-wrap gap-1.5">
            {tabAnnotations.map((a) => {
              const cat = categories.find((c) => c.key === a.category)
              if (!cat) return null
              const isActive = a.id === annotation.id
              return (
                <button
                  key={a.id}
                  onClick={() => onSwitchAnnotation?.(a.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-200 hover:opacity-85"
                  style={{
                    borderColor: cat.color,
                    backgroundColor: isActive ? cat.color : isDark ? `${cat.color}25` : `${cat.color}12`,
                    color: isActive ? '#ffffff' : cat.color,
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
            {canEdit && !isNew && unusedCategories.length > 0 && (
              <button
                onClick={() => {
                  const cat = unusedCategories[0]
                  if (cat) onAddRelatedAnnotation?.(annotation.selector || '', cat.key)
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[var(--tool-border)] text-[var(--tool-text-muted)] text-[11px] font-medium transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]"
              >
                <Plus size={10} />
                新增分类
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            {canEdit ? (
              <>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--tool-text-muted)]">标题</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="例如：登录按钮交互"
                  className={inputBase}
                />
              </>
            ) : (
              <h3 className="text-sm font-bold text-[var(--tool-text)]">{annotation.title}</h3>
            )}
          </div>

          <div>
            {canEdit ? (
              <>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--tool-text-muted)]">详细说明</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="描述该元素的交互、业务逻辑或注意事项"
                  rows={3}
                  className={`${inputBase} resize-none`}
                />
              </>
            ) : (
              <p className="text-sm whitespace-pre-wrap leading-relaxed text-[var(--tool-text-muted)]">{annotation.content}</p>
            )}
          </div>

          {canEdit && (
            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--tool-text-muted)]">标记位置</label>
              <div className="grid grid-cols-4 gap-2">
                {CORNERS.map((corner) => (
                  <button
                    key={corner.key}
                    onClick={() => setForm((f) => ({ ...f, position: corner.key }))}
                    className={[
                      'px-2 py-2 text-xs rounded-xl border transition-all duration-200 font-medium',
                      form.position === corner.key
                        ? 'tool-accent-bg text-white border-transparent shadow-sm'
                        : 'border-[var(--tool-border)] text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]',
                    ].join(' ')}
                  >
                    {corner.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {canEdit && (
            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--tool-text-muted)]">分类</label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setForm((f) => ({ ...f, category: cat.key }))}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-200 group"
                    style={{
                      borderColor: cat.color,
                      backgroundColor: form.category === cat.key ? cat.color : isDark ? `${cat.color}20` : `${cat.color}10`,
                      color: form.category === cat.key ? '#ffffff' : cat.color,
                    }}
                  >
                    {form.category === cat.key && <Check size={10} />}
                    <span>{cat.label}</span>
                    {!DEFAULT_CATEGORY_KEYS.includes(cat.key) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteCategory(cat.key)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-black/10 rounded"
                        title="删除分类"
                      >
                        <X size={10} />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {showCategoryInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCategory()
                      if (e.key === 'Escape') {
                        setShowCategoryInput(false)
                        setNewCategoryName('')
                      }
                    }}
                    placeholder="新分类名称"
                    autoFocus
                    className={inputBase}
                  />
                  <button
                    onClick={handleAddCategory}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setShowCategoryInput(false)
                      setNewCategoryName('')
                    }}
                    className="p-2 rounded-xl text-[var(--tool-text-muted)] transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCategoryInput(true)}
                  className="flex items-center gap-1 text-xs tool-accent hover:opacity-80 font-semibold transition-opacity"
                >
                  <Plus size={12} />
                  新增分类
                </button>
              )}
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--tool-border)]">
            {!isNew ? (
              <button
                onClick={() => {
                  onDelete(annotation.id)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <Trash2 size={13} />
                <span>删除</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-xl text-[var(--tool-text-muted)] transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 tool-accent-bg text-white hover:bg-[var(--tool-brand-hover)] shadow-sm"
              >
                保存到草稿
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
