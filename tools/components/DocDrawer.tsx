import { useState, useEffect, useCallback, useRef } from 'react'
import { FileText, MapPin, XIcon } from 'lucide-react'
import AnnotationPanel from './AnnotationPanel'
import MarkdownDocument from './MarkdownDocument'
import type { Annotation, AnnotationCategory } from '../lib/annotations'
import { useToolEntrance } from '../hooks/useToolEntrance'

export type Theme = 'light' | 'dark'

export interface PageItem {
  path: string
  label: string
  dirName: string
}

interface DocDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentPage: PageItem | undefined
  docTab: 'spec' | 'annotations'
  setDocTab: (tab: 'spec' | 'annotations') => void
  theme: Theme
  annotations: Annotation[]
  categories: AnnotationCategory[]
  selectedCategories: Set<string>
  onToggleCategory: (key: string) => void
  selectedId: string | null
  onSelectAnnotation: (id: string, clientX: number, clientY: number) => void
}

const specGlob = import.meta.glob('../../src/prototypes/*/spec.md', { query: '?raw', import: 'default' })

function getSpecKey(dirName: string): string {
  return `../../src/prototypes/${dirName}/spec.md`
}

export default function DocDrawer({
  isOpen,
  onClose,
  currentPage,
  docTab,
  setDocTab,
  theme,
  annotations,
  categories,
  selectedCategories,
  onToggleCategory,
  selectedId,
  onSelectAnnotation,
}: DocDrawerProps) {
  const isDark = theme === 'dark'
  const [docContent, setDocContent] = useState<string | null>(null)
  const [docLoading, setDocLoading] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useToolEntrance(drawerRef, drawerRef, isOpen, { x: 20, duration: 0.28 })

  const loadSpec = useCallback(async () => {
    if (!currentPage) {
      setDocContent(null)
      return
    }
    setDocLoading(true)
    setDocContent(null)
    const key = getSpecKey(currentPage.dirName)
    const loader = specGlob[key]
    if (loader) {
      try {
        const content = await loader() as string
        setDocContent(content)
      } catch {
        setDocContent('无法加载文档。')
      }
    } else {
      setDocContent('暂无 PRD 文档。')
    }
    setDocLoading(false)
  }, [currentPage])

  // 切换到 PRD 文档时自动加载
  useEffect(() => {
    if (isOpen && docTab === 'spec') {
      queueMicrotask(() => loadSpec())
    }
  }, [isOpen, docTab, loadSpec])

  if (!isOpen || !currentPage) return null

  const panelClass = isDark ? 'tool-panel-dark' : 'tool-panel-light'
  const textPrimary = 'text-[var(--tool-text)]'
  const textSecondary = 'text-[var(--tool-text-muted)]'
  const textMuted = 'text-[var(--tool-text-subtle)]'
  const hoverSurface = 'hover:bg-[var(--tool-surface-hover)]'

  return (
    <div
      ref={drawerRef}
      className={[
        'flex flex-col z-[1000] tool-panel-light dark:tool-panel-dark shadow-[-14px_0_32px_color-mix(in_srgb,var(--tool-text)_7%,transparent)]',
        // 移动端：从右侧滑出的固定抽屉，无遮罩，方便快速切换
        'fixed inset-y-0 right-0 w-[320px]',
        // PC：作为布局的一部分并排显示，原型完整可见
        'lg:static lg:w-[420px] lg:flex-shrink-0',
        panelClass,
      ].join(' ')}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-4 bg-[var(--tool-surface-raised)]">
        <div className="min-w-0">
          <h2 className={`text-sm font-bold truncate ${textPrimary}`}>{currentPage.label}</h2>
          <p className={`text-xs mt-0.5 truncate ${textMuted}`}>{currentPage.dirName}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex h-9 w-9 items-center justify-center rounded-xl tool-control ${textSecondary} ${hoverSurface} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]`}
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 px-3 pt-2">
        <button
          onClick={() => setDocTab('spec')}
          className={`flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-t-xl tool-control ${
            docTab === 'spec'
              ? 'tool-control-active'
              : `${textSecondary} ${hoverSurface}`
          }`}
        >
          <FileText size={15} />
          PRD 文档
        </button>
        <button
          onClick={() => setDocTab('annotations')}
          className={`flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-t-xl tool-control ${
            docTab === 'annotations'
              ? 'tool-control-active'
              : `${textSecondary} ${hoverSurface}`
          }`}
        >
          <MapPin size={15} />
          标注说明
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--tool-surface-muted)] text-[var(--tool-text-muted)]">
            {annotations.length}
          </span>
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-hidden">
        {docTab === 'spec' ? (
          <div className="h-full overflow-y-auto px-5 py-5 bg-[color-mix(in_srgb,var(--tool-background)_30%,transparent)]">
            {docLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin motion-reduce:animate-none w-6 h-6 border-2 border-current border-t-transparent rounded-full tool-accent" />
              </div>
            ) : docContent ? (
              <MarkdownDocument content={docContent} theme={theme} />
            ) : (
              <div className={`text-center py-20 ${textMuted}`}>加载失败</div>
            )}
          </div>
        ) : (
          <AnnotationPanel
            annotations={annotations}
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={onToggleCategory}
            selectedId={selectedId}
            theme={theme}
            onSelect={onSelectAnnotation}
          />
        )}
      </div>
    </div>
  )
}
