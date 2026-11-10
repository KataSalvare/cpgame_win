import { Search } from 'lucide-react'
import { games } from '../data/mockData'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'
import { WorkbenchOrderActions } from './WorkbenchOrderDetailPanel'

const filters = ['全部', '待接单', '待服务', '服务中', '暂停中', '已完成', '已取消', '退款']

export function WorkbenchOrdersPanel({ logic: w, filter, onFilterChange, query, onQueryChange, label = '工作台订单' }: {
  logic: WorkbenchLogic
  filter: string
  onFilterChange: (filter: string) => void
  query: string
  onQueryChange: (query: string) => void
  label?: string
}) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredOrders = w.orders.filter(o => {
    const matchesStatus = filter === '全部' || (filter === '服务中' && ['服务中', '待玩家确认'].includes(o.status)) || o.status === filter
    const matchesQuery = !normalizedQuery || [o.id, o.player, o.playerId].some(value => value.toLocaleLowerCase().includes(normalizedQuery))
    return matchesStatus && matchesQuery
  })
  return <section className="client-card orders-list-card workbench-orders-table">
    <label className="orders-search"><Search size={16} aria-hidden="true" /><span className="sr-only">搜索订单号、用户名称或 ID</span><input type="search" value={query} onChange={event => onQueryChange(event.target.value)} placeholder="搜索订单号、用户名称或 ID" /></label>
    <div className="orders-filter-bar" role="group" aria-label={`按${label}状态筛选`}>{filters.map(status => <button type="button" key={status} className={`orders-filter-chip${filter === status ? ' is-active' : ''}`} aria-pressed={filter === status} onClick={() => onFilterChange(status)}>{status}</button>)}</div>
    {filteredOrders.length ? <div className="orders-list" role="group" aria-label={`${label}列表`}>
      <div className="order-list-header"><span>订单号</span><span>玩家信息</span><span>服务信息</span><span>时长</span><span className="order-price-columns"><span>成单价</span><span>实付</span></span><span>状态</span><span>操作</span></div>
      {filteredOrders.map(o => {
        const service = w.services.find(s => s.id === o.serviceId)
        const game = games.find(g => g.id === service?.gameId)
        const displayedStatus = o.earlyEndRequested ? '待陪玩确认' : o.status
        return <article className={`order-item workbench-order-table-row${w.selectedOrder?.id === o.id ? ' is-selected' : ''}`} key={o.id}>
          <button type="button" className="order-item__main" aria-label={`查看订单 ${o.id}，${o.player}，${displayedStatus}`} onClick={() => { w.setSelectedOrderId(o.id); window.location.hash = `page=orders&detail=receiving&order=${encodeURIComponent(o.id)}` }}>
            <span className="order-item__info"><strong>{o.id}</strong><small>{o.createdAt}</small></span>
            <span className="order-item__companion"><AvatarMark initials={o.playerInitials} size="sm" /><span className="order-item__companion-copy"><strong><UserNameWithLevel name={o.player} identityId={o.player} /></strong></span></span>
            <span className="order-item__service"><strong>{game?.name} · {service?.playName}</strong><small>{service?.levelName} · {service?.name}</small></span>
            <span className="order-item__duration">{o.duration} {o.durationUnit}</span>
            <span className="order-item__price order-price-columns"><strong>{o.unitPrice} 金豆 / {o.durationUnit}</strong><strong>{o.amount} 金豆</strong></span>
            <span className="workbench-order-table-row__status"><span className={`order-item__status order-item__status--${o.status === '已取消' ? 'cancelled' : o.status === '退款' ? 'refund' : o.status === '已完成' ? 'completed' : 'active'}`}>{displayedStatus}</span></span>
          </button><WorkbenchOrderActions logic={w} orderId={o.id} />
        </article>
      })}
    </div> : <div className="account-empty-inline"><strong>没有符合条件的订单</strong></div>}
  </section>
}
