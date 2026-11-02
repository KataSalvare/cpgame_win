import { useCallback, useEffect, useMemo, useState } from 'react'
import type React from 'react'
import AnnotationLayer from '../components/AnnotationLayer'
import AnnotationModal, { type AnnotationSaveEntry } from '../components/AnnotationModal'
import { useAnnotations } from '../hooks/useAnnotations'
import type { Annotation, AnnotationCategory, AnnotationMarkerColor } from '../lib/annotations'
import {
  findElementBySelector,
  getElementPosition,
  getNextNumber,
  getOverlayIdForSelector,
  isElementInViewport,
  revealAnnotationTarget,
} from '../lib/annotations'
import type { Theme } from '../lib/shortcuts'

export interface AnnotationControllerState {
  showAnnotations: boolean
  annotationEditMode: boolean
  annotationSelecting: boolean
}

export interface AnnotationControllerActions {
  enableEditMode: () => void
  exitEditMode: () => void
  toggleShow: () => void
  setShowAnnotations: (show: boolean) => void
}

interface UseAnnotationControllerOptions {
  previewContainer: HTMLElement | null
  currentPath: string
  theme: Theme
  deviceMode: 'mobile' | 'pc'
  markerColor: AnnotationMarkerColor
  onOpenDocAnnotations: () => void
}

