import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import { AvatarMark } from './AvatarMark'

type Props = {
  logic: WorkbenchLogic
  filter: string
  onFilterChange: (status: string) => void
  onCancel: (id: string) => void
}

export function WorkbenchMatchesPanel({ logic: w, filter, onFilterChange, onCancel }: Props) {
  const requests = w.requests.filter(r => filter === '全部' || r.status === filter)
  return <section className="client-card orders-list-card workbench-matches-table">
    <div className="orders-list-card__toolbar"><span className="client-count">{requests.length} 条匹配请求</span></div>
    <div className="orders-filter-bar" role="group" aria-label="按匹配请求状态筛选">
      {['全部', '待响应', '已加入候选名单', '已忽略', '已取消匹配'].map(status => <button type="button" key={status} className={`orders-filter-chip${filter === status ? ' is-active' : ''}`} aria-pressed={filter === status} onClick={() => onFilterChange(status)}>{status}</button>)}
    </div>
    {requests.length ? <div className="orders-list" role="group" aria-label="全部匹配请求列表">
      <div className="order-list-header workbench-match-grid"><span>玩家信息</span><span>类型</span><span>匹配内容</span><span>价格</span><span>状态</span><span>操作</span></div>
      {requests.map(request => {
        const service = w.services.find(s => s.id === request.serviceId)
        const unavailable = !w.enabled.includes(request.serviceId)
        return <article className="order-item workbench-match-grid" key={request.id} aria-label={`匹配请求 ${request.id} ${request.player}`}>
          <div className="order-item__companion"><AvatarMark initials={request.playerInitials} size="sm" /><div className="order-item__info"><strong>{request.player}</strong><small>{request.id}</small></div></div>
          <span className="order-item__duration">{request.audition}</span>
          <div className="order-item__service"><strong>{w.serviceLabel(request.serviceId)}</strong></div>
          <div className="order-item__price"><strong>{request.matchPrice} 钻石 / {service?.unit ?? '小时'}</strong><small>加价 {request.tipAmount} 钻石</small></div>
          <span className="order-item__status">{request.status}</span>
          <div className="workbench-match-actions">
            {request.status === '待响应' ? <><button type="button" className="client-button client-button--secondary" onClick={() => w.respond(request.id, false)}>忽略</button><button type="button" className="client-button client-button--primary" disabled={Boolean(w.activeMatch) || unavailable} title={w.activeMatch ? '请先取消当前匹配' : unavailable ? '请先开启该等级和服务的接单' : undefined} onClick={() => w.respond(request.id, true)}>接受匹配</button></> : request.status === '已加入候选名单' ? <button type="button" className="client-button client-button--secondary" onClick={() => onCancel(request.id)}>取消匹配</button> : <span className="client-muted">—</span>}
          </div>
        </article>
      })}
    </div> : <div className="account-empty-inline"><strong>{filter === '全部' ? '暂无收到的匹配请求' : '没有符合条件的匹配请求'}</strong></div>}
  </section>
}
