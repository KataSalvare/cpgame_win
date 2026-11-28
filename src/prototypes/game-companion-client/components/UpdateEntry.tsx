import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { MenuIcon } from './MenuIcon'

const dismissedKey = 'game-companion-update-popover-dismissed'
const downloadKey = 'game-companion-update-download-start'
const readyKey = 'game-companion-update-ready-shown'
const duration = 5000

function readStorage(key: string) {
  try { return sessionStorage.getItem(key) } catch { return null }
}

export function UpdateEntry({ onOpen }: { onOpen: () => void }) {
  const [started, setStarted] = useState(() => Number(readStorage(downloadKey)) || 0)
  const [progress, setProgress] = useState(() => started ? Math.min(100, Math.floor((Date.now() - started) / duration * 100)) : 0)
  const [open, setOpen] = useState(() => started ? Date.now() - started >= duration && readStorage(readyKey) !== 'true' : readStorage(dismissedKey) !== 'true')
  const ready = started > 0 && progress >= 100

  useEffect(() => {
    if (!started) return
    const tick = () => {
      const next = Math.min(100, Math.max(0, Math.floor((Date.now() - started) / duration * 100)))
      setProgress(next)
      if (next === 100 && readStorage(readyKey) !== 'true') {
        setOpen(true)
        try { sessionStorage.setItem(readyKey, 'true') } catch { /* Storage may be unavailable. */ }
      }
    }
    const timer = window.setInterval(tick, 100)
    return () => window.clearInterval(timer)
  }, [started])

  const close = () => {
    setOpen(false)
    try { sessionStorage.setItem(dismissedKey, 'true') } catch { /* Storage may be unavailable. */ }
  }

  const resetUpdate = () => {
    try {
      sessionStorage.removeItem(downloadKey)
      sessionStorage.removeItem(readyKey)
    } catch { /* Storage may be unavailable. */ }
    setStarted(0)
    setProgress(0)
    setOpen(true)
  }

  return <div className="client-update-entry" onKeyDown={(event) => { if (event.key === 'Escape' && open) { close(); event.stopPropagation() } }}>
    {started && !ready ? <div className="client-update-entry__progress" role="progressbar" aria-label="下载更新" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <span className="client-update-entry__progress-label">下载更新中</span><div className="client-update-entry__track"><span style={{ width: `${progress}%` }} /></div><span>{progress}%</span>
    </div> : <button type="button" className="client-update-entry__trigger" aria-label="版本更新" aria-expanded={open} aria-controls="client-update-popover" onClick={() => { if (open) close(); else setOpen(true) }}>
      <MenuIcon name="update" size={19} /><span>新版</span>
    </button>}
    {open && <div id="client-update-popover" className="client-update-entry__popover" role={ready ? 'status' : undefined}>
      <button type="button" className="client-update-entry__content" onClick={() => { if (ready) resetUpdate(); else { close(); onOpen() } }}>
        <span className="client-update-entry__icon"><Download size={20} aria-hidden="true" /></span>
        <span><strong>{ready ? '新版本已就绪' : '发现新版本 v1.1.0'}</strong><small>{ready ? '点击开始更新' : '点击查看更新'}</small></span>
      </button>
      <button type="button" className="client-update-entry__close" aria-label="关闭更新提示" onClick={close}><X size={16} aria-hidden="true" /></button>
    </div>}
  </div>
}
