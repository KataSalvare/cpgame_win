import '@/themes/grayscale-prototype/palette.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
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
import { UpdateNotice } from './components/UpdateNotice'
import { EditAuthorizationProvider } from './components/EditAuthorization'

const messagePerspectiveEntryViews = ['im-user-support-view', 'im-user-message-view', 'im-support-view', 'im-companion-view', 'im-group-owner-view', 'im-group-user-view'] as const
const orderTabEntryViews = ['orders-receiving', 'orders-exam-candidate', 'orders-exam-proctor'] as const
const workbenchEntryViews = ['workbench-matches', 'workbench-orders', 'workbench-services', 'workbench-apply-service'] as const

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
  const navigate = useNavigate()
  const currentPage = useMemo(() => pages.find(p => p.path === location.pathname), [location.pathname])
  const initialPathSyncRef = useRef(true)
  useEffect(() => {
    if (!currentPage?.entryView) return
    const syncToolPath = () => {
      if (currentPage.defaultHash && !window.location.hash) {
        window.location.hash = currentPage.defaultHash
        return
      }
      const params = new URLSearchParams(window.location.hash.slice(1))
      const hashPage = params.get('page') ?? currentPage.entryView
      const hashTool = params.get('tool')
      const entryView = params.get('support') === 'club' ? 'club-support'
        : params.get('support') === 'platform' ? 'platform-support'
          : hashPage === 'workbench' && params.get('workbenchTab') === 'matches' ? 'workbench-matches'
            : hashPage === 'workbench' && params.get('workbenchTab') === 'orders' ? 'workbench-orders'
              : hashPage === 'workbench' && params.get('workbenchTab') === 'services' && params.get('applyService') === '1' ? 'workbench-apply-service'
                : hashPage === 'workbench' && params.get('workbenchTab') === 'services' ? 'workbench-services'
          : hashPage === 'orders' && params.get('orderTab') === 'receiving' ? 'orders-receiving'
            : hashPage === 'orders' && params.get('orderTab') === 'exam-candidate' ? 'orders-exam-candidate'
              : hashPage === 'orders' && params.get('orderTab') === 'exam-proctor' ? 'orders-exam-proctor'
          : hashTool && ['help-center', 'screen-recording', 'client-notifications', 'close-app', 'quick-panel', 'quick-match', 'quick-match-in-progress', 'identity-verification', 'global-search', 'voice-room-minimized', ...messagePerspectiveEntryViews].includes(hashTool) ? hashTool
        : hashPage === 'profile' && params.get('section') === 'onboarding' ? params.get('onboarding') === 'companion' ? 'profile-onboarding' : params.get('onboarding') === 'club' ? 'profile-club-onboarding' : 'profile-onboarding-center'
        : hashPage === 'profile' && params.get('section') === 'clubs' ? 'profile-clubs'
          : hashPage === 'profile' && params.get('section') === 'cancel-account' ? 'profile-cancel-account'
            : hashPage === 'profile' && params.get('section') === 'wealth' ? 'profile-wealth'
              : hashPage === 'profile' && params.get('section') === 'visits' ? 'profile-visits'
                : hashPage === 'profile' && params.get('section') === 'favorites' ? 'profile-social'
            : hashPage === 'messages' && params.get('support') === 'club' ? 'club-support'
              : hashPage === 'home' && params.get('support') === 'platform' ? 'platform-support'
                  : hashPage === 'home' && params.get('tool') ? params.get('tool')!
                : hashPage === 'voice-room' && params.get('voiceFrom') === 'club'
        ? 'club-voice-room'
        : hashPage === 'recharge' || hashPage === 'wallet' && params.get('panel') === 'diamond-recharge' ? 'wallet-recharge'
          : hashPage === 'wallet' && params.get('panel') === 'coupons' ? 'coupons'
          : hashPage === 'club-detail' && params.get('panel') === 'club-announcements' ? 'club-announcements'
          : hashPage === 'club-detail' && params.get('panel') === 'club-cards' ? 'club-cards'
            : hashPage === 'wallet' && params.get('panel') === 'my-cards' ? 'my-cards'
              : (hashPage === 'club-detail' || hashPage === 'talents') && params.has('companion') ? 'companion-detail'
              : hashPage
      const matchingPage = pages.find((page) => page.dirName === currentPage.dirName && page.entryView === entryView)
      if (matchingPage && matchingPage.path !== window.location.pathname) {
        navigate(`${matchingPage.path}${window.location.hash}`, { replace: true })
      }
    }
    window.addEventListener('hashchange', syncToolPath)
    syncToolPath()
    return () => window.removeEventListener('hashchange', syncToolPath)
  }, [currentPage, navigate])
  useEffect(() => {
    if (!currentPage?.entryView) return
    if (initialPathSyncRef.current) {
      initialPathSyncRef.current = false
      return
    }
    const params = new URLSearchParams(window.location.hash.slice(1))
    if (params.get('page') === 'profile') {
      const profileSection = params.get('section')
      const requestedView = profileSection === 'wealth' ? 'profile-wealth'
        : profileSection === 'visits' ? 'profile-visits'
          : profileSection === 'favorites' ? 'profile-social'
            : profileSection === 'onboarding' ? params.get('onboarding') === 'companion' ? 'profile-onboarding' : params.get('onboarding') === 'club' ? 'profile-club-onboarding' : 'profile-onboarding-center'
              : profileSection === 'clubs' ? 'profile-clubs'
                : profileSection === 'cancel-account' ? 'profile-cancel-account'
                  : 'profile'
      const requestedPage = pages.find((page) => page.dirName === currentPage.dirName && page.entryView === requestedView)
      if (requestedPage && requestedPage.path !== currentPage.path) return
    }
    const expectedPage = workbenchEntryViews.includes(currentPage.entryView as typeof workbenchEntryViews[number]) ? 'workbench'
      : orderTabEntryViews.includes(currentPage.entryView as typeof orderTabEntryViews[number]) ? 'orders'
      : currentPage.entryView === 'club-voice-room' ? 'voice-room'
      : currentPage.entryView === 'quick-match' || currentPage.entryView === 'quick-match-in-progress' ? params.get('tool') === currentPage.entryView ? params.get('page') ?? 'home' : 'home'
      : currentPage.entryView === 'companion-detail' ? params.get('page') === 'talents' ? 'talents' : 'club-detail'
        : currentPage.entryView === 'identity-verification' && params.get('page') === 'profile' && params.get('tool') === 'identity-verification' ? 'profile'
          : currentPage.entryView === 'identity-verification' ? 'identity-verification'
      : currentPage.entryView === 'wallet-recharge' ? params.get('page') === 'wallet' && params.get('panel') === 'diamond-recharge' ? 'wallet' : 'recharge'
        : currentPage.entryView === 'coupons' ? 'wallet'
        : currentPage.entryView === 'club-announcements' || currentPage.entryView === 'club-cards' ? 'club-detail'
          : currentPage.entryView === 'my-cards' ? 'wallet'
          : currentPage.entryView === 'profile-onboarding' || currentPage.entryView === 'profile-onboarding-center' || currentPage.entryView === 'profile-club-onboarding' || currentPage.entryView === 'profile-clubs' || currentPage.entryView === 'profile-cancel-account' || currentPage.entryView === 'profile-wealth' || currentPage.entryView === 'profile-visits' || currentPage.entryView === 'profile-social' ? 'profile'
      : currentPage.entryView === 'platform-support' || currentPage.entryView === 'club-support' || currentPage.entryView === 'help-center' || currentPage.entryView === 'screen-recording' || currentPage.entryView === 'client-notifications' || currentPage.entryView === 'close-app' || currentPage.entryView === 'quick-panel' || currentPage.entryView === 'global-search' || currentPage.entryView === 'voice-room-minimized' || messagePerspectiveEntryViews.includes(currentPage.entryView as typeof messagePerspectiveEntryViews[number]) ? params.get('page') ?? (currentPage.entryView === 'club-support' || messagePerspectiveEntryViews.includes(currentPage.entryView as typeof messagePerspectiveEntryViews[number]) ? 'messages' : 'home')
          : currentPage.entryView
    const preservesUnderlyingRoute = currentPage.entryView === 'platform-support' || currentPage.entryView === 'club-support' || currentPage.entryView === 'help-center' || currentPage.entryView === 'screen-recording' || currentPage.entryView === 'client-notifications' || currentPage.entryView === 'close-app' || currentPage.entryView === 'quick-panel' || currentPage.entryView === 'global-search' || currentPage.entryView === 'voice-room-minimized' || messagePerspectiveEntryViews.includes(currentPage.entryView as typeof messagePerspectiveEntryViews[number]) || currentPage.entryView === 'quick-match' || currentPage.entryView === 'quick-match-in-progress' || currentPage.entryView === 'companion-detail' || currentPage.entryView === 'identity-verification' && expectedPage === 'profile'
    const expectedVoiceFrom = preservesUnderlyingRoute ? params.get('voiceFrom') : currentPage.entryView === 'club-voice-room' ? 'club' : null
    const expectedSection = preservesUnderlyingRoute ? params.get('section') : currentPage.entryView === 'profile-onboarding' || currentPage.entryView === 'profile-onboarding-center' || currentPage.entryView === 'profile-club-onboarding' ? 'onboarding'
      : currentPage.entryView === 'profile-clubs' ? 'clubs'
        : currentPage.entryView === 'profile-cancel-account' ? 'cancel-account'
          : currentPage.entryView === 'profile-wealth' ? 'wealth'
            : currentPage.entryView === 'profile-visits' ? 'visits'
              : currentPage.entryView === 'profile-social' ? 'favorites' : null
    const expectedSupport = currentPage.entryView === 'club-support' ? 'club'
      : currentPage.entryView === 'platform-support' ? 'platform' : null
    const expectedOnboarding = preservesUnderlyingRoute ? params.get('onboarding')
      : currentPage.entryView === 'profile-onboarding' ? 'companion'
        : currentPage.entryView === 'profile-club-onboarding' ? 'club' : null
    const expectedTool = currentPage.entryView === 'help-center' || currentPage.entryView === 'screen-recording' || currentPage.entryView === 'client-notifications' || currentPage.entryView === 'close-app' || currentPage.entryView === 'quick-panel' || currentPage.entryView === 'global-search' || currentPage.entryView === 'voice-room-minimized' || messagePerspectiveEntryViews.includes(currentPage.entryView as typeof messagePerspectiveEntryViews[number]) || currentPage.entryView === 'quick-match' || currentPage.entryView === 'quick-match-in-progress' || currentPage.entryView === 'identity-verification' && expectedPage === 'profile'
      ? currentPage.entryView : null
    const expectedOrderTab = currentPage.entryView === 'orders-receiving' ? 'receiving'
      : currentPage.entryView === 'orders-exam-candidate' ? 'exam-candidate'
        : currentPage.entryView === 'orders-exam-proctor' ? 'exam-proctor' : null
    const expectedWorkbenchTab = currentPage.entryView === 'workbench-matches' ? 'matches'
      : currentPage.entryView === 'workbench-orders' ? 'orders'
        : currentPage.entryView === 'workbench-services' || currentPage.entryView === 'workbench-apply-service' ? 'services' : null
    const expectedApplyService = currentPage.entryView === 'workbench-apply-service'
    const expectedSecurity = currentPage.entryView === 'identity-verification' && expectedPage === 'profile'
      ? params.get('security') === 'flow' ? 'flow' : 'real-name'
      : null
    const expectedCompanion = currentPage.entryView === 'companion-detail' ? params.get('companion') ?? 'companion-001' : null
    const expectedPanel = currentPage.entryView === 'wallet-recharge' && expectedPage === 'wallet' ? 'diamond-recharge'
      : currentPage.entryView === 'coupons' ? 'coupons'
        : currentPage.entryView === 'club-announcements' ? 'club-announcements'
          : currentPage.entryView === 'club-cards' ? 'club-cards'
            : currentPage.entryView === 'my-cards' ? 'my-cards' : null
    if (params.get('page') === expectedPage
      && (expectedVoiceFrom == null || params.get('voiceFrom') === expectedVoiceFrom)
      && (expectedSection == null ? !params.has('section') : params.get('section') === expectedSection)
      && (expectedSupport == null ? !params.has('support') : params.get('support') === expectedSupport)
      && (expectedOnboarding == null ? !params.has('onboarding') : params.get('onboarding') === expectedOnboarding)
      && (expectedPanel == null ? !params.has('panel') : params.get('panel') === expectedPanel)
      && (expectedSecurity == null ? !params.has('security') : params.get('security') === expectedSecurity)
      && (expectedCompanion == null ? !params.has('companion') : params.get('companion') === expectedCompanion)
      && (expectedOrderTab == null ? !params.has('orderTab') : params.get('orderTab') === expectedOrderTab)
      && (expectedWorkbenchTab == null ? !params.has('workbenchTab') : params.get('workbenchTab') === expectedWorkbenchTab)
      && (expectedApplyService ? params.get('applyService') === '1' : !params.has('applyService'))
      && (expectedTool == null ? !params.has('tool') : params.get('tool') === expectedTool)) return
    params.set('page', expectedPage)
    if (expectedVoiceFrom) params.set('voiceFrom', expectedVoiceFrom)
    else params.delete('voiceFrom')
    if (expectedSection) params.set('section', expectedSection)
    else params.delete('section')
    if (expectedSupport) params.set('support', expectedSupport)
    else params.delete('support')
    if (expectedOnboarding) params.set('onboarding', expectedOnboarding)
    else params.delete('onboarding')
    if (expectedPanel) params.set('panel', expectedPanel)
    else if (currentPage.entryView === 'wallet-recharge' || currentPage.entryView === 'coupons') params.delete('panel')
    if (expectedSecurity) params.set('security', expectedSecurity)
    else params.delete('security')
    if (expectedCompanion) params.set('companion', expectedCompanion)
    if (expectedOrderTab) params.set('orderTab', expectedOrderTab)
    else params.delete('orderTab')
    if (expectedWorkbenchTab) params.set('workbenchTab', expectedWorkbenchTab)
    else params.delete('workbenchTab')
    if (expectedApplyService) params.set('applyService', '1')
    else params.delete('applyService')
    if (expectedTool) params.set('tool', expectedTool)
    else params.delete('tool')
    window.location.hash = params.toString()
  }, [currentPage])
  const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(null)
  const previewRef = useCallback((node: HTMLDivElement | null) => {
    setPreviewContainer(node)
  }, [])

  const prototypePalette: 'grayscale' | 'color' = 'grayscale'
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
    markerColor: shortcuts.markerColor,
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

        <UpdateNotice theme={theme} pageId={currentPage?.dirName} />

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
    <EditAuthorizationProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </EditAuthorizationProvider>
  )
}

export default App
