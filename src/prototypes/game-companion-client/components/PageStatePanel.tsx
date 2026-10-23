import { AlertTriangle, FolderOpen } from 'lucide-react'

type Props = {
  state: 'loading' | 'empty' | 'error'
  title: string
  description: string
  onAction?: () => void
  actionLabel?: string
}

export function PageStatePanel({ state, title, description, onAction, actionLabel }: Props) {
  if (state === 'loading') {
    return <section className="client-state-panel" aria-label="加载中" role="status">
      <div className="client-skeleton client-skeleton--title" />
      <div className="client-skeleton client-skeleton--line" />
      <div className="client-skeleton-grid"><div /><div /><div /></div>
      <span className="client-muted">正在加载内容…</span>
    </section>
  }

  const isError = state === 'error'
  const Icon = isError ? AlertTriangle : FolderOpen
  return <section className="client-state-panel" aria-live="polite">
    <span className="client-state-panel__icon"><Icon size={24} strokeWidth={1.7} /></span>
    <h2>{title}</h2>
    <p>{description}</p>
    {onAction && actionLabel && <button type="button" className="client-button client-button--primary" onClick={onAction}>{actionLabel}</button>}
  </section>
}
