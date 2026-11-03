import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function OrderNumberCopy({ orderId }: { orderId: string }) {
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)

  const copyOrderId = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(orderId)
      setFeedback('success')
    } catch {
      setFeedback('error')
    }
  }

  return <span className="order-detail-status-card__copy-group">
    <button type="button" className="order-detail-status-card__copy" onClick={() => void copyOrderId()} aria-label={`复制订单号 ${orderId}`} title="点击复制订单号">
      <span>{orderId}</span><Copy size={12} aria-hidden="true" />
    </button>
    {feedback && <span className="order-detail-status-card__copy-feedback" role="status" aria-live="polite">
      {feedback === 'success' ? <><Check size={12} aria-hidden="true" />复制成功</> : '复制失败，请重试'}
    </span>}
  </span>
}
