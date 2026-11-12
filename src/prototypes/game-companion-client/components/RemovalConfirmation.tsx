import { useState } from 'react'
import { ConfirmationDialog } from '@/themes/grayscale-prototype/components/ConfirmationDialog'

type PendingRemoval = { action: '取消关注' | '取消收藏'; name: string; confirm: () => void; description?: string }

export function useRemovalConfirmation() {
  const [pending, setPending] = useState<PendingRemoval | null>(null)
  const requestRemoval = (action: PendingRemoval['action'], name: string, confirm: () => void, description?: string) => setPending({ action, name, confirm, description })
  const dialog = pending && <ConfirmationDialog overlayId="social-removal-confirmation" title={pending.action} message={pending.description ?? `确认${pending.action}「${pending.name}」吗？`} confirmLabel={`确认${pending.action}`} onCancel={() => setPending(null)} onConfirm={() => { pending.confirm(); setPending(null) }} />
  return { requestRemoval, dialog }
}