export function useAnnotationController({
  previewContainer,
  currentPath,
  theme,
  deviceMode,
  markerColor,
  onOpenDocAnnotations,
}: UseAnnotationControllerOptions): {
  state: AnnotationControllerState
  actions: AnnotationControllerActions
  ui: React.ReactNode
  docDrawerProps: {
    annotations: Annotation[]
    categories: AnnotationCategory[]
    markerColor: AnnotationMarkerColor
    selectedCategories: Set<string>
    onToggleCategory: (key: string) => void
    selectedId: string | null
    onSelectAnnotation: (id: string) => void
  }
} {
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [annotationEditMode, setAnnotationEditMode] = useState(false)
  const [annotationSelecting, setAnnotationSelecting] = useState(false)
  const [annotationModalOpen, setAnnotationModalOpen] = useState(false)
  const [modalAnnotation, setModalAnnotation] = useState<Annotation | null>(null)
  const [modalAnchor, setModalAnchor] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [modalReadOnly, setModalReadOnly] = useState(false)
  const [hiddenCategoryKeys, setHiddenCategoryKeys] = useState<Set<string>>(new Set())
  const [revealRequest, setRevealRequest] = useState<{ id: string; nonce: number } | null>(null)

  const {
    annotations: allAnnotations,
    categories: annotationCategories,
    selectedId: selectedAnnotationId,
    setSelectedId: setSelectedAnnotationId,
    currentAnnotations,
    prepareAnnotation,
    saveElementAnnotations,
  } = useAnnotations(currentPath)

  const selectedCategoryKeys = useMemo(
    () => new Set(annotationCategories.map((c) => c.key).filter((k) => !hiddenCategoryKeys.has(k))),
    [annotationCategories, hiddenCategoryKeys]
  )

  const visibleAnnotations = useMemo(
    () => currentAnnotations.filter((a) => selectedCategoryKeys.has(a.category)),
    [currentAnnotations, selectedCategoryKeys]
  )

  const handleToggleCategory = useCallback((key: string) => {
    setHiddenCategoryKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const getAnnotationAnchor = useCallback(
    (annotation: Annotation): { x: number; y: number } => {
      if (!previewContainer) return { x: 0, y: 0 }
      const containerRect = previewContainer.getBoundingClientRect()
      if (annotation.selector) {
        const el = findElementBySelector(annotation.selector, previewContainer)
        if (el) {
          const pos = getElementPosition(el, previewContainer, annotation.position)
          return {
            x: containerRect.left + (pos.left / 100) * containerRect.width,
            y: containerRect.top + (pos.top / 100) * containerRect.height,
          }
        }
      }
      if (annotation.x != null && annotation.y != null) {
        return {
          x: containerRect.left + (annotation.x / 100) * containerRect.width,
          y: containerRect.top + (annotation.y / 100) * containerRect.height,
        }
      }
      return { x: containerRect.left, y: containerRect.top }
    },
    [previewContainer]
  )

  const openAnnotationModal = useCallback(
    (annotation: Annotation, anchor: { x: number; y: number }, readOnly: boolean) => {
      setModalAnnotation(annotation)
      setModalAnchor(anchor)
      setModalReadOnly(readOnly)
      setAnnotationModalOpen(true)
    },
    []
  )

  const handleSelectAnnotation = useCallback(
    (id: string) => {
      const annotation = allAnnotations.find((a) => a.id === id)
      if (!annotation) return

      // 再次点击同一元素的批注时关闭弹窗
      const isSameElementOpen =
        annotationModalOpen &&
        modalAnnotation != null &&
        (annotation.selector
          ? annotation.selector === modalAnnotation.selector
          : annotation.id === modalAnnotation.id)
      if (isSameElementOpen) {
        setAnnotationModalOpen(false)
        setModalAnnotation(null)
        setRevealRequest(null)
        return
      }

      // 点击标注后总是先开启批注显示
      setShowAnnotations(true)
      setSelectedAnnotationId(id)
      onOpenDocAnnotations()
      setRevealRequest((previous) => ({ id, nonce: (previous?.nonce ?? 0) + 1 }))
    },
    [
      allAnnotations,
      annotationModalOpen,
      modalAnnotation,
      onOpenDocAnnotations,
      setSelectedAnnotationId,
    ]
  )

  // 展开当前页面内的弹窗/抽屉，再打开批注弹窗
  useEffect(() => {
    if (!revealRequest) return
    const annotation = allAnnotations.find((a) => a.id === revealRequest.id)
    if (!annotation) return
    if (annotation.pagePath !== currentPath || !previewContainer) return

    let cancelled = false
    let timer: number | null = null

    const finish = () => {
      if (cancelled) return
      if (annotation.selector) {
        const element = findElementBySelector(annotation.selector, previewContainer)
        if (element && !isElementInViewport(element, previewContainer)) {
          element.scrollIntoView({ block: 'center', inline: 'nearest' })
        }
      }
      setSelectedAnnotationId(annotation.id)
      openAnnotationModal(annotation, getAnnotationAnchor(annotation), !annotationEditMode)
      setShowAnnotations(true)
      setRevealRequest(null)
    }

    // 弹窗展开后目标元素可能延后渲染（如匹配中的候选列表），轮询等待出现
    const deadline = performance.now() + 4000
    const poll = () => {
      if (cancelled) return
      if (!annotation.selector || findElementBySelector(annotation.selector, previewContainer)) {
        finish()
        return
      }
      if (performance.now() >= deadline) {
        setRevealRequest(null)
        return
      }
      timer = window.setTimeout(poll, 140)
    }

    const attempt = async () => {
      if (cancelled) return
      if (!annotation.selector) {
        finish()
        return
      }
      // 只执行一次展开，避免在匹配中等多状态浮层里反复切换状态
      await revealAnnotationTarget(previewContainer, annotation)
      if (cancelled) return
      poll()
    }

    void attempt()
    return () => {
      cancelled = true
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [
    revealRequest,
    allAnnotations,
    currentPath,
    previewContainer,
    annotationEditMode,
    getAnnotationAnchor,
    openAnnotationModal,
    setSelectedAnnotationId,
  ])

  const handleSelectElement = useCallback(
    (selector: string, clientX: number, clientY: number) => {
      const existing = allAnnotations.filter((a) => a.pagePath === currentPath && a.selector === selector)
      const annotation = existing[0] ?? prepareAnnotation(selector)
      openAnnotationModal(annotation, { x: clientX, y: clientY }, false)
    },
    [allAnnotations, currentPath, prepareAnnotation, openAnnotationModal]
  )

  const handleSaveAnnotationModal = useCallback(
    async (entries: AnnotationSaveEntry[], position: NonNullable<Annotation['position']>) => {
      const selector = modalAnnotation?.selector
      if (!selector) return
      const existing = allAnnotations.filter((a) => a.pagePath === currentPath && a.selector === selector)
      const elementNumber = existing[0]?.number ?? getNextNumber(allAnnotations, currentPath)
      const overlayId = previewContainer ? getOverlayIdForSelector(selector, previewContainer) : undefined
      // 记录原型内部路由，跨页面定位时先恢复到该页面（空字符串表示原型默认页面）
      const route = window.location.hash.replace(/^#/, '')
      const timestamp = Date.now()
      const upserted: Annotation[] = []
      const deleted: string[] = []

      entries.forEach((entry, index) => {
        const content = entry.content.trim()
        const current = existing.find((a) => a.category === entry.category)
        if (content) {
          if (current) {
            upserted.push({
              ...current,
              content,
              position,
              overlayId: current.overlayId ?? overlayId,
              route: current.route ?? route,
            })
          } else {
            const prepared = prepareAnnotation(selector)
            upserted.push({
              ...prepared,
              id: `anno-${timestamp}-${entry.category}`,
              category: entry.category,
              content,
              position,
              overlayId,
              route,
              title: '',
              number: elementNumber,
              createdAt: timestamp + index,
            })
          }
        } else if (current) {
          deleted.push(current.id)
        }
      })

      // 分类全部为空时相当于删除该批注；没有改动则无需请求
      if (upserted.length === 0 && deleted.length === 0) return

      await saveElementAnnotations({ upserted, deleted })
    },
    [allAnnotations, currentPath, modalAnnotation, prepareAnnotation, previewContainer, saveElementAnnotations]
  )

  const handleDeleteAnnotationsModal = useCallback(
    async (ids: string[]) => {
      await saveElementAnnotations({ upserted: [], deleted: ids })
    },
    [saveElementAnnotations]
  )

  const handleEditAnnotationModal = useCallback(() => {
    setShowAnnotations(true)
    setModalReadOnly(false)
  }, [])

  const actions: AnnotationControllerActions = useMemo(
    () => ({
      enableEditMode: () => {
        setShowAnnotations(true)
        setAnnotationEditMode(true)
        // 进入批注模式即开启选择元素
        setAnnotationSelecting(true)
      },
      exitEditMode: () => {
        setAnnotationEditMode(false)
        setAnnotationSelecting(false)
      },
      toggleShow: () => {
        setShowAnnotations((prev) => {
          const next = !prev
          if (!next) {
            setAnnotationEditMode(false)
            setAnnotationSelecting(false)
          }
          return next
        })
      },
      setShowAnnotations: (show: boolean) => {
        setShowAnnotations(show)
      },
    }),
    []
  )

  const state: AnnotationControllerState = useMemo(
    () => ({
      showAnnotations,
      annotationEditMode,
      annotationSelecting,
    }),
    [showAnnotations, annotationEditMode, annotationSelecting]
  )

  const docDrawerProps = useMemo(
    () => ({
      annotations: currentAnnotations,
      categories: annotationCategories,
      markerColor,
      selectedCategories: selectedCategoryKeys,
      onToggleCategory: handleToggleCategory,
      selectedId: selectedAnnotationId,
      onSelectAnnotation: handleSelectAnnotation,
    }),
    [currentAnnotations, annotationCategories, markerColor, selectedCategoryKeys, handleToggleCategory, selectedAnnotationId, handleSelectAnnotation]
  )

  const ui = (
    <>
      {showAnnotations && (
        <AnnotationLayer
          annotations={visibleAnnotations}
          categories={annotationCategories}
          markerColor={markerColor}
          selectedId={selectedAnnotationId}
          highlightedId={modalAnnotation?.id ?? null}
          selecting={annotationEditMode && annotationSelecting}
          previewContainer={previewContainer}
          onSelect={handleSelectAnnotation}
          onSelectElement={handleSelectElement}
        />
      )}
      <AnnotationModal
        isOpen={annotationModalOpen}
        onClose={() => {
          setAnnotationModalOpen(false)
          setModalAnnotation(null)
        }}
        annotation={modalAnnotation}
        annotations={currentAnnotations}
        categories={annotationCategories}
        theme={theme}
        anchor={modalAnchor}
        previewContainer={previewContainer}
        constrainToPreview={deviceMode === 'pc'}
        readOnly={modalReadOnly}
        onEdit={handleEditAnnotationModal}
        onSave={handleSaveAnnotationModal}
        onDelete={handleDeleteAnnotationsModal}
      />
    </>
  )

  return { state, actions, ui, docDrawerProps }
}
