import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { Annotation, AnnotationCategory } from '../lib/annotations'
import { findElementBySelector, getElementPosition, getElementSelector, isElementInViewport, isElementVisible, findActiveOverlay } from '../lib/annotations'

interface AnnotationLayerProps {
  annotations: Annotation[]
  categories: AnnotationCategory[]
  selectedId: string | null
  highlightedId: string | null
  selecting: boolean
  previewContainer: HTMLElement | null
  onSelect: (id: string, clientX: number, clientY: number) => void
  onSelectElement: (selector: string, clientX: number, clientY: number) => void
}

const getCategoryColor = (categories: AnnotationCategory[], categoryKey: string): string => {
  return categories.find((c) => c.key === categoryKey)?.color ?? '#6b7280'
}

export default function AnnotationLayer({
  annotations,
  categories,
  selectedId,
  highlightedId,
  selecting,
  previewContainer,
  onSelect,
  onSelectElement,
}: AnnotationLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const [hoveredSelector, setHoveredSelector] = useState<string | null>(null)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [positions, setPositions] = useState<Record<string, { left: number; top: number }>>({})
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({})

  const recomputePositions = useCallback(() => {
    if (!previewContainer) return
    const nextPositions: Record<string, { left: number; top: number }> = {}
    const nextVisible: Record<string, boolean> = {}
    const activeOverlay = findActiveOverlay(previewContainer)
    annotations.forEach((annotation) => {
      if (annotation.selector) {
        const el = findElementBySelector(annotation.selector, previewContainer)
        if (el) {
          nextPositions[annotation.id] = getElementPosition(el, previewContainer, annotation.position)
          const visible = isElementVisible(el, previewContainer)
          const inViewport = isElementInViewport(el, previewContainer)
          if (activeOverlay) {
            nextVisible[annotation.id] = visible && inViewport && activeOverlay.contains(el)
          } else {
            nextVisible[annotation.id] = visible && inViewport && !el.closest('[data-overlay], [data-modal], dialog, [role="dialog"], [role="alertdialog"]')
          }
        }
      } else if (annotation.x != null && annotation.y != null) {
        nextPositions[annotation.id] = { left: annotation.x, top: annotation.y }
        nextVisible[annotation.id] = true
      }
    })
    setPositions(nextPositions)
    setVisibleMap(nextVisible)
  }, [annotations, previewContainer])

  useEffect(() => {
    queueMicrotask(() => recomputePositions())
  }, [recomputePositions])

  useEffect(() => {
    if (!previewContainer) return

    let frameId: number | null = null
    const scheduleRecompute = () => {
      if (frameId !== null) return
      frameId = requestAnimationFrame(() => {
        frameId = null
        recomputePositions()
      })
    }

    // 捕获预览内容及其内部可滚动区域的滚动，确保标记跟随目标元素移动。
    document.addEventListener('scroll', scheduleRecompute, true)
    window.addEventListener('resize', scheduleRecompute)
    return () => {
      document.removeEventListener('scroll', scheduleRecompute, true)
      window.removeEventListener('resize', scheduleRecompute)
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [previewContainer, recomputePositions])

  useEffect(() => {
    if (!previewContainer) return
    const observer = new MutationObserver(() => {
      queueMicrotask(recomputePositions)
    })
    observer.observe(previewContainer, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'data-open', 'data-state'],
    })
    return () => observer.disconnect()
  }, [previewContainer, recomputePositions])

  useEffect(() => {
    queueMicrotask(() => {
      if (!previewContainer || !highlightedId) {
        setHighlightedElement(null)
        return
      }
      const annotation = annotations.find((a) => a.id === highlightedId)
      if (!annotation?.selector) {
        setHighlightedElement(null)
        return
      }
      const el = findElementBySelector(annotation.selector, previewContainer)
      setHighlightedElement(el && isElementVisible(el, previewContainer) ? el : null)
    })
  }, [highlightedId, annotations, previewContainer])

  const getElementAtPoint = useCallback(
    (clientX: number, clientY: number): HTMLElement | null => {
      if (!previewContainer || !layerRef.current) return null
      const elements = document.elementsFromPoint(clientX, clientY)
      for (const el of elements) {
        if (!(el instanceof HTMLElement)) continue
        if (el === layerRef.current || layerRef.current.contains(el)) continue
        if (el === previewContainer) continue
        if (previewContainer.contains(el)) return el
      }
      return null
    },
    [previewContainer]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!selecting || !previewContainer) return
      const target = getElementAtPoint(e.clientX, e.clientY)
      if (!target) {
        setHoveredElement(null)
        setHoveredSelector(null)
        return
      }
      setHoveredElement(target)
      setHoveredSelector(getElementSelector(target, previewContainer))
    },
    [selecting, previewContainer, getElementAtPoint]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!selecting || !previewContainer) return
      e.preventDefault()
      e.stopPropagation()
      const target = getElementAtPoint(e.clientX, e.clientY)
      if (!target) return
      const selector = getElementSelector(target, previewContainer)
      onSelectElement(selector, e.clientX, e.clientY)
    },
    [selecting, previewContainer, getElementAtPoint, onSelectElement]
  )

  const annotationsBySelector = useMemo(() => {
    const map: Record<string, Annotation[]> = {}
    annotations.forEach((a) => {
      const key = a.selector || `${a.x},${a.y}`
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [annotations])

  if (!previewContainer) return null

  return (
    <div
      ref={layerRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={[
        'absolute inset-0 z-[200]',
        selecting ? 'cursor-pointer' : 'pointer-events-none',
      ].join(' ')}
    >
      {selecting && hoveredElement && (
        <div
          className="absolute pointer-events-none rounded-xl ring-2 ring-[var(--tool-brand)] ring-offset-2 ring-offset-transparent bg-[var(--tool-brand)]/10 transition-[box-shadow,opacity] duration-150"
          style={(() => {
            const rect = hoveredElement.getBoundingClientRect()
            const containerRect = previewContainer.getBoundingClientRect()
            return {
              left: rect.left - containerRect.left,
              top: rect.top - containerRect.top,
              width: rect.width,
              height: rect.height,
            }
          })()}
        />
      )}

      {highlightedElement && (
        <div
          className="absolute pointer-events-none rounded-xl ring-2 ring-[var(--tool-brand)] ring-offset-2 ring-offset-transparent bg-[var(--tool-brand)]/12 animate-pulse motion-reduce:animate-none"
          style={(() => {
            const rect = highlightedElement.getBoundingClientRect()
            const containerRect = previewContainer.getBoundingClientRect()
            return {
              left: rect.left - containerRect.left,
              top: rect.top - containerRect.top,
              width: rect.width,
              height: rect.height,
            }
          })()}
        />
      )}

      {Object.entries(annotationsBySelector).map(([, group]) => {
        const order = new Map(categories.map((c, i) => [c.key, i]))
        const sorted = [...group].sort(
          (a, b) => (order.get(a.category) ?? Infinity) - (order.get(b.category) ?? Infinity)
        )
        const annotation = sorted[0]
        const pos = positions[annotation.id]
        if (!pos || !visibleMap[annotation.id]) return null
        const color = getCategoryColor(categories, annotation.category)
        const isSelected = sorted.some((a) => a.id === selectedId)
        const isHighlighted = sorted.some((a) => a.id === highlightedId)

        return (
          <button
            key={annotation.id}
            onClick={(e) => {
              e.stopPropagation()
              if (!selecting) {
                onSelect(annotation.id, e.clientX, e.clientY)
              }
            }}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              backgroundColor: color,
              translate: '-50% -50%',
            }}
            className={[
              'absolute flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold ring-2 ring-white/80 dark:ring-black/30',
              'select-none tool-control transition-[box-shadow,opacity,scale] duration-200 ease-out',
              selecting ? 'pointer-events-none opacity-50' : 'pointer-events-auto cursor-pointer hover:scale-110',
              isSelected || isHighlighted ? 'ring-[3px] ring-white/90 dark:ring-black/50 scale-110 annotation-glow' : 'shadow-[var(--tool-shadow-float)] hover:scale-110',
            ].join(' ')}
            title={group.length > 1 ? `${group.length} 条批注` : annotation.title}
          >
            {annotation.number}
          </button>
        )
      })}

      {selecting && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl border border-[var(--tool-border)] tool-surface-raised text-[var(--tool-text)] text-sm font-medium pointer-events-none animate-tool-enter motion-reduce:animate-none">
          点击页面元素添加批注
        </div>
      )}
      {selecting && hoveredSelector && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 max-w-[80%] px-4 py-2 rounded-xl border border-[var(--tool-border)] tool-surface-raised text-[var(--tool-text-muted)] text-xs font-mono truncate pointer-events-none animate-tool-enter motion-reduce:animate-none">
          {hoveredSelector}
        </div>
      )}
    </div>
  )
}
