import { useState } from 'react'
import { ArrowUpCircle, Download, X } from 'lucide-react'

export function UpdateEntry({ onOpen }: { onOpen: () => void }) {
  const [open, setOpen] = useState(true)

  return <div className="client-update-entry" onMouseEnter={() => setOpen(true)} onMouseLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) setOpen(false) }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }} onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); event.stopPropagation() } }}>
    <button type="button" className="client-update-entry__trigger" aria-label="版本更新" aria-expanded={open} aria-controls="client-update-popover" onFocus={() => setOpen(true)} onClick={() => setOpen(true)}>
      <ArrowUpCircle size={18} aria-hidden="true" /><span>新版</span>
    </button>
    {open && <div id="client-update-popover" className="client-update-entry__popover">
      <button type="button" className="client-update-entry__content" onClick={() => { setOpen(false); onOpen() }}>
        <span className="client-update-entry__icon"><Download size={20} aria-hidden="true" /></span>
        <span><strong>发现新版本 v1.1.0</strong><small>点击查看更新</small></span>
      </button>
      <button type="button" className="client-update-entry__close" aria-label="关闭更新提示" onClick={() => setOpen(false)}><X size={16} aria-hidden="true" /></button>
    </div>}
  </div>
}
