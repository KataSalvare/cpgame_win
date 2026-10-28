import { useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import { AvatarMark } from './AvatarMark'

function NotificationCard({ label, children }: { label: string; children: ReactNode }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return <aside className="workbench-global-notice" aria-label={label} aria-live="polite">
    <button type="button" className="workbench-notice-close" aria-label={`关闭${label}`} onClick={() => setVisible(false)}><X size={16} /></button>
    {children}
  </aside>
}

export function WorkbenchNotifications({ logic: w, open }: { logic: WorkbenchLogic; open: boolean }) {
  const [handled, setHandled] = useState<string[]>([])
  const matches = w.requests.filter(r => r.status === '待响应').map(r => ({ ...r, kind: 'match' as const }))
  const orders = w.orders.filter(o => o.status === '待接单').map(o => ({ ...o, kind: 'order' as const }))
  const messages = Array.from({ length: Math.max(matches.length, orders.length) }, (_, i) => [matches[i], orders[i]])
    .flat().filter(m => m && !handled.includes(m.id))
  const respond = (message: typeof messages[number], accept: boolean) => {
    if (message.kind === 'match' && !w.respond(message.id, accept)) return
    if (message.kind === 'order' && accept) w.updateOrder(message.id, '待服务')
    setHandled(ids => [...ids, message.id])
  }
  if (!open) return null
  return <div id="workbench-notifications" className="workbench-notification-stack" aria-label="陪玩消息提醒">
    {messages.map(message => {
      const service = w.services.find(s => s.id === message.serviceId)
      return <NotificationCard key={message.id} label={`${message.kind === 'match' ? '匹配请求' : '订单通知'}：${message.player}`}>
        <header className="workbench-notice-heading">
          <AvatarMark initials={message.playerInitials} size="sm" />
          <strong>{message.player}</strong>
          <span className="workbench-notice-type">{message.kind === 'match' ? `匹配 · ${message.audition}` : '订单通知'}</span>
        </header>
        <p className="workbench-notice-service">{w.serviceLabel(message.serviceId)}{message.kind === 'order' && ` · ${service?.name ?? '组队开黑'}`}</p>
        <footer className="workbench-notice-footer">
          <dl className="workbench-notice-prices">{message.kind === 'match' ? <><div><dt className="sr-only">匹配单价</dt><dd>{message.matchPrice} 钻石 / {service?.unit ?? '小时'}</dd></div><div className="workbench-notice-tip"><dt>加价</dt><dd>{message.tipAmount} 钻石</dd></div></> : <div><dt className="sr-only">金额</dt><dd>{message.amount} 钻石</dd></div>}</dl>
        <div className="workbench-notice-actions"><button type="button" className="client-button client-button--secondary" onClick={() => respond(message, false)}>忽略</button><button type="button" className="client-button client-button--primary" title={message.kind === 'match' && w.activeMatch ? '请先取消当前匹配' : undefined} disabled={message.kind === 'match' && (Boolean(w.activeMatch) || !w.enabled.includes(message.serviceId))} onClick={() => respond(message, true)}>接受</button></div>
        </footer>
      </NotificationCard>
    })}
  </div>
}
