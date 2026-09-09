import { useCallback, useMemo, useState } from 'react'
import type React from 'react'
import AnnotationLayer from '../components/AnnotationLayer'
import AnnotationModal from '../components/AnnotationModal'
import { useAnnotations } from '../hooks/useAnnotations'
import type { Annotation, AnnotationCategory } from '../lib/annotations'
import { findElementBySelector, getElementPosition, isElementInViewport } from '../lib/annotations'
import type { Theme } from '../lib/shortcuts'

export interface AnnotationControllerState {
  showAnnotations: boolean
  annotationEditMode: boolean
  annotationSelecting: boolean
  hasDraft: boolean
}

export interface AnnotationControllerActions {
  enableEditMode: () => void
  exitEditMode: () => void
  toggleSelecting: () => void
  toggleShow: () => void
  setShowAnnotations: (show: boolean) => void
  saveDraft: () => Promise<void>
  clearDraft: () => void
}

interface UseAnnotationControllerOptions {
  previewContainer: HTMLElement | null
  currentPath: string
  theme: Theme
  deviceMode: 'mobile' | 'pc'
  onOpenDocAnnotations: () => void
}

export function useAnnotationController({
  previewContainer,
  currentPath,
  theme,
  deviceMode,
  onOpenDocAnnotations,
}: UseAnnotationControllerOptions): {
  state: AnnotationControllerState
  actions: AnnotationControllerActions
  ui: React.ReactNode
  docDrawerProps: {
    annotations: Annotation[]
    categories: AnnotationCategory[]
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

  const {
    annotations: allAnnotations,
    categories: annotationCategories,
    selectedId: selectedAnnotationId,
    setSelectedId: setSelectedAnnotationId,
    currentAnnotations,
    hasDraft,
    prepareAnnotation,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addCategory,
    deleteCategory,
    saveDraftToFile,
    clearLocalDraft,
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
      if (annotation && previewContainer) {
        if (annotation.selector) {
          const element = findElementBySelector(annotation.selector, previewContainer)
          if (element && !isElementInViewport(element, previewContainer)) {
            element.scrollIntoView({ block: 'center', inline: 'nearest' })
          }
        }
        setSelectedAnnotationId(id)
        openAnnotationModal(annotation, getAnnotationAnchor(annotation), !annotationEditMode)
        onOpenDocAnnotations()
      }
    },
    [allAnnotations, annotationEditMode, getAnnotationAnchor, openAnnotationModal, previewContainer, setSelectedAnnotationId, onOpenDocAnnotations]
  )

  const handleSelectElement = useCallback(
    (selector: string, clientX: number, clientY: number) => {
      const existing = allAnnotations.filter((a) => a.selector === selector)
      let annotation: Annotation
      if (existing.length === 0) {
        annotation = prepareAnnotation(selector)
      } else {
        const usedCategories = new Set(existing.map((a) => a.category))
        const unusedCategory = annotationCategories.find((c) => !usedCategories.has(c.key))
        if (unusedCategory) {
          annotation = prepareAnnotation(selector)
          annotation.category = unusedCategory.key
        } else {
          annotation = existing[0]
        }
      }
      openAnnotationModal(annotation, { x: clientX, y: clientY }, false)
    },
    [allAnnotations, annotationCategories, prepareAnnotation, openAnnotationModal]
  )

  const handleSaveAnnotationModal = useCallback(
    (updated: Annotation) => {
      const duplicate = allAnnotations.find(
        (a) => a.id !== updated.id && a.selector === updated.selector && a.category === updated.category
      )
      if (duplicate) {
        return
      }
      const exists = allAnnotations.some((a) => a.id === updated.id)
      if (exists) {
        updateAnnotation(updated)
      } else {
        addAnnotation(updated)
      }
      setAnnotationModalOpen(false)
      setModalAnnotation(null)
    },
    [allAnnotations, addAnnotation, updateAnnotation]
  )

  const handleDeleteAnnotationModal = useCallback(
    (id: string) => {
      deleteAnnotation(id)
      setAnnotationModalOpen(false)
      setModalAnnotation(null)
    },
    [deleteAnnotation]
  )

  const handleSwitchAnnotationModal = useCallback(
    (id: string) => {
      const annotation = allAnnotations.find((a) => a.id === id)
      if (annotation) setModalAnnotation(annotation)
    },
    [allAnnotations]
  )

  const handleAddRelatedAnnotation = useCallback(
    (selector: string, category: string) => {
      const pending = prepareAnnotation(selector)
      pending.category = category
      setModalAnnotation(pending)
    },
    [prepareAnnotation]
  )

  const actions: AnnotationControllerActions = useMemo(
    () => ({
      enableEditMode: () => {
        setShowAnnotations(true)
        setAnnotationEditMode(true)
      },
      exitEditMode: () => {
        setAnnotationEditMode(false)
        setAnnotationSelecting(false)
      },
      toggleSelecting: () => {
        setAnnotationSelecting((prev) => !prev)
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
      saveDraft: async () => {
        await saveDraftToFile()
      },
      clearDraft: () => {
        clearLocalDraft()
        setAnnotationModalOpen(false)
        setModalAnnotation(null)
      },
    }),
    [saveDraftToFile, clearLocalDraft]
  )

  const state: AnnotationControllerState = useMemo(
    () => ({
      showAnnotations,
      annotationEditMode,
      annotationSelecting,
      hasDraft,
    }),
    [showAnnotations, annotationEditMode, annotationSelecting, hasDraft]
  )

  const docDrawerProps = useMemo(
    () => ({
      annotations: currentAnnotations,
      categories: annotationCategories,
      selectedCategories: selectedCategoryKeys,
      onToggleCategory: handleToggleCategory,
      selectedId: selectedAnnotationId,
      onSelectAnnotation: handleSelectAnnotation,
    }),
    [currentAnnotations, annotationCategories, selectedCategoryKeys, handleToggleCategory, selectedAnnotationId, handleSelectAnnotation]
  )

  const ui = (
    <>
      {showAnnotations && (
        <AnnotationLayer
          annotations={visibleAnnotations}
          categories={annotationCategories}
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
        onSave={handleSaveAnnotationModal}
        onDelete={handleDeleteAnnotationModal}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
        onSwitchAnnotation={handleSwitchAnnotationModal}
        onAddRelatedAnnotation={handleAddRelatedAnnotation}
      />
    </>
  )

  return { state, actions, ui, docDrawerProps }
}
