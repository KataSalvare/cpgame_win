import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyableProfileId({ value, entityLabel }: { value: string; entityLabel: string }) {
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(''), 1800)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const copyId = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(value)
      setFeedback('复制成功')
    } catch {
      setFeedback('复制失败，请重试')
    }
  }

  return <span className="personal-user-id">
    <button type="button" className="client-profile-popover__user-id" onClick={() => void copyId()} aria-label={`复制${entityLabel} ID ${value}`} title="点击复制 ID">
      ID：{value}<Copy size={12} aria-hidden="true" />
    </button>
    {feedback && <span className="client-profile-popover__copy-feedback" role="status">{feedback === '复制成功' && <Check size={12} aria-hidden="true" />}{feedback}</span>}
  </span>
}
