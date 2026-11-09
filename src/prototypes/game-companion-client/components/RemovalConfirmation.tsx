import { useState } from 'react'
import { DialogPanel } from '@/components/WindowsClient'

type PendingRemoval = { action: '取消关注' | '取消收藏'; name: string; confirm: () => void; description?: string }

export function useRemovalConfirmation() {
  const [pending, setPending] = useState<PendingRemoval | null>(null)
  const requestRemoval = (action: PendingRemoval['action'], name: string, confirm: () => void, description?: string) => setPending({ action, name, confirm, description })
  const dialog = pending && <DialogPanel overlayId="social-removal-confirmation" title={pending.action} description={pending.description ?? `确定${pending.action}「${pending.name}」吗？`} onClose={() => setPending(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setPending(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { pending.confirm(); setPending(null) }}>确认{pending.action}</button></>} children={null} />
  return { requestRemoval, dialog }
}
