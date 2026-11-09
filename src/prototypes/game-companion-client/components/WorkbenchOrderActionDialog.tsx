import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'

export function WorkbenchOrderActionDialog({ logic: w }: { logic: WorkbenchLogic }) {
  const setOrderAction = w.setOrderAction
  const action = w.orderAction
  const order = w.orders.find(o => o.id === action?.id)
  const [quantity, setQuantity] = useState(() => action?.action === '同意提前结束' && order?.durationUnit === '局' && order.earlyEndSubmittedQuantity != null ? String(order.earlyEndSubmittedQuantity) : '')
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOrderAction(null)
      if (event.key === 'Tab') {
        const nodes = ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')
        if (!nodes?.length) return
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); previous?.focus() }
  }, [setOrderAction])
  if (!order || !action) return null
  const amount = Number(quantity)
  const valid = quantity.trim() !== '' && Number.isFinite(amount) && amount > 0 && Number.isSafeInteger(amount * 2) && (order.durationUnit !== '局' || amount <= order.duration)
  const adjustWaiverQuantity = (change: number) => setQuantity(current => {
    const currentValue = Number(current) || 0
    const nextValue = Math.min(order.duration, Math.max(0.5, Math.round((currentValue + change) * 2) / 2))
    return String(nextValue)
  })
  const totalServiceMinutes = (order.serviceSegmentMinutes ?? []).reduce((sum, minutes) => sum + minutes, 0)
  const earlyEndQuantity = order.durationUnit === '局' ? amount : totalServiceMinutes / 60
  const validEarlyEndQuantity = order.durationUnit === '局'
    ? quantity.trim() !== '' && Number.isFinite(amount) && amount > 0 && amount <= order.duration && Number.isInteger(amount * 2)
    : totalServiceMinutes > 0 && totalServiceMinutes <= order.duration * 60
  const message = action.action === '接受' ? '接受后订单将变为待服务。' : action.action === '拒绝' ? '拒绝后订单将取消、退款并通知玩家。' : action.action === '开始服务' ? '确认后订单将进入服务中。' : action.action === '继续服务' ? '确认后订单将恢复服务，服务计时继续。' : action.action === '拒绝提前结束' ? '确认拒绝后，订单会继续服务中。' : '将通知玩家确认，24 小时未确认自动完成订单。'
  const actionTitle = action.action === '同意提前结束' ? '同意提前结束' : action.action === '拒绝提前结束' ? '拒绝提前结束' : action.action === '拒绝' ? '拒绝订单' : action.action === '免单' ? '免单' : `确认${action.action}`
  return <div className="workbench-order-action-overlay" data-overlay="workbench-order-action" onClick={event => { if (event.target === event.currentTarget) w.setOrderAction(null) }}>
    <section ref={ref} tabIndex={-1} className="order-action-dialog" role="dialog" aria-modal="true" aria-labelledby="workbench-order-action-title">
      <header><h2 id="workbench-order-action-title">{actionTitle}</h2><button type="button" className="order-action-dialog__close" aria-label="关闭订单操作" onClick={() => w.setOrderAction(null)}><X size={17} /></button></header>
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
        <p>确认后将记录免单数量并生成售后记录{order.status === '服务中' ? '，订单将变为已完成' : ''}。</p>
      </> : (action.action === '同意提前结束' || action.action === '拒绝提前结束') ? <><p>{action.action === '同意提前结束' ? '确认同意提前结束吗？系统将按实际完成的服务自动结算。' : '确认拒绝提前结束吗？拒绝后订单将继续服务。'}</p>{order.durationUnit === '小时' ? <div className="order-early-end-summary"><span>已服务时长</span><strong>{String(Math.floor(totalServiceMinutes / 60)).padStart(2, '0')}:{String(totalServiceMinutes % 60).padStart(2, '0')}:00</strong></div> : action.action === '同意提前结束' ? <div className="workbench-waiver-field"><span>已完成局数</span><div className="checkout-duration__controls order-early-end-quantity__controls"><button type="button" className="checkout-duration__stepper" aria-label="减少 0.5 局" disabled={!quantity || amount <= 0.5} onClick={() => adjustWaiverQuantity(-0.5)}>−</button><label><input type="number" min="0.5" max={order.duration} step="0.5" value={quantity} onChange={e => setQuantity(e.target.value)} aria-label="已完成局数" aria-invalid={quantity !== '' && !validEarlyEndQuantity} /><span>局</span></label><button type="button" className="checkout-duration__stepper" aria-label="增加 0.5 局" disabled={amount >= order.duration} onClick={() => adjustWaiverQuantity(0.5)}>+</button></div><small>请输入 0.5 局的倍数，最多 {order.duration} 局</small></div> : <div className="order-early-end-summary"><span>用户提交的已完成局数</span><strong>{order.earlyEndSubmittedQuantity ?? '—'} 局</strong></div>}</> : <p>{message}</p>}
      <footer><button type="button" className="client-button client-button--secondary" onClick={() => w.setOrderAction(null)}>返回</button><button type="button" className="client-button client-button--primary" disabled={action.action === '免单' && (!valid || !['服务中', '已完成'].includes(order.status)) || action.action === '同意提前结束' && (!validEarlyEndQuantity || !order.earlyEndRequested || order.status !== '服务中') || action.action === '拒绝提前结束' && (!order.earlyEndRequested || order.status !== '服务中')} title={action.action === '免单' && !valid ? '请输入大于0且为0.5倍数的数量' : undefined} onClick={() => {
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
          if (order.status === '暂停中') w.resumeOrder(order.id)
          w.setOrderAction(null)
          return
        }
        const target = action.action === '接受' ? '待服务' : action.action === '开始服务' ? '服务中' : '待玩家确认'
        const expected = action.action === '接受' ? '待接单' : action.action === '开始服务' ? '待服务' : '服务中'
        if (order.status === expected) w.updateOrder(order.id, target)
        w.setOrderAction(null)
      }}>{action.action === '同意提前结束' ? '同意并结束服务' : action.action === '拒绝提前结束' || action.action === '拒绝' ? '确认拒绝' : `确认${action.action}`}</button></footer>
    </section>
  </div>
}
