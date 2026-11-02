import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Annotation, AnnotationCategory, AnnotationDraft, AnnotationsData } from '../lib/annotations'
import {
  getNextNumber,
  DEFAULT_ANNOTATIONS_DATA,
  EMPTY_DRAFT,
  applyDraft,
  applyAnnotationChanges,
  loadDraft,
  clearDraft,
} from '../lib/annotations'

interface UseAnnotationsReturn {
  annotations: Annotation[]
  categories: AnnotationCategory[]
  persisted: AnnotationsData
  draft: AnnotationDraft
  loading: boolean
  error: string | null
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  currentAnnotations: Annotation[]
  prepareAnnotation: (selector: string) => Annotation
  saveElementAnnotations: (changes: { upserted: Annotation[]; deleted: string[] }) => Promise<void>
}

const API_URL = '/api/annotations'

async function fetchAnnotations(): Promise<AnnotationsData> {
  const res = await fetch(API_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch annotations: ${res.status}`)
  }
  return res.json()
}

async function saveAnnotations(data: AnnotationsData): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(`Failed to save annotations: ${res.status}`)
  }
}

export function useAnnotations(pagePath: string): UseAnnotationsReturn {
  // 持久化数据（来自本地文件）
  const [persisted, setPersisted] = useState<AnnotationsData>({ annotations: [], categories: [] })
  // 草稿数据（来自 localStorage）
  const [draft, setDraft] = useState<AnnotationDraft>(EMPTY_DRAFT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 初始加载：从本地文件读取持久化数据，从 localStorage 读取草稿
  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => setLoading(true))
    Promise.all([fetchAnnotations(), Promise.resolve(loadDraft())])
      .then(([data, savedDraft]) => {
        if (cancelled) return
        setPersisted({
          annotations: data.annotations || [],
          categories: data.categories || [],
        })
        setDraft(savedDraft)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('加载标注失败，使用默认值：', err)
        setPersisted(DEFAULT_ANNOTATIONS_DATA)
        setDraft(EMPTY_DRAFT)
        setError(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 合并后的数据
  const merged = useMemo(() => applyDraft(persisted, draft), [persisted, draft])

  const currentAnnotations = useMemo(
    () => merged.annotations.filter((a) => a.pagePath === pagePath),
    [merged.annotations, pagePath]
  )

  // 根据选择器生成一条临时批注，但不写入数据；需要调用 saveElementAnnotations 才会保存
  const prepareAnnotation = useCallback(
    (selector: string): Annotation => {
      const defaultCategory = merged.categories[0]?.key || 'other'
      return {
        id: `anno-${Date.now()}`,
        pagePath,
        number: getNextNumber(merged.annotations, pagePath),
        title: '',
        content: '',
        category: defaultCategory,
        selector,
        position: 'top-left',
        createdAt: Date.now(),
      }
    },
    [merged.categories, merged.annotations, pagePath]
  )

  // 直接写入本地文件：合并历史草稿后应用增删改，再提交到 /api/annotations
  const saveElementAnnotations = useCallback(
    async ({ upserted, deleted }: { upserted: Annotation[]; deleted: string[] }) => {
      const base = applyDraft(persisted, draft)
      const nextData: AnnotationsData = {
        annotations: applyAnnotationChanges(base.annotations, { upserted, deleted }),
        categories: base.categories,
      }
      await saveAnnotations(nextData)
      setPersisted(nextData)
      clearDraft()
      setDraft(EMPTY_DRAFT)
      setSelectedId(upserted[0]?.id ?? null)
    },
    [persisted, draft]
  )

  return {
    annotations: merged.annotations,
    categories: merged.categories,
    persisted,
    draft,
    loading,
    error,
    selectedId,
    setSelectedId,
    currentAnnotations,
    prepareAnnotation,
    saveElementAnnotations,
  }
}
