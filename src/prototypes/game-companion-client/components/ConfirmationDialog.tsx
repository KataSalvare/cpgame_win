import { useEffect, useRef, type ReactNode } from 'react'
import { DialogPanel } from '@/components/WindowsClient'
import type { ConfirmationDialogProps } from '@/themes/grayscale-prototype/components/ConfirmationDialog'
import '@/themes/yellow-black-companion/components/components.css'
import '@/themes/grayscale-prototype/components/confirmation-dialog.css'

type Props = Omit<ConfirmationDialogProps, 'message' | 'onCancel'> & {
  message?: ReactNode
  onCancel?: () => void
  onDismiss?: () => void
}

export function ConfirmationDialog({
  overlayId, title, message, cancelLabel = '取消', confirmLabel, alternativeAction,
  confirmDisabled, confirmButtonRef, children, onCancel, onDismiss = onCancel, onConfirm,
}: Props) {
  const root = useRef<HTMLDivElement>(null)
  const dismiss = useRef(onDismiss ?? onConfirm)
  useEffect(() => { dismiss.current = onDismiss ?? onConfirm }, [onDismiss, onConfirm])

  useEffect(() => {
    const wrapper = root.current
    const previous = document.activeElement
    const controls = () => Array.from(wrapper?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]',
    ) ?? [])
    if (!wrapper?.contains(previous)) controls()[0]?.focus()

    const handleKey = (event: KeyboardEvent) => {
      if (!wrapper?.contains(document.activeElement)) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        dismiss.current()
      }
      if (event.key !== 'Tab') return
      const items = controls()
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey ? document.activeElement === first : document.activeElement === last) {
        event.preventDefault()
        const next = event.shiftKey ? last : first
        next?.focus()
      }
    }
    wrapper?.addEventListener('keydown', handleKey)
    return () => {
      wrapper?.removeEventListener('keydown', handleKey)
      if (previous instanceof HTMLElement && document.activeElement === document.body) previous.focus()
    }
  }, [])

  return <div ref={root} className="client-confirmation" onClick={event => {
    if (event.target === event.currentTarget.firstElementChild) dismiss.current()
  }}>
    <DialogPanel overlayId={overlayId} title={title} width="var(--client-confirmation-width, 360px)"
      className="grayscale-confirmation-dialog client-confirmation__panel"
      onClose={onDismiss ?? onConfirm}
      footer={<>
        {onCancel && <button type="button" className="client-button client-button--secondary" onClick={onCancel}>{cancelLabel}</button>}
        {alternativeAction && <button type="button" className="client-button client-button--secondary" onClick={alternativeAction.onClick}>{alternativeAction.label}</button>}
        <button ref={confirmButtonRef} type="button" className="client-button client-button--primary" onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</button>
      </>}>
      {message != null && <p className="grayscale-confirmation-dialog__message">{message}</p>}
      {children && <div className="grayscale-confirmation-dialog__extra">{children}</div>}
    </DialogPanel>
  </div>
}
