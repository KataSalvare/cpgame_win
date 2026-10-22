import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, FileText, LockKeyhole, MapPin, Pencil, Save, XIcon } from 'lucide-react'
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
const EDIT_SESSION_KEY = 'prototype-spec-edit-verified'

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
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [password, setPassword] = useState('')
  const [passwordPrompt, setPasswordPrompt] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [verified, setVerified] = useState(() => sessionStorage.getItem(EDIT_SESSION_KEY) === 'true')
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
        let saved: { content?: string | null } | null = null
        try {
          const response = await fetch(`/api/spec/${encodeURIComponent(currentPage.dirName)}`)
          if (response.ok) saved = await response.json() as { content?: string | null }
        } catch {
          // 静态预览环境没有写入 API 时，仍可展示打包的原始文档。
        }
        setDocContent(saved?.content ?? content)
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

  const beginEditing = () => {
    if (!docContent || docContent === '暂无 PRD 文档。' || docContent === '无法加载文档。') return
    if (!verified) {
      setPasswordPrompt(true)
      setPasswordError(false)
      return
    }
    setDraft(docContent)
    setEditing(true)
  }

  const verifyPassword = () => {
    if (password !== '891025') {
      setPasswordError(true)
      return
    }
    sessionStorage.setItem(EDIT_SESSION_KEY, 'true')
    setVerified(true)
    setPasswordPrompt(false)
    setPassword('')
    setDraft(docContent ?? '')
    setEditing(true)
  }

  const saveDocument = async () => {
    if (!currentPage) return
    setSaving(true)
    try {
      const response = await fetch(`/api/spec/${encodeURIComponent(currentPage.dirName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      })
      if (!response.ok) throw new Error('保存失败')
      setDocContent(draft)
      setEditing(false)
    } catch {
      window.alert('文档保存失败，请检查服务连接后重试。')
    } finally {
      setSaving(false)
    }
  }

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
          <div className="flex h-full min-h-0 flex-col bg-[color-mix(in_srgb,var(--tool-background)_30%,transparent)]">
            {docContent && !docLoading && (
              <div className="flex shrink-0 items-center justify-end gap-2 border-b border-[var(--tool-border)] px-4 py-2">
                {editing ? (
                  <>
                    <button onClick={() => { setEditing(false); setDraft(docContent) }} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${textSecondary} ${hoverSurface}`}><XIcon size={14} />取消</button>
                    <button onClick={saveDocument} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--tool-brand)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><Save size={14} />{saving ? '保存中…' : '保存'}</button>
                  </>
                ) : (
                  <button onClick={beginEditing} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${textSecondary} ${hoverSurface}`}><Pencil size={14} />编辑文档</button>
                )}
              </div>
            )}
            {docLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin motion-reduce:animate-none w-6 h-6 border-2 border-current border-t-transparent rounded-full tool-accent" />
              </div>
            ) : docContent ? (
              editing ? (
                <textarea aria-label="编辑 PRD 文档 Markdown" value={draft} onChange={event => setDraft(event.target.value)} className="min-h-0 flex-1 resize-none overflow-y-auto bg-transparent px-5 py-4 font-mono text-sm leading-6 text-[var(--tool-text)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tool-focus)]" />
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5"><MarkdownDocument content={docContent} theme={theme} /></div>
              )
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
      {passwordPrompt && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/35 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPasswordPrompt(false) }}>
          <form onSubmit={event => { event.preventDefault(); verifyPassword() }} className={`w-full max-w-sm rounded-2xl border border-[var(--tool-border)] ${panelClass} p-5 shadow-2xl`}>
            <div className={`mb-4 flex items-center gap-2 font-semibold ${textPrimary}`}><LockKeyhole size={17} />验证编辑密码</div>
            <input autoFocus type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="请输入密码" className="w-full rounded-xl border border-[var(--tool-border)] bg-[var(--tool-background)] px-3 py-2.5 text-sm text-[var(--tool-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]" />
            {passwordError && <p className="mt-2 text-xs text-red-500">密码错误，请重试。</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPasswordPrompt(false)} className={`rounded-lg px-3 py-2 text-sm ${textSecondary} ${hoverSurface}`}>取消</button>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--tool-brand)] px-3 py-2 text-sm font-semibold text-white"><Check size={15} />验证并编辑</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
