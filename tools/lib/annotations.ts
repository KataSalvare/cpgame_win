// 标注数据类型与工具函数（独立模块，供 hooks 与组件共享）

import {
  DEFAULT_ANNOTATION_CATEGORIES,
  DEFAULT_ANNOTATIONS,
  DEFAULT_ANNOTATIONS_DATA,
} from '@/content/annotations/defaults'
import { DEFAULT_CATEGORY_KEYS } from '@/content/annotations/categories'

export {
  DEFAULT_ANNOTATION_CATEGORIES,
  DEFAULT_ANNOTATIONS,
  DEFAULT_ANNOTATIONS_DATA,
  DEFAULT_CATEGORY_KEYS,
}

export interface Annotation {
  id: string
  pagePath: string
  number: number
  title: string
  content: string
  category: string
  // 元素选择器定位（新方式）
  selector?: string
  // 兼容旧数据的百分比坐标
  x?: number
  y?: number
  // 标记位于元素的哪个角，默认左上
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  createdAt: number
}

export interface AnnotationCategory {
  key: string
  label: string
  color: string
}

export interface AnnotationsData {
  annotations: Annotation[]
  categories: AnnotationCategory[]
}

// 草稿数据：未保存到本地文件的临时改动
export interface AnnotationDraft {
  annotations: {
    created: Annotation[]
    updated: Annotation[]
    deleted: string[]
  }
  categories: {
    created: AnnotationCategory[]
    deleted: string[]
  }
}

export const DRAFT_STORAGE_KEY = 'prototype-annotations-draft'

export const EMPTY_DRAFT: AnnotationDraft = {
  annotations: { created: [], updated: [], deleted: [] },
  categories: { created: [], deleted: [] },
}

// 计算当前页面下一个编号（按页面递增，不同页面重新排列）
export function getNextNumber(annotations: Annotation[], pagePath: string): number {
  const pageAnnotations = annotations.filter((a) => a.pagePath === pagePath)
  return pageAnnotations.length > 0 ? Math.max(...pageAnnotations.map((a) => a.number)) + 1 : 1
}

// 按页面重新排列编号：每个页面内部按 createdAt 排序后从 1 开始编号
export function renumberAnnotations(annotations: Annotation[]): Annotation[] {
  const byPage: Record<string, Annotation[]> = {}
  annotations.forEach((a) => {
    if (!byPage[a.pagePath]) byPage[a.pagePath] = []
    byPage[a.pagePath].push(a)
  })

  const result: Annotation[] = []
  Object.values(byPage).forEach((group) => {
    group
      .sort((a, b) => a.createdAt - b.createdAt)
      .forEach((a, idx) => {
        result.push({ ...a, number: idx + 1 })
      })
  })
  return result
}

// 将草稿改动合并到持久化数据
export function applyDraft(data: AnnotationsData, draft: AnnotationDraft): AnnotationsData {
  let annotations = [...data.annotations]

  // 删除
  annotations = annotations.filter((a) => !draft.annotations.deleted.includes(a.id))

  // 更新
  draft.annotations.updated.forEach((updated) => {
    annotations = annotations.map((a) => (a.id === updated.id ? updated : a))
  })

  // 新增
  annotations = [...annotations, ...draft.annotations.created]

  // 分类：删除
  let categories = data.categories.filter((c) => !draft.categories.deleted.includes(c.key))

  // 分类：新增
  categories = [...categories, ...draft.categories.created]

  return {
    annotations: renumberAnnotations(annotations),
    categories,
  }
}

// 从 localStorage 加载草稿
export function loadDraft(): AnnotationDraft {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        annotations: {
          created: parsed.annotations?.created || [],
          updated: parsed.annotations?.updated || [],
          deleted: parsed.annotations?.deleted || [],
        },
        categories: {
          created: parsed.categories?.created || [],
          deleted: parsed.categories?.deleted || [],
        },
      }
    }
  } catch {
    // ignore
  }
  return EMPTY_DRAFT
}

// 保存草稿到 localStorage
export function saveDraft(draft: AnnotationDraft): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // ignore
  }
}

// 清空草稿
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch {
    // ignore
  }
}

