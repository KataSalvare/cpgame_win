import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const CHECK_INTERVAL_MS = 60_000

type BuildInfo = typeof __BUILD_INFO__

export function UpdateNotice({ theme, pageId }: { theme: 'dark' | 'light'; pageId?: string }) {
  const [availableUpdate, setAvailableUpdate] = useState<{ pageId?: string; info: BuildInfo } | null>(null)
  const availableVersion = availableUpdate && availableUpdate.pageId === pageId
    ? availableUpdate.info
    : null

  useEffect(() => {
    if (!import.meta.env.PROD) return

    let active = true
    const checkForUpdate = async () => {
      try {
        const response = await fetch(`/version.json?check=${Date.now()}`, { cache: 'no-store' })
        if (!response.ok) return
        const latest = await response.json() as BuildInfo
        const currentPageRevision = pageId ? __BUILD_INFO__.pages[pageId] : undefined
        const latestPageRevision = pageId ? latest.pages[pageId] : undefined
        const pageHasUpdate = pageId
          ? latestPageRevision !== undefined && latestPageRevision !== currentPageRevision
          : latest.coreRevision !== __BUILD_INFO__.coreRevision

        if (active) {
          setAvailableUpdate(pageHasUpdate ? { pageId, info: latest } : null)
        }
      } catch {
        // A temporary network error should not interrupt prototype work.
      }
    }

    void checkForUpdate()
    const timer = window.setInterval(() => void checkForUpdate(), CHECK_INTERVAL_MS)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [pageId])

  if (!availableVersion) return null

  return (
    <div className={`flex shrink-0 items-center justify-center gap-3 border-b px-4 py-2 text-sm ${
      theme === 'dark'
        ? 'border-red-900 bg-red-800 text-white'
        : 'border-red-700 bg-red-600 text-white'
    }`} role="status" aria-live="polite">
      <span>当前页面有更新：{availableVersion.version}（{availableVersion.revision}），刷新后查看最新原型。</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          theme === 'dark'
            ? 'bg-red-100 text-red-950 hover:bg-white focus-visible:outline-red-100'
            : 'bg-white text-red-800 hover:bg-red-50 focus-visible:outline-white'
        }`}
      >
        <RefreshCw size={14} aria-hidden="true" />
        立即刷新
      </button>
    </div>
  )
}
