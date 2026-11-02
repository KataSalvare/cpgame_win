import { useState, useMemo, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { X, Trash2, Pencil } from 'lucide-react'
import { DEFAULT_ANNOTATION_CATEGORIES, type Annotation, type AnnotationCategory } from '../lib/annotations'
import { useToolEntrance } from '../hooks/useToolEntrance'

export type Theme = 'light' | 'dark'

export interface AnnotationSaveEntry {
  category: string
  content: string
}

interface AnnotationModalProps {
  isOpen: boolean
  onClose: () => void
  annotation: Annotation | null
  annotations: Annotation[]
  categories: AnnotationCategory[]
  theme: Theme
  anchor: { x: number; y: number }
  previewContainer: HTMLElement | null
  constrainToPreview?: boolean
  readOnly?: boolean
  onEdit?: () => void
  onSave: (entries: AnnotationSaveEntry[], position: NonNullable<Annotation['position']>) => Promise<void> | void
  onDelete: (ids: string[]) => Promise<void> | void
}

const CORNERS: { key: NonNullable<Annotation['position']>; label: string }[] = [
  { key: 'top-left', label: '左上' },
  { key: 'top-right', label: '右上' },
  { key: 'bottom-left', label: '左下' },
  { key: 'bottom-right', label: '右下' },
]

const MODAL_WIDTH = 420

export default function AnnotationModal({
  isOpen,
  onClose,
  annotation,
  annotations,
  categories,
  theme,
  anchor,
  previewContainer,
  constrainToPreview = false,
  readOnly = false,
  onEdit,
  onSave,
  onDelete,
}: AnnotationModalProps) {
  const isDark = theme === 'dark'
  const canEdit = !readOnly
  const modalRef = useRef<HTMLDivElement>(null)

  const elementAnnotations = useMemo(() => {
    if (!annotation) return []
    return annotation.selector
      ? annotations.filter((a) => a.selector === annotation.selector)
      : annotations.filter((a) => a.id === annotation.id)
  }, [annotations, annotation])

  const isNew = elementAnnotations.length === 0

  const tabs = useMemo(() => {
    const defaultTabs = DEFAULT_ANNOTATION_CATEGORIES.map(
      (fallback) => categories.find((c) => c.key === fallback.key) ?? fallback
    )
    if (!annotation || !readOnly) return defaultTabs

    // 查看模式只展示该元素已有内容的分类
    const keys = new Set(elementAnnotations.map((a) => a.category))
    const existingTabs = defaultTabs.filter((tab) => keys.has(tab.key))
    if (annotation.category && !existingTabs.some((tab) => tab.key === annotation.category)) {
      const current = categories.find((c) => c.key === annotation.category)
      if (current) existingTabs.push(current)
    }
    if (existingTabs.length > 0) return existingTabs
    const ownTab = defaultTabs.find((tab) => tab.key === annotation.category)
    return ownTab ? [ownTab] : [defaultTabs[0]]
  }, [annotation, categories, elementAnnotations, readOnly])

  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [activeCategory, setActiveCategory] = useState('')
  const [position, setPosition] = useState<NonNullable<Annotation['position']>>('top-left')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null)
  const dragCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!isOpen || !annotation) return
    const nextDrafts: Record<string, string> = {}
    tabs.forEach((tab) => {
      const existing = elementAnnotations.find((a) => a.category === tab.key)
      nextDrafts[tab.key] = existing?.content ?? ''
    })
    const preferredCategory = tabs.some((tab) => tab.key === annotation.category)
      ? annotation.category
      : tabs.find((tab) => elementAnnotations.some((a) => a.category === tab.key))?.key ?? tabs[0]?.key ?? ''

    queueMicrotask(() => {
      setDrafts(nextDrafts)
      setActiveCategory(preferredCategory)
      setPosition(annotation.position ?? 'top-left')
      setError(null)
      setSaving(false)
      setConfirmDelete(false)
    })
  }, [isOpen, annotation, tabs, elementAnnotations])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    queueMicrotask(() => {
      setDragOffset({ x: 0, y: 0 })
      setIsDragging(false)
    })
  }, [isOpen, annotation?.id])

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.()
    }
  }, [])

  const getViewportBounds = useCallback(() => {
    if (constrainToPreview && previewContainer) {
      const rect = previewContainer.getBoundingClientRect()
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      }
    }
    return {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }, [constrainToPreview, previewContainer])

  const estimatedStyle = useMemo(() => {
    const padding = 16
    const gap = 8
    const markerHalf = 12
    const viewport = getViewportBounds()
    const width = Math.min(MODAL_WIDTH, Math.max(0, viewport.width - padding * 2))
    const height = Math.min(canEdit ? 560 : 360, Math.max(240, viewport.height - padding * 2))

    let left = anchor.x + markerHalf + gap
    if (left + width > viewport.right - padding) {
      left = anchor.x - markerHalf - gap - width
    }
    left = Math.max(viewport.left + padding, Math.min(left, viewport.right - width - padding))

    const spaceBelow = viewport.bottom - padding - (anchor.y + markerHalf + gap)
    const spaceAbove = anchor.y - markerHalf - gap - viewport.top - padding
    let top: number
    if (spaceBelow >= height) {
      top = anchor.y + markerHalf + gap
    } else if (spaceAbove >= height) {
      top = anchor.y - markerHalf - gap - height
    } else {
      top = spaceBelow >= spaceAbove
        ? viewport.bottom - height - padding
        : viewport.top + padding
    }

    return { left, top, height }
  }, [anchor, canEdit, getViewportBounds])

  const handleDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !modalRef.current) return
    if ((e.target as HTMLElement).closest('button, input, textarea, select, a')) return
    e.preventDefault()

    const base = estimatedStyle
    const rect = modalRef.current.getBoundingClientRect()
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: rect.left - base.left,
      offsetY: rect.top - base.top,
    }
    setIsDragging(true)

    const handleMove = (event: PointerEvent) => {
      const drag = dragStateRef.current
      if (!drag) return
      const viewport = getViewportBounds()
      const padding = 16
      const rawLeft = base.left + drag.offsetX + event.clientX - drag.startX
      const rawTop = base.top + drag.offsetY + event.clientY - drag.startY
      const left = Math.max(viewport.left + padding, Math.min(rawLeft, viewport.right - rect.width - padding))
      const top = Math.max(viewport.top + padding, Math.min(rawTop, viewport.bottom - rect.height - padding))
      setDragOffset({ x: left - base.left, y: top - base.top })
    }

    const removeListeners = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
      dragCleanupRef.current = null
    }

    const handleUp = () => {
      dragStateRef.current = null
      setIsDragging(false)
      removeListeners()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
    dragCleanupRef.current = removeListeners
  }

  useLayoutEffect(() => {
    if (!isOpen || !modalRef.current) return
    const el = modalRef.current
    const rect = el.getBoundingClientRect()
    const viewport = getViewportBounds()
    const padding = 16
    let left = rect.left
    let top = rect.top
    if (left + rect.width > viewport.right - padding) {
      left = viewport.right - rect.width - padding
    }
    if (left < viewport.left + padding) left = viewport.left + padding
    if (top + rect.height > viewport.bottom - padding) {
      top = viewport.bottom - rect.height - padding
    }
    if (top < viewport.top + padding) top = viewport.top + padding
    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [isOpen, estimatedStyle, getViewportBounds])

  useToolEntrance(modalRef, modalRef, isOpen, { y: 6, scale: 0.97, duration: 0.22 })

  if (!isOpen || !annotation) return null

  const activeContent = drafts[activeCategory] ?? ''
  const activeTab = tabs.find((tab) => tab.key === activeCategory) ?? tabs[0]

  const handleSave = async () => {
    if (saving) return
    const entries = tabs.map((tab) => ({
      category: tab.key,
      content: (drafts[tab.key] ?? '').trim(),
    }))
    setError(null)
    setSaving(true)
    try {
      await onSave(entries, position)
      onClose()
    } catch {
      setError('保存失败，请重试')
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    const ids = elementAnnotations.map((a) => a.id)
    setError(null)
    try {
      await onDelete(ids.length > 0 ? ids : [annotation.id])
      onClose()
    } catch {
      setError('删除失败，请重试')
      setConfirmDelete(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={canEdit ? (isNew ? '新增批注' : '编辑批注') : '查看批注'}
        style={{
          ...estimatedStyle,
          left: estimatedStyle.left + dragOffset.x,
          top: estimatedStyle.top + dragOffset.y,
        }}
        className={[
          'absolute pointer-events-auto w-[420px] max-w-[calc(100vw-32px)] flex flex-col rounded-2xl overflow-hidden border tool-panel-light dark:tool-panel-dark',
          'bg-[var(--tool-surface)] border-[var(--tool-border)]',
        ].join(' ')}
      >
        <div
          onPointerDown={handleDragStart}
          className={[
            'flex items-center justify-between gap-3 px-4 py-3 bg-[var(--tool-surface-raised)] select-none touch-none',
            isDragging ? 'cursor-grabbing' : 'cursor-move',
          ].join(' ')}
        >
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-[var(--tool-text)]">
              {canEdit ? (isNew ? '新增批注' : '编辑批注') : `批注 #${annotation.number}`}
            </h2>
            <p className="mt-0.5 truncate text-[11px] text-[var(--tool-text-subtle)]">
              {canEdit
                ? (isNew ? '点击分类切换编辑，保存时一并提交' : '点击分类切换编辑，保存时一并更新')
                : '点击分类查看对应说明'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!canEdit && onEdit && (
              <button
                onClick={onEdit}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--tool-border)] px-2.5 text-xs font-semibold text-[var(--tool-brand)] tool-control hover:bg-[var(--tool-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]"
              >
                <Pencil size={13} />
                <span>编辑</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg tool-control text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div
          className="grid gap-1.5 px-4 pb-3"
          style={{ gridTemplateColumns: `repeat(${Math.max(1, tabs.length)}, minmax(0, 1fr))` }}
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeCategory
            const hasContent = (drafts[tab.key] ?? '').trim().length > 0
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveCategory(tab.key)
                  setError(null)
                }}
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg border px-2 text-[11px] font-semibold tool-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]"
                style={{
                  borderColor: tab.color,
                  backgroundColor: isActive ? tab.color : isDark ? `${tab.color}25` : `${tab.color}12`,
                  color: isActive ? '#ffffff' : tab.color,
                }}
              >
                <span className="truncate">{tab.label}</span>
                {canEdit && !isActive && hasContent && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: tab.color }} />
                )}
              </button>
            )
          })}
        </div>

        <div className="min-h-0 flex-1 px-4 pt-3">
          {canEdit ? (
            <textarea
              value={activeContent}
              onChange={(event) => {
                const value = event.target.value
                setDrafts((previous) => ({ ...previous, [activeCategory]: value }))
              }}
              placeholder={`描述该元素的${activeTab?.label ?? '批注'}…`}
              className="h-full w-full resize-none rounded-xl border border-[var(--tool-border)] bg-[var(--tool-surface-muted)] px-3 py-2.5 text-sm leading-6 text-[var(--tool-text)] placeholder-[var(--tool-text-subtle)] outline-none tool-control focus:border-[var(--tool-focus)] focus:ring-2 focus:ring-[var(--tool-focus)]/20"
            />
          ) : (
            <div className="h-full overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-[var(--tool-text-muted)]">
              {activeContent || '暂无说明'}
            </div>
          )}
        </div>

        {canEdit && (
          <>
            {error && <p className="px-4 pt-2 text-xs text-red-500">{error}</p>}
            <div className="flex items-center gap-2 px-4 pt-3">
              <span className="whitespace-nowrap text-[11px] font-semibold text-[var(--tool-text-muted)]">标记位置</span>
              <div className="grid flex-1 grid-cols-4 gap-1">
                {CORNERS.map((corner) => (
                  <button
                    key={corner.key}
                    onClick={() => setPosition(corner.key)}
                    className={[
                      'h-7 rounded-md border text-[11px] font-medium tool-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]',
                      position === corner.key
                        ? 'tool-accent-bg border-transparent text-white'
                        : 'border-[var(--tool-border)] text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]',
                    ].join(' ')}
                  >
                    {corner.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[var(--tool-border)] bg-[var(--tool-surface-raised)] px-4 py-3 mt-3">
              {!isNew ? (
                confirmDelete ? (
                  <div className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap text-[11px] font-semibold text-red-600">确认删除？</span>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-md px-2 py-1 text-[11px] font-medium text-[var(--tool-text-muted)] transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-red-700"
                    >
                      删除
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={13} />
                    <span>删除</span>
                  </button>
                )
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--tool-text-muted)] transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 tool-accent-bg hover:bg-[var(--tool-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
