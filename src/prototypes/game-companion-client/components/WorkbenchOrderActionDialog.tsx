import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'

export function WorkbenchOrderActionDialog({ logic: w }: { logic: WorkbenchLogic }) {
  const setOrderAction = w.setOrderAction
  const action = w.orderAction
  const order = w.orders.find(o => o.id === action?.id)
  const [quantity, setQuantity] = useState('')
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
  const valid = quantity.trim() !== '' && Number.isFinite(amount) && amount > 0 && Number.isSafeInteger(amount * 2)
  const message = action.action === '接收' ? '接收后订单将变为待服务。' : action.action === '取消' ? '取消后将自动退款并通知玩家。' : action.action === '开始服务' ? '确认后订单将进入服务中。' : '将通知玩家确认，24 小时未确认自动完成订单。'
  return <div className="workbench-order-action-overlay" data-overlay="workbench-order-action" onClick={event => { if (event.target === event.currentTarget) w.setOrderAction(null) }}>
    <section ref={ref} tabIndex={-1} className="order-action-dialog" role="dialog" aria-modal="true" aria-labelledby="workbench-order-action-title">
      <header><h2 id="workbench-order-action-title">{action.action === '免单' ? '免单' : `确认${action.action}`}</h2><button type="button" className="order-action-dialog__close" aria-label="关闭订单操作" onClick={() => w.setOrderAction(null)}><X size={17} /></button></header>
      {action.action === '免单' ? <><label className="workbench-waiver-field">免单{order.durationUnit === '小时' ? '小时数' : '局数'}<input type="number" min="0.5" step="0.5" value={quantity} onChange={e => setQuantity(e.target.value)} aria-invalid={quantity !== '' && !valid} /><small>请输入大于 0 的数字，且为 0.5 的倍数</small></label><p>确认免单后，订单将变为已完成，并生成售后记录。</p></> : <p>{message}</p>}
      <footer><button type="button" className="client-button client-button--secondary" onClick={() => w.setOrderAction(null)}>返回</button><button type="button" className="client-button client-button--primary" disabled={action.action === '免单' && (!valid || order.status !== '服务中')} title={action.action === '免单' && !valid ? '请输入大于0且为0.5倍数的数量' : undefined} onClick={() => {
        if (action.action === '免单') {
          if (valid && w.recordOrderWaiver(order.id, amount)) w.setOrderAction(null)
          return
        }
        const target = action.action === '接收' ? '待服务' : action.action === '取消' ? '已取消' : action.action === '开始服务' ? '服务中' : '待玩家确认'
        const expected = action.action === '接收' || action.action === '取消' ? '待接单' : action.action === '开始服务' ? '待服务' : '服务中'
        if (order.status === expected) w.updateOrder(order.id, target)
        w.setOrderAction(null)
      }}>确认{action.action}</button></footer>
    </section>
  </div>
}
