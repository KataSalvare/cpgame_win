import { useEffect, useState } from 'react'
import { games, servicesByCompanion } from '../data/mockData'

export type WorkOrder = { id: string; player: string; serviceId: string; status: string; amount: number; deadline?: number }
export function useWorkbenchLogic() {
  const services = (servicesByCompanion['companion-001'] ?? []).filter((s, i, all) => all.findIndex(other => other.gameId === s.gameId && other.playName === s.playName && other.levelName === s.levelName) === i).flatMap(s => [{ ...s, name: '组队开黑' }, { ...s, id: `${s.id}-coaching`, name: '技巧指导' }])
  const [enabled, setEnabled] = useState<string[]>(services.filter(s => s.canAcceptOrders).map(s => s.id))
  const [automatic, setAutomatic] = useState(false)
  const [requests, setRequests] = useState(services.slice(0, 3).map((s, i) => ({ id: `M-${i+1}`, player: ['小宇', '晚风玩家', '星河'][i], serviceId: s.id, status: '待响应' })))
  const [orders, setOrders] = useState<WorkOrder[]>(() => ['待接单', '待服务', '服务中', '待玩家确认', '已完成'].map((status, i) => ({ id: `CW-1028-${100+i}`, player: ['晚风玩家', '小宇', '星河', '阿白', '奶糖'][i], serviceId: services[i % services.length]?.id ?? '', status, amount: 120 + i * 20, ...(status === '待玩家确认' ? { deadline: Date.now() + 86400000 } : {}) })))
  const [feedback, setFeedback] = useState('')
  const [noticeOpen, setNoticeOpen] = useState(true)
  useEffect(() => {
    const timer = window.setInterval(() => setOrders(items => items.some(o => o.deadline && o.status === '待玩家确认' && o.deadline <= Date.now()) ? items.map(o => o.deadline && o.status === '待玩家确认' && o.deadline <= Date.now() ? { ...o, status: '已完成' } : o) : items), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const respond = (id: string, accept: boolean) => {
    setRequests(items => items.map(r => r.id === id ? { ...r, status: accept ? '已加入候选名单' : '已忽略' } : r))
    setFeedback(accept ? '已加入候选名单，等待玩家选择并下单' : '已忽略匹配请求')
  }
  const toggleAutomatic = (value: boolean) => {
    setAutomatic(value)
    if (value) setRequests(items => items.map(r => r.status === '待响应' && enabled.includes(r.serviceId) ? { ...r, status: '已加入候选名单' } : r))
  }
  const updateOrder = (id: string, status: string) => {
    setOrders(items => items.map(o => o.id === id ? { ...o, status, ...(status === '待玩家确认' ? { deadline: Date.now() + 86400000 } : {}) } : o))
    setFeedback(status === '已取消' ? '订单已取消，已退款并通知玩家' : status === '待玩家确认' ? '已通知玩家确认，24 小时后自动完成' : `订单已变更为${status}`)
  }
  return { services, enabled, automatic, requests, orders, feedback, noticeOpen, setNoticeOpen, setFeedback, respond, toggleAutomatic, updateOrder,
    toggleService: (id: string) => setEnabled(items => items.includes(id) ? items.filter(x => x !== id) : [...items, id]),
    serviceLabel: (id: string) => { const s = services.find(s => s.id === id); return s ? `${games.find(g => g.id === s.gameId)?.name} · ${s.playName} · ${s.levelName}` : '游戏服务' },
    pending: requests.filter(r => r.status === '待响应').length + orders.filter(o => o.status === '待接单').length,
  }
}
export type WorkbenchLogic = ReturnType<typeof useWorkbenchLogic>
