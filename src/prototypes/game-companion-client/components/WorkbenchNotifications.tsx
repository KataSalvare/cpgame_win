import { useState, type ReactNode } from 'react'
import { Headphones, PhoneCall, X } from 'lucide-react'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import type { VoiceCallNotification, VoiceInvitation } from '../data/socialMockData'
import { AvatarMark } from './AvatarMark'

function NotificationCard({ label, children }: { label: string; children: ReactNode }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return <aside className="workbench-global-notice" aria-label={label} aria-live="polite">
    <button type="button" className="workbench-notice-close" aria-label={`关闭${label}`} onClick={() => setVisible(false)}><X size={16} /></button>
    {children}
  </aside>
}

export function WorkbenchNotifications({ logic: w, open, voiceCallNotifications, voiceInvitations, onOpenVoiceCall, onIgnoreVoiceCall, onIgnoreVoiceInvitation, onAcceptVoiceInvitation }: { logic: WorkbenchLogic; open: boolean; voiceCallNotifications: VoiceCallNotification[]; voiceInvitations: VoiceInvitation[]; onOpenVoiceCall: () => void; onIgnoreVoiceCall: () => void; onIgnoreVoiceInvitation: (id: string) => void; onAcceptVoiceInvitation: (invitation: VoiceInvitation) => void }) {
  const [handled, setHandled] = useState<string[]>([])
  const matches = w.requests.filter(r => r.status === '待响应').map(r => ({ ...r, kind: 'match' as const }))
  const orders = w.orders.filter(o => o.status === '待接单').map(o => ({ ...o, kind: 'order' as const }))
  const matchTypes = [...new Set(matches.map(message => message.audition))]
  const messages = [
    ...matchTypes.map(type => matches.find(message => message.audition === type)!).filter(message => !handled.includes(`match-${message.audition}`)),
    ...orders.slice(0, 1).filter(() => !handled.includes('order')),
  ]
  const respond = (message: typeof messages[number], accept: boolean) => {
    if (message.kind === 'match' && !w.respond(message.id, accept)) return
    if (message.kind === 'order' && accept) { w.setOrderAction({ id: message.id, action: '接收' }); return }
    const key = message.kind === 'match' ? `match-${message.audition}` : 'order'
    setHandled(keys => keys.includes(key) ? keys : [...keys, key])
  }
  if (!open) return null
  return <div id="workbench-notifications" className="workbench-notification-stack" aria-label="客户端通知列表">
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
        <div className="workbench-notice-actions"><button type="button" className="client-button client-button--secondary" onClick={() => respond(message, false)}>忽略</button><button type="button" className="client-button client-button--primary" title={message.kind === 'match' && w.activeMatch ? '请先取消当前匹配' : undefined} disabled={message.kind === 'match' && (Boolean(w.activeMatch) || !w.enabled.includes(message.serviceId))} onClick={() => respond(message, true)}>{message.kind === 'match' ? '抢单' : '接受'}</button></div>
        </footer>
      </NotificationCard>
    })}
    {voiceCallNotifications.length > 0 && <NotificationCard label="呼叫通知">
      <header className="workbench-notice-heading"><PhoneCall size={17} /><strong>呼叫通知</strong><span className="workbench-notice-type">{voiceCallNotifications.length} 条</span></header>
      <p className="workbench-global-notice__message">{voiceCallNotifications.length === 1 ? `${voiceCallNotifications[0].callerName} 正在呼叫客服` : `${voiceCallNotifications[0].callerName} 等${voiceCallNotifications.length}位用户正在呼叫客服`}</p>
      <footer className="workbench-notice-actions"><button type="button" className="client-button client-button--secondary" onClick={onIgnoreVoiceCall}>忽略</button><button type="button" className="client-button client-button--primary" onClick={onOpenVoiceCall}>查看</button></footer>
    </NotificationCard>}
    {voiceInvitations.slice(0, 1).map((invitation) => <NotificationCard key={invitation.id} label={`邀请进房：${invitation.inviter}`}>
      <header className="workbench-notice-heading">
        <AvatarMark initials={invitation.inviterInitials ?? invitation.inviter.slice(0, 1)} size="sm" />
        <strong>{invitation.inviter}</strong>
        <span className="workbench-notice-type">邀请进房</span>
      </header>
      <p className="workbench-notice-service">{invitation.roomName}{invitation.channelName && ` · ${invitation.channelName}`} · {invitation.time}</p>
      <footer className="workbench-notice-actions"><button type="button" className="client-button client-button--secondary" onClick={() => onIgnoreVoiceInvitation(invitation.id)}>忽略</button><button type="button" className="client-button client-button--primary" onClick={() => onAcceptVoiceInvitation(invitation)}><Headphones size={14} />加入</button></footer>
    </NotificationCard>)}
  </div>
}
