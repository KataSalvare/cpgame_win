import { useState } from 'react'
import { ConfirmationDialog } from './ConfirmationDialog'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'

export function WorkbenchOrderActionDialog({ logic: w }: { logic: WorkbenchLogic }) {
  const action = w.orderAction
  const order = w.orders.find(o => o.id === action?.id)
  const [quantity, setQuantity] = useState(() => action?.action === '同意提前结束' && order?.durationUnit === '局' && order.earlyEndSubmittedQuantity != null ? String(order.earlyEndSubmittedQuantity) : '')
  if (!order || !action) return null
  const amount = Number(quantity)
  const valid = quantity.trim() !== '' && Number.isFinite(amount) && amount > 0 && Number.isSafeInteger(amount * 2) && (order.durationUnit !== '局' || amount <= order.duration)
  const adjustWaiverQuantity = (change: number) => setQuantity(current => {
    const currentValue = Number(current) || 0
    const nextValue = Math.min(order.duration, Math.max(0.5, Math.round((currentValue + change) * 2) / 2))
    return String(nextValue)
  })
  const totalServiceMinutes = (order.serviceSegmentMinutes ?? []).reduce((sum, minutes) => sum + minutes, 0)
  const earlyEndQuantity = order.durationUnit === '局' ? order.earlyEndSubmittedQuantity ?? 0 : totalServiceMinutes / 60
  const validEarlyEndQuantity = order.durationUnit === '局'
    ? Number.isFinite(earlyEndQuantity) && earlyEndQuantity > 0 && earlyEndQuantity <= order.duration && Number.isInteger(earlyEndQuantity * 2)
    : totalServiceMinutes > 0 && totalServiceMinutes <= order.duration * 60
  const message = action.action === '接受' ? '接单后，请及时联系老板确认履约方式哦～' : action.action === '拒绝' ? '建议您提前和老板进行沟通，拒绝后订单将被取消，同时自动退款。' : action.action === '开始服务' ? '请确认老板已就位，开始服务后将自动计算服务时长。' : action.action === '继续服务' ? '请确认老板已就位，继续服务后将继续计算服务时长。' : action.action === '拒绝提前结束' ? '确认拒绝后，订单会继续服务中。' : action.action === '免单' ? '确认后，平台将按免单数量给老板退款' : '请确认您已完成服务履约，平台将通知老板确认，24 小时未确认将自动完成订单。'
  const actionTitle = action.action === '同意提前结束' ? '同意提前结束' : action.action === '拒绝提前结束' ? '拒绝提前结束' : action.action === '拒绝' ? '拒绝订单' : action.action === '免单' ? '免单' : `确认${action.action}`
  return <ConfirmationDialog overlayId="workbench-order-action" title={actionTitle} cancelLabel="返回"
    confirmLabel={action.action === '同意提前结束' ? '同意并结束服务' : action.action === '拒绝提前结束' || action.action === '拒绝' ? '确认拒绝' : `确认${action.action}`}
    confirmDisabled={action.action === '免单' && (!valid || !['服务中', '已完成'].includes(order.status)) || action.action === '同意提前结束' && (!validEarlyEndQuantity || !order.earlyEndRequested || order.status !== '服务中') || action.action === '拒绝提前结束' && (!order.earlyEndRequested || order.status !== '服务中')}
    onCancel={() => w.setOrderAction(null)} onConfirm={() => {
        if (action.action === '免单') {
          if (valid && w.recordOrderWaiver(order.id, amount)) w.setOrderAction(null)
          return
        }
        if (action.action === '同意提前结束') {
          if (validEarlyEndQuantity && w.agreeEarlyEnd(order.id, earlyEndQuantity)) w.setOrderAction(null)
          return
        }
        if (action.action === '拒绝提前结束') {
          w.rejectEarlyEnd(order.id)
          w.setOrderAction(null)
          return
        }
        if (action.action === '拒绝') {
          w.rejectOrder(order.id)
          w.setOrderAction(null)
          return
        }
        if (action.action === '继续服务') {
          if (order.status === '已暂停') w.resumeOrder(order.id)
          w.setOrderAction(null)
          return
        }
        const target = action.action === '接受' ? '待服务' : action.action === '开始服务' ? '服务中' : '待玩家确认'
        const expected = action.action === '接受' ? '待接单' : action.action === '开始服务' ? '待服务' : '服务中'
        if (order.status === expected) w.updateOrder(order.id, target)
        w.setOrderAction(null)
      }}>
      {action.action === '免单' ? <>
        <div className="workbench-waiver-field">
          <span>免单{order.durationUnit === '小时' ? '小时数' : '局数'}</span>
          {order.durationUnit === '局' ? <div className="checkout-duration__controls order-early-end-quantity__controls">
            <button type="button" className="checkout-duration__stepper" aria-label="减少 0.5 局" disabled={quantity === '' || !Number.isFinite(amount) || amount <= 0.5} onClick={() => adjustWaiverQuantity(-0.5)}><span aria-hidden="true">−</span></button>
            <label><input className="order-early-end-quantity__input" type="number" min="0.5" max={order.duration} step="0.5" value={quantity} onChange={e => setQuantity(e.target.value)} aria-label="免单局数" aria-invalid={quantity !== '' && !valid} /><span>局</span></label>
            <button type="button" className="checkout-duration__stepper" aria-label="增加 0.5 局" disabled={Number.isFinite(amount) && amount >= order.duration} onClick={() => adjustWaiverQuantity(0.5)}><span aria-hidden="true">+</span></button>
          </div> : <input type="number" min="0.5" step="0.5" value={quantity} onChange={e => setQuantity(e.target.value)} aria-label="免单小时数" aria-invalid={quantity !== '' && !valid} />}
          <small>{order.durationUnit === '局' ? `请输入0.5局的备注，最多${order.duration}局` : '请输入大于 0 的数字，且为 0.5 的倍数'}</small>
        </div>
        <p>{message}</p>
      </> : (action.action === '同意提前结束' || action.action === '拒绝提前结束') ? <><p>{action.action === '同意提前结束' ? '确认同意提前结束吗？系统将按玩家提交的已完成局数结算。' : '确认拒绝提前结束吗？拒绝后订单将继续服务。'}</p>{order.durationUnit === '小时' ? <div className="order-early-end-summary"><span>已服务时长</span><strong>{String(Math.floor(totalServiceMinutes / 60)).padStart(2, '0')}:{String(totalServiceMinutes % 60).padStart(2, '0')}:00</strong></div> : <div className="order-early-end-summary"><span>用户提交的已完成局数</span><strong>{order.earlyEndSubmittedQuantity ?? '—'} 局</strong></div>}</> : <><p>{message}</p>{(action.action === '开始服务' || action.action === '继续服务') && <div className="order-start-duration"><span>服务时长</span><strong>{order.duration}{order.durationUnit}</strong></div>}</>}
  </ConfirmationDialog>
}
