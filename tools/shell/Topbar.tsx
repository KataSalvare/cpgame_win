import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FileText,
  Keyboard,
  Monitor,
  Moon,
  Pencil,
  Save,
  Smartphone,
  Sun,
  Trash2,
  Eye,
  EyeOff,
  MousePointer,
  XIcon,
  PanelLeft,
} from 'lucide-react'
import { TooltipButton } from './TooltipButton'
import { PreviewStateBar } from './PreviewStateBar'
import { ToolbarMoreMenu } from './ToolbarMoreMenu'
import { ShortcutsDialog } from '../tools/ShortcutsDialog'
import {
  checkAxureBridge,
  formatShortcut,
  isShortcutModalOpen,
  matchShortcut,
  saveShortcuts,
  type ShortcutConfig,
  type Theme,
} from '../lib/shortcuts'
import { pages } from '../config/pages'
import type { AnnotationControllerActions, AnnotationControllerState } from '../tools/AnnotationController'

interface TopbarProps {
  deviceMode: 'mobile' | 'pc'
  setDeviceMode: (mode: 'mobile' | 'pc') => void
  showToast: (message: string, type?: 'success' | 'error') => void
  shortcuts: ShortcutConfig
  setShortcuts: (shortcuts: ShortcutConfig) => void
  theme: Theme
  previewState?: string
  previewStates: readonly { id: string; label: string }[]
  onPreviewStateChange: (state: string) => void
  toggleTheme: () => void
  annotationState: AnnotationControllerState
  annotationActions: AnnotationControllerActions
  docOpen: boolean
  onOpenDoc: () => void
  onToggleDoc: () => void
  sidebarCollapsed: boolean
  onToggleSidebarCollapsed: () => void
}

const AxureIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.75" y="0.75" width="12.5" height="12.5" rx="3.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 10.2 6.6 4h0.8l2.6 6.2M5 8.4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const FigmaIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z" fill="#0ACF83"/>
    <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z" fill="#FF7262"/>
    <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z" fill="#F24E1E"/>
    <path d="M0 28.5C0 31.0196 1.00089 33.4359 2.78249 35.2175C4.56408 36.9991 6.98044 38 9.5 38H19V19H9.5C6.98044 19 4.56408 20.0009 2.78249 21.7825C1.00089 23.5641 0 25.9804 0 28.5Z" fill="#A259FF"/>
  </svg>
)

