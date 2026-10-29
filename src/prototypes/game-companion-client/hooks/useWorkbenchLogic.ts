import { useEffect, useState } from 'react'
import { clubs, companions, games, servicesByCompanion } from '../data/mockData'

export type WorkOrderAction = '接收' | '取消' | '开始服务' | '完成服务' | '免单' | '同意提前结束' | '拒绝提前结束'
export type WorkOrder = { id: string; player: string; playerInitials: string; serviceId: string; clubName: string; status: string; amount: number; tipAmount: number; discountAmount: number; paymentSource: '钻石钱包' | '尊享卡'; createdAt: string; duration: number; durationUnit: '小时' | '局'; unitPrice: number; startedAt?: string; completionRequestedAt?: string; completedQuantity?: number; earlyEndRequested?: boolean; serviceSegmentMinutes?: number[]; waivedQuantity?: number; afterSalesRecords?: { id: string; recordedAt: string; quantity: number; unit: '小时' | '局' }[]; deadline?: number }
const services = (servicesByCompanion['companion-001'] ?? []).filter((s, i, all) => all.findIndex(other => other.gameId === s.gameId && other.playName === s.playName && other.levelName === s.levelName) === i).flatMap(s => [{ ...s, name: '组队开黑' }, { ...s, id: `${s.id}-coaching`, name: '技巧指导' }])
const levelKey = (service: { gameId: string; playName: string; levelName: string }) => JSON.stringify([service.gameId, service.playName, service.levelName])
const initialServiceIds = services.filter(s => s.canAcceptOrders).map(s => s.id)
const workbenchClubName = clubs.find(club => club.id === companions.find(companion => companion.id === 'companion-001')?.clubId)?.name ?? '所属俱乐部'
const serviceGroups = games.filter(game => services.some(s => s.gameId === game.id)).map(game => ({
  ...game,
  plays: [...new Set(services.filter(s => s.gameId === game.id).map(s => s.playName))].map(name => ({
    name,
    levels: [...new Set(services.filter(s => s.gameId === game.id && s.playName === name).map(s => s.levelName))].map(level => ({
      name: level,
      key: levelKey({ gameId: game.id, playName: name, levelName: level }),
      services: services.filter(s => s.gameId === game.id && s.playName === name && s.levelName === level),
    })),
  })),
}))
export function useWorkbenchLogic() {
  const [serviceSelections, setServiceSelections] = useState<string[]>(initialServiceIds)
  const [enabledLevelKeys, setEnabledLevelKeys] = useState<string[]>(() => [...new Set(services.filter(s => initialServiceIds.includes(s.id)).map(levelKey))])
  const [expandedLevelKeys, setExpandedLevelKeys] = useState<string[]>([])
  const [selectedServiceGameId, setSelectedServiceGameId] = useState(serviceGroups[0]?.id ?? '')
  const enabled = services.filter(s => serviceSelections.includes(s.id) && enabledLevelKeys.includes(levelKey(s))).map(s => s.id)
  const [automatic, setAutomatic] = useState(false)
  const [requests, setRequests] = useState(services.slice(0, 3).map((s, i) => ({ id: `M-${i+1}`, player: ['小宇', '晚风玩家', '星河'][i], playerInitials: ['宇', '晚风', '星河'][i], audition: i % 2 === 0 ? '试音' : '不试音', matchPrice: 150, tipAmount: [100, 0, 100][i], serviceId: s.id, status: '待响应' })))
  const [orders, setOrders] = useState<WorkOrder[]>(() => {
    const examples = ['待接单', '待服务', '服务中', '待玩家确认', '已完成'].map((status, i) => ({ id: `CW-1028-${100+i}`, player: ['晚风玩家', '小宇', '星河', '阿白', '奶糖'][i], playerInitials: ['晚风', '宇', '星河', '白', '糖'][i], serviceId: services[i % services.length]?.id ?? '', clubName: workbenchClubName, status, amount: 120 + i * 20 + (i === 0 ? 20 : 0), tipAmount: i === 0 ? 20 : 0, discountAmount: 0, paymentSource: '钻石钱包' as const, createdAt: `2026-10-28 ${String(14 - i).padStart(2, '0')}:20`, duration: 2, durationUnit: services[i % services.length]?.unit ?? '小时', unitPrice: (120 + i * 20) / 2, ...(status === '待玩家确认' ? { deadline: Date.now() + 86400000 } : {}) }))
    const hourlyService = services.find(service => service.unit === '小时')
    const roundService = services.find(service => service.unit === '局')
    return [...examples, {
      id: 'CW-1028-105', player: '橘子汽水', playerInitials: '橘子', serviceId: hourlyService?.id ?? services[0]?.id ?? '', clubName: workbenchClubName,
      status: '服务中', amount: 240, tipAmount: 0, discountAmount: 0, paymentSource: '钻石钱包', createdAt: '2026-10-28 09:20', duration: 3,
      durationUnit: hourlyService?.unit ?? '小时', unitPrice: 80, startedAt: '2026-10-28 09:35', earlyEndRequested: true, serviceSegmentMinutes: [45, 35, 25],
    }, {
      id: 'CW-1028-106', player: '小满', playerInitials: '满', serviceId: roundService?.id ?? services[0]?.id ?? '', clubName: workbenchClubName,
      status: '服务中', amount: 400, tipAmount: 0, discountAmount: 0, paymentSource: '钻石钱包', createdAt: '2026-10-28 08:20', duration: 5,
      durationUnit: roundService?.unit ?? '局', unitPrice: 80, startedAt: '2026-10-28 08:25', earlyEndRequested: true, serviceSegmentMinutes: [18, 22, 15],
    }]
  })
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderAction, setOrderAction] = useState<{ id: string; action: WorkOrderAction } | null>(null)
  const [feedback, setFeedback] = useState('')
  useEffect(() => {
    const timer = window.setInterval(() => setOrders(items => items.some(o => o.deadline && o.status === '待玩家确认' && o.deadline <= Date.now()) ? items.map(o => o.deadline && o.status === '待玩家确认' && o.deadline <= Date.now() ? { ...o, status: '已完成' } : o) : items), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const activeMatch = requests.find(r => r.status === '已加入候选名单') ?? null
  const respond = (id: string, accept: boolean) => {
    const request = requests.find(r => r.id === id)
    if (!request || request.status !== '待响应') return false
    if (accept && (activeMatch || !enabled.includes(request.serviceId))) {
      setFeedback(activeMatch ? '请先取消当前匹配，再接受其他匹配' : '请先开启该服务的接单')
      return false
    }
    setRequests(items => {
      if (accept && items.some(r => r.status === '已加入候选名单')) return items
      return items.map(r => r.id === id && r.status === '待响应' ? { ...r, status: accept ? '已加入候选名单' : '已忽略' } : r)
    })
    setFeedback(accept ? '已加入候选名单，等待玩家选择并下单' : '已忽略匹配请求')
    return true
  }
  const cancelMatch = (id: string) => {
    setRequests(items => items.map(r => r.id === id && r.status === '已加入候选名单' ? { ...r, status: '已取消匹配' } : r))
    setFeedback('已取消匹配，可以接受其他匹配请求')
  }
  const toggleAutomatic = (value: boolean) => {
    setAutomatic(value)
    if (value) setRequests(items => {
      if (items.some(r => r.status === '已加入候选名单')) return items
      const next = items.find(r => r.status === '待响应' && enabled.includes(r.serviceId))
      return items.map(r => r.id === next?.id ? { ...r, status: '已加入候选名单' } : r)
    })
  }
  const updateOrder = (id: string, status: string) => {
    setOrders(items => items.map(o => o.id === id ? { ...o, status, ...(status === '服务中' ? { startedAt: new Date().toLocaleString('zh-CN') } : {}), ...(status === '待玩家确认' ? { deadline: Date.now() + 86400000, completionRequestedAt: new Date().toLocaleString('zh-CN') } : {}) } : o))
    setFeedback(status === '已取消' ? '订单已取消，已退款并通知玩家' : status === '待玩家确认' ? '已通知玩家确认，24 小时后自动完成' : `订单已变更为${status}`)
  }
  const recordOrderWaiver = (id: string, quantity: number) => {
    const order = orders.find(item => item.id === id)
    if (!order || !['服务中', '已完成'].includes(order.status) || !Number.isFinite(quantity) || quantity <= 0 || !Number.isSafeInteger(quantity * 2)) return false
    const total = (order.waivedQuantity ?? 0) + quantity
    if (!Number.isSafeInteger(total * 2)) return false
    const record = { id: `${id}-waiver-${Date.now()}`, recordedAt: new Date().toISOString(), quantity, unit: order.durationUnit }
    setOrders(items => items.map(item => item.id === id && ['服务中', '已完成'].includes(item.status) ? {
      ...item,
      status: '已完成',
      waivedQuantity: (item.waivedQuantity ?? 0) + quantity,
      afterSalesRecords: [...(item.afterSalesRecords ?? []), record],
    } : item))
    setFeedback(`免单 ${quantity} ${order.durationUnit}，订单已完成，已新增售后记录`)
    return true
  }
  const rejectEarlyEnd = (id: string) => {
    const order = orders.find(item => item.id === id)
    if (!order || order.status !== '服务中' || !order.earlyEndRequested) return false
    setOrders(items => items.map(item => item.id === id ? { ...item, earlyEndRequested: false } : item))
    setFeedback('已拒绝提前结束申请，订单继续服务中')
    return true
  }
  const agreeEarlyEnd = (id: string, quantity: number) => {
    const order = orders.find(item => item.id === id)
    if (!order || order.status !== '服务中' || !order.earlyEndRequested || !Number.isFinite(quantity) || quantity <= 0 || quantity > order.duration || (order.durationUnit === '局' && !Number.isInteger(quantity))) return false
    setOrders(items => items.map(item => item.id === id && item.earlyEndRequested ? {
      ...item,
      status: '待玩家确认',
      earlyEndRequested: false,
      completedQuantity: quantity,
      completionRequestedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      deadline: Date.now() + 86400000,
    } : item))
    setFeedback(`已同意提前结束，确认完成 ${quantity} ${order.durationUnit}，等待玩家确认`)
    return true
  }
  return { selectedOrderId, setSelectedOrderId, selectedOrder: orders.find(o => o.id === selectedOrderId) ?? null, orderAction, setOrderAction, services, serviceGroups, selectedServiceGameId, setSelectedServiceGameId, serviceSelections, enabledLevelKeys, expandedLevelKeys, enabled, automatic, requests, orders, feedback, setFeedback, activeMatch, cancelMatch, respond, toggleAutomatic, updateOrder, recordOrderWaiver,
    rejectEarlyEnd, agreeEarlyEnd,
    toggleLevel: (key: string) => {
      const opening = !enabledLevelKeys.includes(key)
      setEnabledLevelKeys(items => opening ? [...items.filter(x => x !== key), key] : items.filter(x => x !== key))
      setExpandedLevelKeys(items => opening ? [...items.filter(x => x !== key), key] : items.filter(x => x !== key))
    },
    toggleLevelExpanded: (key: string) => {
      if (!enabledLevelKeys.includes(key)) return
      setExpandedLevelKeys(items => items.includes(key) ? items.filter(x => x !== key) : [...items, key])
    },
    toggleService: (id: string) => {
      const service = services.find(s => s.id === id)
      if (!service || !enabledLevelKeys.includes(levelKey(service))) return
      setServiceSelections(items => items.includes(id) ? items.filter(x => x !== id) : [...items, id])
    },
    serviceLabel: (id: string) => { const s = services.find(s => s.id === id); return s ? `${games.find(g => g.id === s.gameId)?.name} · ${s.playName} · ${s.levelName}` : '游戏服务' },
    pending: requests.filter(r => r.status === '待响应').length + orders.filter(o => o.status === '待接单').length,
  }
}
export type WorkbenchLogic = ReturnType<typeof useWorkbenchLogic>
