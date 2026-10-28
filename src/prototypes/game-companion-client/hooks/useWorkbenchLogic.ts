import { useEffect, useState } from 'react'
import { games, servicesByCompanion } from '../data/mockData'

export type WorkOrder = { id: string; player: string; playerInitials: string; serviceId: string; status: string; amount: number; createdAt: string; duration: number; durationUnit: '小时' | '局'; unitPrice: number; deadline?: number }
const services = (servicesByCompanion['companion-001'] ?? []).filter((s, i, all) => all.findIndex(other => other.gameId === s.gameId && other.playName === s.playName && other.levelName === s.levelName) === i).flatMap(s => [{ ...s, name: '组队开黑' }, { ...s, id: `${s.id}-coaching`, name: '技巧指导' }])
const levelKey = (service: { gameId: string; playName: string; levelName: string }) => JSON.stringify([service.gameId, service.playName, service.levelName])
const initialServiceIds = services.filter(s => s.canAcceptOrders).map(s => s.id)
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
  const [orders, setOrders] = useState<WorkOrder[]>(() => ['待接单', '待服务', '服务中', '待玩家确认', '已完成'].map((status, i) => ({ id: `CW-1028-${100+i}`, player: ['晚风玩家', '小宇', '星河', '阿白', '奶糖'][i], playerInitials: ['晚风', '宇', '星河', '白', '糖'][i], serviceId: services[i % services.length]?.id ?? '', status, amount: 120 + i * 20, createdAt: `2026-10-28 ${String(14 - i).padStart(2, '0')}:20`, duration: 2, durationUnit: services[i % services.length]?.unit ?? '小时', unitPrice: (120 + i * 20) / 2, ...(status === '待玩家确认' ? { deadline: Date.now() + 86400000 } : {}) })))
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
    setOrders(items => items.map(o => o.id === id ? { ...o, status, ...(status === '待玩家确认' ? { deadline: Date.now() + 86400000 } : {}) } : o))
    setFeedback(status === '已取消' ? '订单已取消，已退款并通知玩家' : status === '待玩家确认' ? '已通知玩家确认，24 小时后自动完成' : `订单已变更为${status}`)
  }
  return { services, serviceGroups, selectedServiceGameId, setSelectedServiceGameId, serviceSelections, enabledLevelKeys, expandedLevelKeys, enabled, automatic, requests, orders, feedback, setFeedback, activeMatch, cancelMatch, respond, toggleAutomatic, updateOrder,
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
