import { FileText, ShieldCheck, Wrench } from 'lucide-react'
import { fixedMessageFeeds, systemMessageNotifications, type FixedMessageFeed, type GroupJoinRequest } from '../data/socialMockData'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'

export function FixedMessageFeedPanel({ feed, requests, onResolve }: {
  feed: FixedMessageFeed
  requests: GroupJoinRequest[]
  onResolve: (id: string, status: 'approved' | 'rejected') => void
}) {
  return <section className="chat-panel fixed-message-feed" aria-label={fixedMessageFeeds.find((item) => item.id === feed)!.title}>
    <header className="chat-panel__header"><h2>{fixedMessageFeeds.find((item) => item.id === feed)!.title}</h2></header>
    <div className="fixed-message-feed__list">
      {feed === 'system' ? systemMessageNotifications.map((item) => <article className="fixed-notification-card" key={item.id}><span className="fixed-notification-icon">{item.icon === 'shield' ? <ShieldCheck size={22} /> : item.icon === 'rules' ? <FileText size={22} /> : <Wrench size={22} />}</span><div><h3>{item.title}</h3><p>{item.summary}</p><time>{item.time}</time></div></article>) : requests.length ? requests.map((request) => <article className="fixed-notification-card" key={request.id} aria-label={`${request.name}的入群申请`}><AvatarMark initials={request.initials} size="md" /><div><h3><UserNameWithLevel name={request.name} identityId={request.name} /> 申请加入 {request.groupName}</h3><p>{request.reason}</p><time>{request.time}</time></div><div className="fixed-notification-actions">{request.status === 'pending' ? <><button type="button" className="client-button client-button--secondary client-button--small" onClick={() => onResolve(request.id, 'rejected')}>拒绝</button><button type="button" className="client-button client-button--primary client-button--small" onClick={() => onResolve(request.id, 'approved')}>通过</button></> : <span role="status">{request.status === 'approved' ? '已通过' : '已拒绝'}</span>}</div></article>) : <div className="social-empty-inline">暂无入群申请</div>}
    </div>
  </section>
}
