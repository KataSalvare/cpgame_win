import type { ReactNode } from 'react'
import { DialogPanel } from '@/components/WindowsClient'
import './notice-dialog.css'

type NoticeDialogProps = {
  overlayId: string
  title: string
  children: ReactNode
  onClose: () => void
  onConfirm: () => void
  confirmLabel?: string
  reminder?: { checked: boolean; onChange: (checked: boolean) => void }
  revealOverlay?: string
}

export function NoticeDialog({ overlayId, title, onClose, onConfirm, confirmLabel = '知道了', reminder, revealOverlay }: NoticeDialogProps) {
  return <div data-reveal-overlay={revealOverlay}>
    <DialogPanel overlayId={overlayId} title={title} onClose={onClose} width={375} className="theme-notice-dialog" footer={<>
      <button type="button" className="client-button client-button--primary" onClick={onConfirm}>{confirmLabel}</button>
      {reminder && <label className="theme-notice-dialog__reminder"><input type="checkbox" checked={reminder.checked} onChange={event => reminder.onChange(event.target.checked)} />不再提醒</label>}
    </>}>
      <div className="theme-notice-dialog__webview">webview加载H5页面</div>
    </DialogPanel>
  </div>
}
