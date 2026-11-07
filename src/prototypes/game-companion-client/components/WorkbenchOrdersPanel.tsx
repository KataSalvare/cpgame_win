import { games } from '../data/mockData'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'
import { WorkbenchOrderActions } from './WorkbenchOrderDetailPanel'

const filters = ['全部', '待接单', '待服务', '服务中', '暂停中', '已完成', '已取消', '退款']

export function WorkbenchOrdersPanel({ logic: w, filter, onFilterChange, label = '工作台订单' }: {
  logic: WorkbenchLogic
  filter: string
  onFilterChange: (filter: string) => void
  label?: string
}) {
  const filteredOrders = w.orders.filter(o => filter === '全部' || (filter === '服务中' && ['服务中', '待玩家确认'].includes(o.status)) || o.status === filter)
  return <section className="client-card orders-list-card workbench-orders-table">
    <div className="orders-list-card__toolbar"><span className="client-count">{filteredOrders.length} 笔订单</span></div>
    <div className="orders-filter-bar" role="group" aria-label={`按${label}状态筛选`}>{filters.map(status => <button type="button" key={status} className={`orders-filter-chip${filter === status ? ' is-active' : ''}`} aria-pressed={filter === status} onClick={() => onFilterChange(status)}>{status}</button>)}</div>
    {filteredOrders.length ? <div className="orders-list" role="group" aria-label={`${label}列表`}>
      <div className="order-list-header"><span>订单号</span><span>玩家信息</span><span>服务信息</span><span>时长</span><span>价格</span><span>状态</span><span>操作</span></div>
      {filteredOrders.map(o => {
        const service = w.services.find(s => s.id === o.serviceId)
        const game = games.find(g => g.id === service?.gameId)
        const displayedStatus = o.earlyEndRequested ? '待陪玩确认' : o.status
        return <article className={`order-item workbench-order-table-row${w.selectedOrder?.id === o.id ? ' is-selected' : ''}`} key={o.id}>
          <button type="button" className="order-item__main" aria-label={`查看订单 ${o.id}，${o.player}，${displayedStatus}`} onClick={() => w.setSelectedOrderId(o.id)}>
            <span className="order-item__info"><strong>{o.id}</strong><small>{o.createdAt}</small></span>
            <span className="order-item__companion"><AvatarMark initials={o.playerInitials} size="sm" /><span className="order-item__companion-copy"><strong><UserNameWithLevel name={o.player} identityId={o.player} /></strong></span></span>
            <span className="order-item__service"><strong>{game?.name} · {service?.playName}</strong><small>{service?.levelName} · {service?.name}</small></span>
            <span className="order-item__duration">{o.duration} {o.durationUnit}</span>
            <span className="order-item__price"><strong>{o.unitPrice} 金豆 / {o.durationUnit}</strong><small>合计 {o.amount} 金豆</small></span>
            <span className="workbench-order-table-row__status"><span className={`order-item__status order-item__status--${o.status === '已取消' ? 'cancelled' : o.status === '退款' ? 'refund' : o.status === '已完成' ? 'completed' : 'active'}`}>{displayedStatus}</span></span>
          </button><WorkbenchOrderActions logic={w} orderId={o.id} />
        </article>
      })}
    </div> : <div className="account-empty-inline"><strong>没有符合条件的订单</strong></div>}
  </section>
}