export const Topbar = ({
  deviceMode,
  setDeviceMode,
  showToast,
  shortcuts,
  setShortcuts,
  theme,
  previewState,
  previewStates,
  onPreviewStateChange,
  toggleTheme,
  annotationState,
  annotationActions,
  docOpen,
  onOpenDoc,
  onToggleDoc,
  sidebarCollapsed,
  onToggleSidebarCollapsed,
}: TopbarProps) => {
  const location = useLocation()
  const currentPage = pages.find(p => p.path === location.pathname)
  const [copying, setCopying] = useState(false)
  const [copyingAxure, setCopyingAxure] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showAnnotationsBeforeEdit, setShowAnnotationsBeforeEdit] = useState(annotationState.showAnnotations)

  const { showAnnotations, annotationEditMode, annotationSelecting, hasDraft } = annotationState
  const { enableEditMode, exitEditMode, toggleSelecting, toggleShow, setShowAnnotations, saveDraft, clearDraft } = annotationActions

  const hasSpec = currentPage != null
  const isDark = theme === 'dark'

  const baseBtn = `inline-flex shrink-0 items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium whitespace-nowrap rounded-xl border tool-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]`
  const ghostBtn = `${baseBtn} border-transparent text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]`
  const activeGhostBtn = `${baseBtn} tool-control-active`
  const segmentBtn = `inline-flex shrink-0 items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium whitespace-nowrap rounded-lg border tool-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]`
  const activeSegmentBtn = `${segmentBtn} border-[var(--tool-brand)]/35 bg-[var(--tool-surface)] tool-accent shadow-sm`
  const inactiveSegmentBtn = `${segmentBtn} border-transparent text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]`
  const accentBtn = `${baseBtn} tool-accent-bg text-white hover:bg-[var(--tool-brand-hover)] shadow-sm`

  const copyToFigma = useCallback(async () => {
    setCopying(true)
    try {
      const response = await fetch('/scripts/figma/runner.js')
      const scriptText = await response.text()
      const runnerFn = new Function('return ' + scriptText)()
      await runnerFn('#preview-container')
    } catch (error) {
      console.error('复制到 Figma 失败:', error)
      showToast('复制到 Figma 失败', 'error')
    } finally {
      setCopying(false)
    }
  }, [showToast])

  const copyToAxure = useCallback(async () => {
    setCopyingAxure(true)
    try {
      if (!(await checkAxureBridge())) {
        showToast('请先打开 Axure RP 10 或更高版本，再复制到 Axure', 'error')
        return
      }
      const response = await fetch('/scripts/axure/runner.js')
      const scriptText = await response.text()
      const runnerFn = new Function('return ' + scriptText)()
      const result = await runnerFn('#preview-container')
      showToast(`已复制 ${result?.itemCount ?? 0} 个元件到 Axure，请在画布中粘贴`, 'success')
    } catch (error) {
      console.error('复制到 Axure 失败:', error)
      showToast('复制到 Axure 失败，请检查 Axure 是否已打开文件', 'error')
    } finally {
      setCopyingAxure(false)
    }
  }, [showToast])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isShortcutModalOpen()) return

      if (e.key === 'Escape' && annotationEditMode) {
        e.preventDefault()
        setShowAnnotations(showAnnotationsBeforeEdit)
        exitEditMode()
        return
      }

      if (matchShortcut(e, shortcuts.copyToFigma)) {
        e.preventDefault()
        copyToFigma()
        return
      }

      if (matchShortcut(e, shortcuts.copyToAxure)) {
        e.preventDefault()
        copyToAxure()
        return
      }

      if (matchShortcut(e, shortcuts.openDoc)) {
        e.preventDefault()
        onToggleDoc()
        return
      }

      if (matchShortcut(e, shortcuts.selectElement)) {
        e.preventDefault()
        if (!annotationEditMode) {
          setShowAnnotationsBeforeEdit(showAnnotations)
          enableEditMode()
        }
        toggleSelecting()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, onToggleDoc, copyToFigma, copyToAxure, annotationEditMode, showAnnotations, enableEditMode, toggleSelecting, exitEditMode, setShowAnnotations, showAnnotationsBeforeEdit])

  return (
    <>
      <header
        className="h-14 flex min-w-0 items-center gap-2 px-3 flex-shrink-0 z-[1000] overflow-visible tool-toolbar tool-surface-light dark:tool-surface-dark"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <TooltipButton
          tooltip={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleSidebarCollapsed()
          }}
          className="flex shrink-0 items-center justify-center w-9 h-9 rounded-xl border border-transparent text-[var(--tool-text-muted)] tool-control hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]"
        >
          <PanelLeft size={18} />
        </TooltipButton>

        <div className="flex items-center gap-2 ml-1 min-w-0 shrink-0">
          <div className="flex items-center gap-2 h-9 max-w-[180px] min-[1400px]:max-w-[250px] px-3 rounded-xl bg-[var(--tool-surface-muted)] shadow-[var(--tool-shadow-sm)]">
            <span className="hidden min-[1400px]:inline text-[11px] font-medium text-[var(--tool-text-subtle)]">当前页面</span>
            <span className="text-xs font-semibold truncate max-w-[100px] min-[1180px]:max-w-[140px] text-[var(--tool-text)]">
              {currentPage?.label || '首页'}
            </span>
            {currentPage && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--tool-surface)] text-[var(--tool-text-muted)]">
                {currentPage.category === 'frontend' ? '前端' : '后台'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--tool-surface-muted)] shadow-[var(--tool-shadow-sm)] shrink-0">
          <TooltipButton
            tooltip="切换为移动端预览"
            onClick={(e) => {
              e.stopPropagation()
              setDeviceMode('mobile')
            }}
            className={deviceMode === 'mobile' ? activeSegmentBtn : inactiveSegmentBtn}
          >
            <Smartphone size={14} />
            <span className="hidden min-[1180px]:inline">移动端</span>
          </TooltipButton>
          <TooltipButton
            tooltip="切换为PC端预览"
            onClick={(e) => {
              e.stopPropagation()
              setDeviceMode('pc')
            }}
            className={deviceMode === 'pc' ? activeSegmentBtn : inactiveSegmentBtn}
          >
            <Monitor size={14} />
            <span className="hidden min-[1180px]:inline">PC端</span>
          </TooltipButton>
          </div>

          <PreviewStateBar
            states={previewStates}
            value={previewState}
            onChange={onPreviewStateChange}
            theme={theme}
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
          {annotationEditMode ? (
            <>
              <TooltipButton
                tooltip={`选择页面元素 (${formatShortcut(shortcuts.selectElement)})`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSelecting()
                }}
                className={annotationSelecting ? accentBtn : ghostBtn}
              >
                <MousePointer size={14} />
                <span className="hidden min-[1180px]:inline">{annotationSelecting ? '选择中' : '选择元素'}</span>
              </TooltipButton>
              <TooltipButton
                tooltip="清空当前未保存的批注改动"
                onClick={(e) => {
                  e.stopPropagation()
                  clearDraft()
                }}
                className={`${ghostBtn} ${!hasDraft && 'opacity-40 cursor-not-allowed'}`}
                disabled={!hasDraft}
              >
                <Trash2 size={14} />
                <span className="hidden min-[1180px]:inline">清空</span>
              </TooltipButton>
              <TooltipButton
                tooltip="保存到本地文件"
                onClick={async (e) => {
                  e.stopPropagation()
                  try {
                    await saveDraft()
                    showToast('批注已保存到本地文件', 'success')
                  } catch {
                    showToast('保存失败，请重试', 'error')
                  }
                }}
                className={`${baseBtn} ${isDark ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-emerald-600 hover:bg-emerald-50'} ${!hasDraft && 'opacity-40 cursor-not-allowed'}`}
                disabled={!hasDraft}
              >
                <Save size={14} />
                <span className="hidden min-[1180px]:inline">保存</span>
              </TooltipButton>
              <TooltipButton
                tooltip="退出编辑模式 (ESC)"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAnnotations(showAnnotationsBeforeEdit)
                  exitEditMode()
                }}
                className={ghostBtn}
              >
                <XIcon size={14} />
                <span className="hidden min-[1180px]:inline">退出</span>
              </TooltipButton>
            </>
          ) : (
            <>
              <TooltipButton
                tooltip="进入批注编辑模式"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAnnotationsBeforeEdit(showAnnotations)
                  enableEditMode()
                }}
                className={ghostBtn}
              >
                <Pencil size={14} />
                <span className="hidden min-[1180px]:inline">批注</span>
              </TooltipButton>
              <TooltipButton
                tooltip={showAnnotations ? '隐藏批注图标' : '显示批注图标'}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleShow()
                }}
                className={showAnnotations ? accentBtn : ghostBtn}
              >
                {showAnnotations ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="hidden min-[1180px]:inline">{showAnnotations ? '隐藏批注' : '显示批注'}</span>
              </TooltipButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 pl-3 shrink-0 shadow-[-10px_0_18px_-18px_var(--tool-text)]">
          <TooltipButton
            tooltip={isDark ? '切换到白天模式' : '切换到黑夜模式'}
            onClick={(e) => {
              e.stopPropagation()
              toggleTheme()
            }}
            className={ghostBtn}
            wrapperClassName="hidden min-[1400px]:inline-flex"
          >
            {isDark ? <Sun size={14} className="text-[#f4a261]" /> : <Moon size={14} />}
            <span>{isDark ? '白天' : '黑夜'}</span>
          </TooltipButton>

          <TooltipButton
            tooltip={`复制到 Figma (${formatShortcut(shortcuts.copyToFigma)})`}
            onClick={async (e) => {
              e.stopPropagation()
              await copyToFigma()
            }}
            disabled={copying}
            className={`${baseBtn} ${isDark ? 'text-[#f24e1e] hover:bg-[#f24e1e]/10' : 'text-[#f24e1e] hover:bg-[#f24e1e]/8'} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {copying ? (
              <div className="animate-spin motion-reduce:animate-none w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <FigmaIcon />
            )}
            <span className="hidden min-[1000px]:inline">{copying ? '复制中...' : '复制到 Figma'}</span>
          </TooltipButton>

          <TooltipButton
            tooltip={`复制到 Axure (${formatShortcut(shortcuts.copyToAxure)})`}
            onClick={async (e) => {
              e.stopPropagation()
              await copyToAxure()
            }}
            disabled={copyingAxure}
            className={`${baseBtn} text-[var(--tool-brand)] hover:bg-[var(--tool-brand)]/10 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {copyingAxure ? (
              <div className="animate-spin motion-reduce:animate-none w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <AxureIcon />
            )}
            <span className="hidden min-[1180px]:inline">{copyingAxure ? '复制中...' : '复制到 Axure'}</span>
          </TooltipButton>

          {hasSpec && (
            <TooltipButton
              tooltip={`查看文档 (${formatShortcut(shortcuts.openDoc)})`}
              onClick={onOpenDoc}
              className={docOpen ? activeGhostBtn : ghostBtn}
            >
              <FileText size={14} />
              <span className="hidden min-[1180px]:inline">查看文档</span>
            </TooltipButton>
          )}

          <TooltipButton
            tooltip="快捷键设置"
            onClick={(e) => {
              e.stopPropagation()
              setSettingsOpen(true)
            }}
            className={ghostBtn}
            wrapperClassName="hidden min-[1400px]:inline-flex"
          >
            <Keyboard size={14} />
            <span>快捷键</span>
          </TooltipButton>

          <ToolbarMoreMenu
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenShortcuts={() => setSettingsOpen(true)}
          />
        </div>
      </header>

      <ShortcutsDialog
        key={settingsOpen ? 'shortcut-open' : 'shortcut-closed'}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        shortcuts={shortcuts}
        onSave={(newShortcuts) => {
          setShortcuts(newShortcuts)
          saveShortcuts(newShortcuts)
        }}
      />
    </>
  )
}
