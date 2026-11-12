import type { ReactNode, Ref } from 'react'
import { DialogPanel } from '@/components/WindowsClient'
import './confirmation-dialog.css'

export interface ConfirmationDialogProps {
  overlayId: string
  title: string
  message: ReactNode
  cancelLabel?: string
  confirmLabel: string
  alternativeAction?: { label: string; onClick: () => void }
  confirmDisabled?: boolean
  confirmButtonRef?: Ref<HTMLButtonElement>
  children?: ReactNode
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmationDialog({ overlayId, title, message, cancelLabel = '取消', confirmLabel, alternativeAction, confirmDisabled = false, confirmButtonRef, children, onCancel, onConfirm }: ConfirmationDialogProps) {
  return <DialogPanel
    overlayId={overlayId}
    title={title}
    width={360}
    className="grayscale-confirmation-dialog"
    onClose={onCancel}
    footer={<><button type="button" className="client-button client-button--secondary" onClick={onCancel}>{cancelLabel}</button>{alternativeAction && <button type="button" className="client-button client-button--secondary" onClick={alternativeAction.onClick}>{alternativeAction.label}</button>}<button ref={confirmButtonRef} type="button" className="client-button client-button--primary" onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</button></>}
  >
    <p className="grayscale-confirmation-dialog__message">{message}</p>
    {children && <div className="grayscale-confirmation-dialog__extra">{children}</div>}
  </DialogPanel>
}