// 转义 CSS 选择器中的特殊字符
const escapeSelector = (typeof CSS !== 'undefined' && CSS.escape)
  ? CSS.escape
  : (value: string): string => value.replace(/([.#()[\]:\\|*+?^$])/g, '\\$1')

// 生成元素的稳定选择器（基于元素在 DOM 中的路径）
export function getElementSelector(element: HTMLElement, root: HTMLElement): string {
  const path: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== root) {
    let selector = current.tagName.toLowerCase()
    if (current.id) {
      selector += `#${escapeSelector(current.id)}`
      path.unshift(selector)
      break
    }
    if (current.className && typeof current.className === 'string') {
      const classes = current.className
        .split(' ')
        .map((c) => c.trim())
        .filter((c) => c && !c.startsWith('hover:') && !c.startsWith('focus:') && !c.startsWith('active:'))
        .map(escapeSelector)
        .filter((c) => c)
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`
      }
    }
    const siblings = Array.from(current.parentElement?.children || [])
    const sameTagSiblings = siblings.filter((s) => s.tagName === current!.tagName)
    if (sameTagSiblings.length > 1) {
      const index = sameTagSiblings.indexOf(current) + 1
      selector += `:nth-of-type(${index})`
    }
    path.unshift(selector)
    current = current.parentElement
  }

  return path.join(' > ')
}

// 根据选择器在容器内查找元素
export function findElementBySelector(selector: string, root: HTMLElement): HTMLElement | null {
  try {
    return root.querySelector(selector) as HTMLElement | null
  } catch {
    return null
  }
}

// 判断元素在容器内是否可见（用于让弹窗/抽屉上的批注随容器一起展示/隐藏）
export function isElementVisible(element: HTMLElement, container: HTMLElement): boolean {
  if (!element.isConnected) return false
  let current: Element | null = element
  while (current && current !== container) {
    if (!container.contains(current)) return false
    const style = window.getComputedStyle(current)
    if (style.display === 'none') return false
    if (style.visibility === 'hidden') return false
    if (parseFloat(style.opacity) <= 0.01) return false
    if ((current as HTMLElement).hidden) return false
    if (current.getAttribute('aria-hidden') === 'true') return false
    current = current.parentElement
  }
  return true
}

// 判断元素是否位于预览容器当前可视区域内
export function isElementInViewport(element: HTMLElement, container: HTMLElement): boolean {
  const elementRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return (
    elementRect.bottom > containerRect.top &&
    elementRect.top < containerRect.bottom &&
    elementRect.right > containerRect.left &&
    elementRect.left < containerRect.right
  )
}

// 获取元素的有效 z-index 数值（auto 视为 0）
function getZIndex(element: HTMLElement): number {
  const z = window.getComputedStyle(element).zIndex
  return z === 'auto' ? 0 : parseInt(z, 10) || 0
}

// 在容器内查找当前最顶层可见的 overlay/dialog/modal
// 支持 data-overlay / data-modal / <dialog> / role="dialog" 等标记
export function findActiveOverlay(container: HTMLElement): HTMLElement | null {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(
      '[data-overlay], [data-modal], dialog, [role="dialog"], [role="alertdialog"]'
    )
  ).filter((el) => isElementVisible(el, container))

  if (candidates.length === 0) return null

  // 按 z-index 排序，取最高的
  candidates.sort((a, b) => getZIndex(b) - getZIndex(a))
  return candidates[0] || null
}

const MARKER_SIZE = 20

// 计算元素相对于容器的位置，支持四角定位
export function getElementPosition(
  element: HTMLElement,
  container: HTMLElement,
  position: Annotation['position'] = 'top-left'
): { left: number; top: number } {
  const elementRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  let left: number
  let top: number
  switch (position) {
    case 'top-right':
      left = elementRect.right - containerRect.left
      top = elementRect.top - containerRect.top
      break
    case 'bottom-left':
      left = elementRect.left - containerRect.left
      top = elementRect.bottom - containerRect.top
      break
    case 'bottom-right':
      left = elementRect.right - containerRect.left
      top = elementRect.bottom - containerRect.top
      break
    case 'top-left':
    default:
      left = elementRect.left - containerRect.left
      top = elementRect.top - containerRect.top
      break
  }
  const leftPct = (left / containerRect.width) * 100
  const topPct = (top / containerRect.height) * 100
  // 标记本身有固定尺寸，定位在边缘时会有一半跑到可视区域外；
  // 用半个标记尺寸作为边距进行钳制，确保标记始终可见。
  const marginLeft = (MARKER_SIZE / 2 / containerRect.width) * 100
  const marginTop = (MARKER_SIZE / 2 / containerRect.height) * 100
  return {
    left: Math.max(marginLeft, Math.min(100 - marginLeft, leftPct)),
    top: Math.max(marginTop, Math.min(100 - marginTop, topPct)),
  }
}
