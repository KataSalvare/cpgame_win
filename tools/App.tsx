import '@/themes/grayscale-prototype/palette.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DocDrawer from './components/DocDrawer'
import { Sidebar } from './shell/Sidebar'
import { Topbar } from './shell/Topbar'
import { useAnnotationController } from './tools/AnnotationController'
import { pages } from './config/pages'
import { loadProjectName, loadShortcuts, loadTheme, saveProjectName, saveTheme, type Theme } from './lib/shortcuts'
import { ThemeDetailPage } from '@/workspace/ThemeDetailPage'
import { ThemesListPage } from '@/workspace/ThemesListPage'
import { DocDetailPage } from '@/workspace/DocDetailPage'
import { DocsListPage } from '@/workspace/DocsListPage'
import { useToolEntrance } from './hooks/useToolEntrance'
import { DESKTOP_PREVIEW_HEIGHT, DESKTOP_PREVIEW_WIDTH, usePreviewScale } from './hooks/usePreviewScale'

const DEFAULT_PROJECT_NAME = '项目原型预览'
type Toast = { message: string; type: 'success' | 'error' }

function ToolToast({ toast, theme }: { toast: Toast; theme: Theme }) {
  const toastRef = useRef<HTMLDivElement>(null)
  useToolEntrance(toastRef, toastRef, true, { y: 10, scale: 0.98, duration: 0.22 })

  return (
    <div
      ref={toastRef}
      className={`pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl border ${
        toast.type === 'success'
          ? `${theme === 'dark' ? 'tool-panel-dark' : 'tool-panel-light'} tool-accent border-current/10`
          : `${theme === 'dark' ? 'bg-red-950/90 text-red-200 border-red-900/50' : 'bg-red-50 text-red-700 border-red-100'} shadow-lg`
      }`}
    >
      {toast.message}
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const currentPage = useMemo(() => pages.find(p => p.path === location.pathname), [location.pathname])
  const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(null)
  const previewRef = useCallback((node: HTMLDivElement | null) => {
    setPreviewContainer(node)
  }, [])

  const [prototypePalette, setPrototypePalette] = useState<'grayscale' | 'color'>('grayscale')
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'pc'>('pc')
  const { stageRef, scale: previewScale } = usePreviewScale()
  const fixedDesktopPreview = deviceMode === 'pc' && currentPage != null
  const [previewStateByPath, setPreviewStateByPath] = useState<Record<string, string>>({})

  const previewState = currentPage ? previewStateByPath[currentPage.path] : undefined
  const activePreviewState = currentPage?.states.some((state) => state.id === previewState)
    ? previewState
    : currentPage?.states[0]?.id

  const handlePreviewStateChange = useCallback((state: string) => {
    if (!currentPage) return
    setPreviewStateByPath((previous) => ({ ...previous, [currentPage.path]: state }))
  }, [currentPage])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('prototype-sidebar-collapsed') === 'true'
    } catch {
      return false
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('prototype-sidebar-collapsed', String(sidebarCollapsed))
    } catch {
      // ignore
    }
  }, [sidebarCollapsed])

  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)
  const [shortcuts, setShortcuts] = useState(loadShortcuts)
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [projectName, setProjectName] = useState<string>(loadProjectName)
  const [docOpen, setDocOpen] = useState(false)
  const [docTab, setDocTab] = useState<'spec' | 'annotations'>('spec')

  // 同步 html dark class 与 shadcn/CSS 变量
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const { state: annotationState, actions: annotationActions, ui: annotationUI, docDrawerProps } = useAnnotationController({
    previewContainer,
    currentPath: location.pathname,
    theme,
    deviceMode,
    onOpenDocAnnotations: useCallback(() => {
      setDocTab('annotations')
      setDocOpen(true)
    }, []),
  })

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    saveTheme(newTheme)
  }, [theme])

  const handleProjectNameChange = useCallback((name: string) => {
    setProjectName(name)
    saveProjectName(name)
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeoutRef.current !== null) window.clearTimeout(toastTimeoutRef.current)
    setToast({ message, type })
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, 3000)
  }, [])

  useEffect(() => () => {
    if (toastTimeoutRef.current !== null) window.clearTimeout(toastTimeoutRef.current)
  }, [])

  const handleOpenDoc = useCallback(() => {
    setDocTab('spec')
    setDocOpen(true)
  }, [])

  const handleToggleDoc = useCallback(() => {
    if (docOpen) {
      setDocOpen(false)
    } else {
      setDocTab('spec')
      setDocOpen(true)
    }
  }, [docOpen])

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'tool-backdrop-dark' : 'tool-backdrop-light'}`}>
      <Sidebar
        projectName={projectName || DEFAULT_PROJECT_NAME}
        onProjectNameChange={handleProjectNameChange}
        collapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          prototypePalette={prototypePalette}
          onTogglePrototypePalette={() => setPrototypePalette(previous => previous === 'grayscale' ? 'color' : 'grayscale')}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          showToast={showToast}
          shortcuts={shortcuts}
          setShortcuts={setShortcuts}
          theme={theme}
          previewState={activePreviewState}
          previewStates={currentPage?.states ?? []}
          onPreviewStateChange={handlePreviewStateChange}
          toggleTheme={toggleTheme}
          annotationState={annotationState}
          annotationActions={annotationActions}
          docOpen={docOpen}
          onOpenDoc={handleOpenDoc}
          onToggleDoc={handleToggleDoc}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapsed={() => setSidebarCollapsed(prev => !prev)}
        />

        <main className="flex-1 overflow-hidden flex flex-col relative tool-workspace">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] pointer-events-none">
            {toast && (
              <ToolToast key={`${toast.type}-${toast.message}`} toast={toast} theme={theme} />
            )}
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto p-4 lg:p-5 tool-workspace">
              <div className="h-full min-h-full rounded-[1.75rem] p-3 lg:p-4 tool-stage">
                <div ref={stageRef} className={`h-full w-full ${fixedDesktopPreview ? 'flex items-center justify-center' : ''}`}>
                  <div
                    className={`relative z-[100] mx-auto shrink-0 ${
                      deviceMode === 'mobile'
                        ? 'w-[400px] h-[852px] mt-12'
                        : fixedDesktopPreview ? '' : 'w-full h-full'
                    }`}
                    style={fixedDesktopPreview ? {
                      width: DESKTOP_PREVIEW_WIDTH * previewScale,
                      height: DESKTOP_PREVIEW_HEIGHT * previewScale,
                    } : undefined}
                  >
                    <div className={`absolute inset-0 overflow-hidden shadow-2xl ${deviceMode === 'mobile' ? 'rounded-[2.5rem] ring-8 ring-black/5' : 'rounded-2xl'}`}>
                      <div
                        ref={previewRef}
                        id="preview-container"
                        data-prototype-palette={currentPage ? prototypePalette : undefined}
                        className={`w-full h-full bg-white ${
                          deviceMode === 'mobile' ? 'rounded-[2.5rem]' : 'rounded-2xl'
                        }`}
                        style={fixedDesktopPreview ? {
                          width: DESKTOP_PREVIEW_WIDTH,
                          height: DESKTOP_PREVIEW_HEIGHT,
                          transform: `scale(${previewScale}) translateZ(0)`,
                          transformOrigin: 'top left',
                        } : { transform: 'translateZ(0)' }}
                      >
                        <div className={`prototype-content-scroll ${deviceMode === 'mobile' ? 'h-full overflow-y-auto overscroll-contain' : 'w-full h-full overflow-auto'}`}>
                          <Suspense
                            fallback={(
                              <div className="flex h-full w-full items-center justify-center" role="status" aria-live="polite">
                                <div className="flex items-center gap-2 text-sm text-[var(--tool-text-muted)]">
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                                  正在加载原型…
                                </div>
                              </div>
                            )}
                          >
                            <Routes>
                              <Route path="/" element={<Navigate to="/game-companion-login" replace />} />
                              {pages.map(page => (
                                <Route
                                  key={page.path}
                                  path={page.path}
                                  element={
                                    <page.component
                                      key={page.path}
                                      previewState={page.path === currentPage?.path ? activePreviewState : undefined}
                                      onPreviewStateChange={page.path === currentPage?.path ? handlePreviewStateChange : undefined}
                                      entryView={page.entryView}
                                    />
                                  }
                                />
                              ))}
                              <Route path="/themes" element={<ThemesListPage />} />
                              <Route path="/theme/:themeId" element={<ThemeDetailPage />} />
                              <Route path="/docs" element={<DocsListPage />} />
                              <Route path="/doc/:docId" element={<DocDetailPage />} />
                            </Routes>
                          </Suspense>
                        </div>
                      </div>
                    </div>

                    {annotationUI}
                  </div>
                </div>
              </div>
            </div>

            {docOpen && (
              <DocDrawer
                isOpen={docOpen}
                onClose={() => setDocOpen(false)}
                currentPage={currentPage}
                docTab={docTab}
                setDocTab={setDocTab}
                theme={theme}
                {...docDrawerProps}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
