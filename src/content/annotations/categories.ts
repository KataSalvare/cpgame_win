import type { AnnotationCategory } from '@tools/lib/annotations'

export const DEFAULT_ANNOTATION_CATEGORIES: AnnotationCategory[] = [
  { key: 'interaction', label: '展示交互', color: '#3b82f6' },
  { key: 'business', label: '业务逻辑', color: '#f97316' },
  { key: 'state', label: '状态说明', color: '#10b981' },
]

export const DEFAULT_CATEGORY_KEYS = DEFAULT_ANNOTATION_CATEGORIES.map((c) => c.key)
