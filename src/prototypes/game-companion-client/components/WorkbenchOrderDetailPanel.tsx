import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import { Mars, MessageCircle, Venus } from 'lucide-react'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'
import { OrderNumberCopy } from './OrderNumberCopy'
import { OrderAfterSalesRecords } from './OrderAfterSalesRecords'
import { CopyableProfileId } from './CopyableProfileId'

export function WorkbenchOrderDetailPanel({ logic: w, onChat }: { logic: WorkbenchLogic; onChat: (order: NonNullable<WorkbenchLogic['selectedOrder']>) => void }) {
  const order = w.selectedOrder
  if (!order) return null
  const service = w.services.find(s => s.id === order.serviceId)
  const actions = order.earlyEndRequested ? ['同意提前结束', '拒绝提前结束'] as const : order.status === '待接单' ? ['接受', '拒绝'] as const : order.status === '待服务' ? ['开始服务'] as const : order.status === '暂停中' ? ['继续服务'] as const : order.status === '服务中' ? ['完成服务', '免单'] as const : order.status === '已完成' ? ['免单'] as const : []
  return <div className="order-detail-panel">
    <section className="order-detail-status-card"><strong className="order-detail-status-card__status">{order.earlyEndRequested ? '待陪玩确认' : order.status}</strong><OrderNumberCopy orderId={order.id} /><span className="order-detail-status-card__created">创建时间 {order.createdAt}</span></section>
    <section className="order-detail-section"><div className="order-detail-section__heading"><span className="client-eyebrow">玩家信息</span><button type="button" className="client-button client-button--secondary" onClick={() => onChat(order)}><MessageCircle size={15} />聊一聊</button></div><div className="order-detail-companion"><AvatarMark initials={order.playerInitials} size="md" /><div><strong><UserNameWithLevel name={order.player} identityId={order.player} /></strong><div className="order-detail-companion__identity"><CopyableProfileId value={order.playerId} entityLabel="用户" showLabel={false} /><span className="order-detail-companion__demographics" aria-label={`性别${order.playerGender}，${order.playerAge}岁`}>{order.playerGender === '女' ? <Venus size={13} aria-hidden="true" /> : <Mars size={13} aria-hidden="true" />}{order.playerAge}</span></div></div></div></section>
    <section className="order-detail-section"><div className="order-detail-section__heading"><span className="client-eyebrow">订单信息</span></div><div className="order-detail-facts"><span>服务信息</span><strong>{w.serviceLabel(order.serviceId)} · {service?.name}</strong><span>服务时长</span><strong>{order.duration} {order.durationUnit}</strong><span>服务单价</span><strong>{order.unitPrice} 金豆 / {order.durationUnit}</strong><span>加价</span><strong>{order.tipAmount} 金豆</strong><span>优惠金额</span><strong>{order.discountAmount} 金豆</strong><span>订单金额</span><strong>{order.amount} 金豆</strong><span>支付方式</span><strong>{order.paymentSource}</strong><span>订单备注</span><strong>{order.remark || '无'}</strong>{Boolean(order.waivedQuantity) && <><span>已免单数量</span><strong>{order.waivedQuantity} {order.durationUnit}</strong></>}</div></section>
    <section className="order-detail-section"><div className="order-detail-section__heading"><span className="client-eyebrow">服务记录</span></div><div className="order-detail-facts"><span>开始时间</span><strong>{order.startedAt ?? '暂无记录'}</strong><span>提交完成时间</span><strong>{order.completionRequestedAt ?? '暂无记录'}</strong>{order.completedQuantity !== undefined && <><span>确认完成量</span><strong>{order.completedQuantity} {order.durationUnit}</strong></>}{order.serviceSegmentMinutes?.length ? <><span>多段服务时长</span><strong>{formatServiceDuration(order.serviceSegmentMinutes.reduce((sum, minutes) => sum + minutes, 0))}（{order.serviceSegmentMinutes.length} 段）</strong></> : null}{order.deadline && order.status === '待玩家确认' && <><span>自动完成时间</span><strong>{new Date(order.deadline).toLocaleString('zh-CN')}</strong></>}</div></section>
    <OrderAfterSalesRecords records={(order.afterSalesRecords ?? []).map(record => ({ ...record, time: new Date(record.recordedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) }))} />
    <div className="order-detail-actions" aria-label="陪玩订单操作">{actions.map(action => <button type="button" key={action} className={`client-button ${action === '拒绝' || action === '免单' || action === '拒绝提前结束' ? 'client-button--secondary' : 'client-button--primary'}`} onClick={() => w.setOrderAction({ id: order.id, action })}>{action}</button>)}</div>
  </div>
}

export function WorkbenchOrderActions({ logic: w, orderId }: { logic: WorkbenchLogic; orderId: string }) {
  const order = w.orders.find(o => o.id === orderId)
  if (!order) return null
  const actions = order.earlyEndRequested ? ['同意提前结束', '拒绝提前结束'] as const : order.status === '待接单' ? ['接受', '拒绝'] as const : order.status === '待服务' ? ['开始服务'] as const : order.status === '暂停中' ? ['继续服务'] as const : order.status === '服务中' ? ['完成服务', '免单'] as const : order.status === '已完成' ? ['免单'] as const : []
  return <div className="workbench-match-actions workbench-order__actions" aria-label={`订单 ${order.id} 操作`}>{actions.map(action => <button type="button" key={action} className={`client-button ${action === '拒绝' || action === '免单' || action === '拒绝提前结束' ? 'client-button--secondary' : 'client-button--primary'}`} onClick={() => w.setOrderAction({ id: order.id, action })}>{action}</button>)}</div>
}

function formatServiceDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (!hours) return `${minutes} 分钟`
  if (!minutes) return `${hours} 小时`
  return `${hours} 小时 ${minutes} 分钟`
}
