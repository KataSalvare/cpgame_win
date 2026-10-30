import { useState, type ReactNode } from 'react'
import { Headphones, PhoneCall, X } from 'lucide-react'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import type { VoiceCallNotification, VoiceInvitation } from '../data/socialMockData'
import { AvatarMark } from './AvatarMark'
import { socialFriends } from '../data/socialMockData'
import { companions } from '../data/mockData'
import { UserNameWithLevel } from './UserNameWithLevel'
import { clientNotificationMock } from '../data/clientNotificationMockData'

function NotificationCard({ label, children, showClose = true }: { label: string; children: ReactNode; showClose?: boolean }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return <aside className="workbench-global-notice" aria-label={label} aria-live="polite">
    {showClose && <button type="button" className="workbench-notice-close" aria-label={`关闭${label}`} onClick={() => setVisible(false)}><X size={16} /></button>}
    {children}
  </aside>
}

type WorkbenchMessage = (WorkbenchLogic['requests'][number] & { kind: 'match' }) | (WorkbenchLogic['orders'][number] & { kind: 'order' })

export function WorkbenchNotifications({ logic: w, mode, voiceCallNotifications, voiceInvitations, onMarkAllRead, onClose, onOpenVoiceCall, onIgnoreVoiceCall, onIgnoreVoiceInvitation, onAcceptVoiceInvitation }: { logic: WorkbenchLogic; mode: 'closed' | 'panel' | 'all'; voiceCallNotifications: VoiceCallNotification[]; voiceInvitations: VoiceInvitation[]; onMarkAllRead: () => void; onClose: () => void; onOpenVoiceCall: () => void; onIgnoreVoiceCall: () => void; onIgnoreVoiceInvitation: (id: string) => void; onAcceptVoiceInvitation: (invitation: VoiceInvitation) => void }) {
  const [handled, setHandled] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'important' | 'system'>('important')
  const [systemNotificationVisible, setSystemNotificationVisible] = useState(true)
  const matches = w.requests.filter(r => r.status === '待响应').map(r => ({ ...r, kind: 'match' as const }))
  const orders = w.orders.filter(o => o.status === '待接单').map(o => ({ ...o, kind: 'order' as const }))
  const matchTypes = [...new Set(matches.map(message => message.audition))]
  const messages: WorkbenchMessage[] = [
    ...matchTypes.map(type => matches.find(message => message.audition === type && !handled.includes(`match-${message.id}`))).filter((message): message is typeof matches[number] => Boolean(message)),
    ...orders.slice(0, 1).filter(() => !handled.includes('order')),
  ]
  const respond = (message: WorkbenchMessage, accept: boolean) => {
    if (message.kind === 'match' && !w.respond(message.id, accept)) return
    if (message.kind === 'order' && accept) { w.setOrderAction({ id: message.id, action: '接收' }); return }
    const key = message.kind === 'match' ? `match-${message.id}` : 'order'
    setHandled(keys => keys.includes(key) ? keys : [...keys, key])
  }

  const clearAllNotifications = () => {
    setHandled(keys => [...new Set([...keys, ...matches.map(message => `match-${message.id}`), 'order'])])
    onIgnoreVoiceCall()
    voiceInvitations.forEach(invitation => onIgnoreVoiceInvitation(invitation.id))
    setSystemNotificationVisible(false)
    onMarkAllRead()
  }

  const renderWorkbenchCard = (message: WorkbenchMessage, compact = false) => {
    const service = w.services.find(s => s.id === message.serviceId)
    return <NotificationCard key={`${message.kind}-${message.id}`} label={`${message.kind === 'match' ? '匹配请求' : '订单通知'}：${message.player}`}>
      <header className="workbench-notice-heading">
        {!compact && <AvatarMark initials={message.playerInitials} size="sm" />}
        <strong><UserNameWithLevel name={message.player} identityId={message.player} /></strong>
        <span className="workbench-notice-type">{message.kind === 'match' ? `匹配 · ${message.audition}` : '订单通知'}</span>
      </header>
      <p className="workbench-notice-service">{w.serviceLabel(message.serviceId)}{message.kind === 'order' && ` · ${service?.name ?? '组队开黑'}`}</p>
      <footer className={`workbench-notice-footer${compact ? ' workbench-notice-footer--compact' : ''}`}>
        <dl className={`workbench-notice-prices${compact ? ' workbench-notice-prices--compact' : ''}`}>{message.kind === 'match' ? <><div><dt className="sr-only">匹配单价</dt><dd>{message.matchPrice} 钻石 / {service?.unit ?? '小时'}</dd></div><div className="workbench-notice-tip"><dt>加价</dt><dd>{message.tipAmount} 钻石</dd></div></> : <div><dt className="sr-only">金额</dt><dd>{message.amount} 钻石</dd></div>}</dl>
        <div className="workbench-notice-actions">{!compact && <button type="button" className="client-button client-button--secondary" onClick={() => respond(message, false)}>忽略</button>}<button type="button" className="client-button client-button--primary" title={message.kind === 'match' && w.activeMatch ? '请先取消当前匹配' : undefined} disabled={message.kind === 'match' && (Boolean(w.activeMatch) || !w.enabled.includes(message.serviceId))} onClick={() => respond(message, true)}>{message.kind === 'match' ? '抢单' : '接受'}</button></div>
      </footer>
    </NotificationCard>
  }

  const renderCallCard = (notification: VoiceCallNotification, compact = false) => <NotificationCard key={notification.id} label={`呼叫通知：${notification.callerName}`}>
    <header className="workbench-notice-heading">{!compact && <AvatarMark initials={notification.callerInitials} size="sm" />}<strong><UserNameWithLevel name={notification.callerName} identityId={notification.callerName} /></strong><span className="workbench-notice-type">呼叫通知</span></header>
    <p className="workbench-global-notice__message">正在呼叫客服</p>
    <footer className={`workbench-notice-actions${compact ? ' workbench-notice-actions--compact' : ''}`}>{!compact && <button type="button" className="client-button client-button--secondary" onClick={onIgnoreVoiceCall}>忽略</button>}<button type="button" className="client-button client-button--primary" onClick={onOpenVoiceCall}>查看</button></footer>
  </NotificationCard>

  const renderInvitationCard = (invitation: VoiceInvitation, compact = false) => <NotificationCard key={invitation.id} label={`邀请进房：${invitation.inviter}`}>
    <header className="workbench-notice-heading">
      {!compact && <AvatarMark initials={invitation.inviterInitials ?? invitation.inviter.slice(0, 1)} size="sm" />}
      <strong><UserNameWithLevel name={invitation.inviter} identityId={socialFriends.find(friend => friend.name === invitation.inviter)?.profileId ?? companions.find(companion => companion.name === invitation.inviter)?.id ?? invitation.inviter} /></strong>
      <span className="workbench-notice-type">邀请进房</span>
    </header>
    <p className="workbench-notice-service">{invitation.roomName}{invitation.channelName && ` · ${invitation.channelName}`} · {invitation.time}</p>
    <footer className={`workbench-notice-actions${compact ? ' workbench-notice-actions--compact' : ''}`}>{!compact && <button type="button" className="client-button client-button--secondary" onClick={() => onIgnoreVoiceInvitation(invitation.id)}>忽略</button>}<button type="button" className="client-button client-button--primary" onClick={() => onAcceptVoiceInvitation(invitation)}><Headphones size={14} />加入</button></footer>
  </NotificationCard>
  const renderInvitationCardCompact = (invitation: VoiceInvitation) => renderInvitationCard(invitation, true)

  const systemCard = systemNotificationVisible ? <NotificationCard label={clientNotificationMock.title}>
      <header className="workbench-notice-heading"><strong>{clientNotificationMock.title}</strong><span className="workbench-notice-type">{clientNotificationMock.type}</span></header>
      <p className="workbench-global-notice__message">{clientNotificationMock.summary}</p>
      <footer className={`workbench-notice-actions${mode === 'panel' ? ' workbench-notice-actions--compact' : ''}`}><button type="button" className="client-button client-button--secondary">{clientNotificationMock.actionLabel}</button></footer>
    </NotificationCard> : null

  const allImportantCards = <>
    {matches.filter(message => !handled.includes(`match-${message.id}`)).map(message => renderWorkbenchCard(message, true))}
    {orders.filter(() => !handled.includes('order')).map(message => renderWorkbenchCard(message, true))}
    {voiceCallNotifications.map(notification => renderCallCard(notification, true))}
    {voiceInvitations.map(renderInvitationCardCompact)}
    {matches.filter(message => !handled.includes(`match-${message.id}`)).length === 0 && orders.filter(() => !handled.includes('order')).length === 0 && voiceCallNotifications.length === 0 && voiceInvitations.length === 0 && <p className="workbench-notification-center__empty">暂无重要通知</p>}
  </>

  if (mode === 'closed') return null
  if (mode === 'panel') return <div id="workbench-notifications" className="workbench-notification-stack workbench-notification-center" aria-label="客户端通知面板">
    <header className="workbench-notification-center__header">
      <strong>客户端通知</strong>
      <button type="button" className="client-text-button" onClick={clearAllNotifications}>一键忽略</button>
      <button type="button" className="workbench-notification-center__close" aria-label="关闭客户端通知面板" onClick={onClose}><X size={16} /></button>
    </header>
    <div className="workbench-notification-center__tabs" role="tablist" aria-label="通知类型">
      <button id="workbench-important-tab" type="button" role="tab" aria-selected={activeTab === 'important'} aria-controls="workbench-important-panel" onClick={() => setActiveTab('important')}>重要</button>
      <button id="workbench-system-tab" type="button" role="tab" aria-selected={activeTab === 'system'} aria-controls="workbench-system-panel" onClick={() => setActiveTab('system')}>系统通知</button>
    </div>
    <section id={activeTab === 'important' ? 'workbench-important-panel' : 'workbench-system-panel'} className="workbench-notification-center__content" role="tabpanel" aria-labelledby={activeTab === 'important' ? 'workbench-important-tab' : 'workbench-system-tab'}>
      {activeTab === 'important' ? allImportantCards : systemCard}
    </section>
  </div>

  return <div id="workbench-notifications" className="workbench-notification-stack" aria-label="客户端通知列表">
    {messages.map(message => renderWorkbenchCard(message))}
    {voiceCallNotifications.length > 0 && <NotificationCard label="呼叫通知">
      <header className="workbench-notice-heading"><PhoneCall size={17} /><strong>呼叫通知</strong><span className="workbench-notice-type">{voiceCallNotifications.length} 条</span></header>
      <p className="workbench-global-notice__message">{voiceCallNotifications.length === 1 ? <><UserNameWithLevel name={voiceCallNotifications[0].callerName} identityId={voiceCallNotifications[0].callerName} /> 正在呼叫客服</> : <><UserNameWithLevel name={voiceCallNotifications[0].callerName} identityId={voiceCallNotifications[0].callerName} /> 等{voiceCallNotifications.length}位用户正在呼叫客服</>}</p>
      <footer className="workbench-notice-actions"><button type="button" className="client-button client-button--secondary" onClick={onIgnoreVoiceCall}>忽略</button><button type="button" className="client-button client-button--primary" onClick={onOpenVoiceCall}>查看</button></footer>
    </NotificationCard>}
    {voiceInvitations.slice(0, 1).map(invitation => renderInvitationCard(invitation))}
    {systemCard}
  </div>
}
