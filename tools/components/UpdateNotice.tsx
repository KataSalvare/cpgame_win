import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const CHECK_INTERVAL_MS = 60_000

type BuildInfo = typeof __BUILD_INFO__

export function UpdateNotice({ theme }: { theme: 'dark' | 'light' }) {
  const [availableVersion, setAvailableVersion] = useState<BuildInfo | null>(null)

  useEffect(() => {
    if (!import.meta.env.PROD) return

    let active = true
    const checkForUpdate = async () => {
      try {
        const response = await fetch(`/version.json?check=${Date.now()}`, { cache: 'no-store' })
        if (!response.ok) return
        const latest = await response.json() as BuildInfo
        if (active && latest.revision && latest.revision !== __BUILD_INFO__.revision) {
          setAvailableVersion(latest)
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
  }, [])

  if (!availableVersion) return null

  return (
    <div className={`flex shrink-0 items-center justify-center gap-3 border-b px-4 py-2 text-sm ${
      theme === 'dark'
        ? 'border-sky-400/20 bg-sky-950/70 text-sky-100'
        : 'border-sky-200 bg-sky-50 text-sky-950'
    }`} role="status" aria-live="polite">
      <span>新版本 {availableVersion.version}（{availableVersion.revision}）已发布，刷新后使用最新原型。</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          theme === 'dark'
            ? 'bg-sky-200 text-sky-950 hover:bg-white focus-visible:outline-sky-200'
            : 'bg-sky-800 text-white hover:bg-sky-900 focus-visible:outline-sky-800'
        }`}
      >
        <RefreshCw size={14} aria-hidden="true" />
        立即刷新
      </button>
    </div>
  )
}
