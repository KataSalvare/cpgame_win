import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { Annotation, AnnotationCategory, AnnotationMarkerColor } from '../lib/annotations'
import { findElementBySelector, getAnnotationMarkerColor, getElementPosition, getElementSelector, isElementInViewport, isElementVisible, findActiveOverlay } from '../lib/annotations'

interface AnnotationLayerProps {
  annotations: Annotation[]
  categories: AnnotationCategory[]
  markerColor: AnnotationMarkerColor
  selectedId: string | null
  highlightedId: string | null
  selecting: boolean
  previewContainer: HTMLElement | null
  onSelect: (id: string, clientX: number, clientY: number) => void
  onSelectElement: (selector: string, clientX: number, clientY: number) => void
}

// 角标颜色由设置项统一控制，分类颜色只在弹窗与列表中区分

export default function AnnotationLayer({
  annotations,
  categories,
  markerColor,
  selectedId,
  highlightedId,
  selecting,
  previewContainer,
  onSelect,
  onSelectElement,
}: AnnotationLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [positions, setPositions] = useState<Record<string, { left: number; top: number }>>({})
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({})
  const markerHex = getAnnotationMarkerColor(markerColor)

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
      setHoveredElement(getElementAtPoint(e.clientX, e.clientY))
    },
    [selecting, previewContainer, getElementAtPoint]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null)
  }, [])

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
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={[
        'absolute inset-0 z-[200]',
        selecting ? 'cursor-pointer' : 'pointer-events-none',
      ].join(' ')}
    >
      {selecting && hoveredElement && (
        <div
          className="absolute pointer-events-none rounded-none border-2 border-dashed border-red-500 bg-red-500/10 transition-opacity duration-150"
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
          className="absolute pointer-events-none rounded-none border-2 border-dashed border-red-500 bg-red-500/10 transition-opacity duration-150"
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

      {!selecting && Object.entries(annotationsBySelector).map(([, group]) => {
        const order = new Map(categories.map((c, i) => [c.key, i]))
        const sorted = [...group].sort(
          (a, b) => (order.get(a.category) ?? Infinity) - (order.get(b.category) ?? Infinity)
        )
        const annotation = sorted[0]
        const pos = positions[annotation.id]
        if (!pos || !visibleMap[annotation.id]) return null
        const color = markerHex
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
              transform: 'translate(-50%, -50%)',
            }}
            className={[
              'absolute flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold ring-1 ring-white/80 dark:ring-black/30',
              'select-none tool-control pointer-events-auto cursor-pointer transition-[box-shadow,opacity,transform] duration-200 ease-out',
              isSelected || isHighlighted ? 'ring-2 ring-white/90 dark:ring-black/50 scale-110 annotation-glow' : 'shadow-[var(--tool-shadow-float)] hover:scale-110',
            ].join(' ')}
            title={group.length > 1 ? `${group.length} 条批注` : annotation.content || '批注'}
          >
            {annotation.number}
          </button>
        )
      })}

    </div>
  )
}
