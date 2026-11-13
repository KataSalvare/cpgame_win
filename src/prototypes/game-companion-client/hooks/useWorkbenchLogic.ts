import { useEffect, useState } from 'react'
import { clubs, companions, games, servicesByCompanion, type Service } from '../data/mockData'

export type WorkOrderAction = '接受' | '拒绝' | '开始服务' | '继续服务' | '完成服务' | '免单' | '同意提前结束' | '拒绝提前结束'
export type WorkOrder = { id: string; player: string; playerId: string; playerInitials: string; playerGender: '女' | '男'; playerAge: number; serviceId: string; clubName: string; status: string; amount: number; tipAmount: number; discountAmount: number; paymentSource: '金豆钱包' | '尊享卡'; remark?: string; createdAt: string; duration: number; durationUnit: '小时' | '局'; unitPrice: number; startedAt?: string; completionRequestedAt?: string; completedQuantity?: number; earlyEndRequested?: boolean; earlyEndSubmittedQuantity?: number; serviceSegmentMinutes?: number[]; waivedQuantity?: number; afterSalesRecords?: { id: string; recordedAt: string; category: '免单' | '提前结束' | '售后'; amount?: number | null }[]; deadline?: number }
const services = (servicesByCompanion['companion-001'] ?? []).filter((s, i, all) => all.findIndex(other => other.gameId === s.gameId && other.playName === s.playName && other.levelName === s.levelName) === i).flatMap(s => [{ ...s, name: '组队开黑' }, { ...s, id: `${s.id}-coaching`, name: '技巧指导' }])
const levelKey = (service: { gameId: string; playName: string; levelName: string }) => JSON.stringify([service.gameId, service.playName, service.levelName])
const initialServiceIds = services.filter(s => s.canAcceptOrders).map(s => s.id)
const workbenchClubName = clubs.find(club => club.id === companions.find(companion => companion.id === 'companion-001')?.clubId)?.name ?? '所属俱乐部'
type WorkbenchService = Service & { name: string; applicationStatus?: '待审核' }
const buildServiceGroups = (items: WorkbenchService[]) => games.filter(game => items.some(s => s.gameId === game.id)).map(game => ({
  ...game,
  plays: [...new Set(items.filter(s => s.gameId === game.id).map(s => s.playName))].map(name => ({
    name,
    levels: [...new Set(items.filter(s => s.gameId === game.id && s.playName === name).map(s => s.levelName))].map(level => ({
      name: level,
      key: levelKey({ gameId: game.id, playName: name, levelName: level }),
      services: items.filter(s => s.gameId === game.id && s.playName === name && s.levelName === level),
    })),
  })),
}))
const applicationTemplates = Object.values(servicesByCompanion).flat().filter((service, index, all) => all.findIndex(other => other.playName === service.playName && other.levelName === service.levelName && other.unit === service.unit) === index)
const serviceApplicationOptions: WorkbenchService[] = games.filter(game => game.id !== 'all').flatMap(game => applicationTemplates.map((template, index) => ({ ...template, id: `apply-${game.id}-${index}`, gameId: game.id, name: template.unit === '局' ? '按局服务' : '按小时服务', canAcceptOrders: false })))
export function useWorkbenchLogic(initialSelectedOrderId: string | null = null) {
  const [serviceApplications, setServiceApplications] = useState<WorkbenchService[]>([])
  const allWorkbenchServices: WorkbenchService[] = [...services, ...serviceApplications]
  const serviceGroups = buildServiceGroups(allWorkbenchServices)
  const [serviceSelections, setServiceSelections] = useState<string[]>(initialServiceIds)
  const [enabledLevelKeys, setEnabledLevelKeys] = useState<string[]>(() => [...new Set(services.filter(s => initialServiceIds.includes(s.id)).map(levelKey))])
  const [expandedLevelKeys, setExpandedLevelKeys] = useState<string[]>([])
  const [selectedServiceGameId, setSelectedServiceGameId] = useState(serviceGroups[0]?.id ?? '')
  const enabled = services.filter(s => serviceSelections.includes(s.id) && enabledLevelKeys.includes(levelKey(s))).map(s => s.id)
  const [automatic, setAutomatic] = useState(false)
  const [requests, setRequests] = useState(services.slice(0, 3).map((s, i) => ({ id: `M-${i+1}`, player: ['小宇', '晚风玩家', '星河'][i], playerInitials: ['宇', '晚风', '星河'][i], audition: i % 2 === 0 ? '试音' : '不试音', matchPrice: 150, quantity: 2, quantityUnit: s.unit, tipAmount: [100, 0, 100][i], serviceId: s.id, note: ['想练团队配合和沟通，可以先简单磨合。', '熟悉基础操作，希望重点练习对局思路。', '想提升地图点位理解，节奏可以稍快。'][i], status: '待响应' })))
  const [orders, setOrders] = useState<WorkOrder[]>(() => {
    const examples = ['待接单', '待服务', '服务中', '待玩家确认', '已完成'].map((status, i) => ({ id: `CW-1028-${100+i}`, player: ['晚风玩家', '小宇', '星河', '阿白', '奶糖'][i], playerId: `P-1028${60 + i}`, playerInitials: ['晚风', '宇', '星河', '白', '糖'][i], playerGender: ['女', '男', '男', '女', '女'][i] as '女' | '男', playerAge: [26, 22, 25, 24, 23][i], serviceId: services[i % services.length]?.id ?? '', clubName: workbenchClubName, status, amount: 120 + i * 20 + (i === 0 ? 20 : 0), tipAmount: i === 0 ? 20 : 0, discountAmount: 0, paymentSource: '金豆钱包' as const, createdAt: `2026-10-28 ${String(14 - i).padStart(2, '0')}:20`, duration: 2, durationUnit: services[i % services.length]?.unit ?? '小时', unitPrice: (120 + i * 20) / 2, ...(status === '待玩家确认' ? { deadline: Date.now() + 86400000 } : {}) }))
    const hourlyService = services.find(service => service.unit === '小时')
    const roundService = services.find(service => service.unit === '局')
    return [...examples, {
      id: 'CW-1028-105', player: '橘子汽水', playerId: 'P-102865', playerInitials: '橘子', playerGender: '女', playerAge: 23, serviceId: hourlyService?.id ?? services[0]?.id ?? '', clubName: workbenchClubName,
      status: '服务中', amount: 240, tipAmount: 0, discountAmount: 0, paymentSource: '金豆钱包', createdAt: '2026-10-28 09:20', duration: 3,
      durationUnit: hourlyService?.unit ?? '小时', unitPrice: 80, startedAt: '2026-10-28 09:35', earlyEndRequested: true, serviceSegmentMinutes: [45, 35, 25],
    }, {
      id: 'CW-1028-106', player: '小满', playerId: 'P-102866', playerInitials: '满', playerGender: '男', playerAge: 25, serviceId: roundService?.id ?? services[0]?.id ?? '', clubName: workbenchClubName,
      status: '服务中', amount: 400, tipAmount: 0, discountAmount: 0, paymentSource: '金豆钱包', createdAt: '2026-10-28 08:20', duration: 5,
      durationUnit: roundService?.unit ?? '局', unitPrice: 80, startedAt: '2026-10-28 08:25', earlyEndRequested: true, earlyEndSubmittedQuantity: 2, serviceSegmentMinutes: [18, 22, 15],
    }, {
      id: 'CW-1028-107', player: '晚风玩家', playerId: 'P-102860', playerInitials: '晚风', playerGender: '女', playerAge: 26, serviceId: hourlyService?.id ?? services[0]?.id ?? '', clubName: workbenchClubName,
      status: '暂停中', amount: 240, tipAmount: 0, discountAmount: 0, paymentSource: '金豆钱包', createdAt: '2026-10-28 07:20', duration: 3,
      durationUnit: hourlyService?.unit ?? '小时', unitPrice: 80, startedAt: '2026-10-28 07:35', serviceSegmentMinutes: [45],
    }]
  })
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialSelectedOrderId)
  const [orderAction, setOrderAction] = useState<{ id: string; action: WorkOrderAction } | null>(null)
  const [feedback, setFeedback] = useState('')
  useEffect(() => {
    const timer = window.setInterval(() => setOrders(items => items.some(o => o.deadline && o.status === '待玩家确认' && o.deadline <= Date.now()) ? items.map(o => o.deadline && o.status === '待玩家确认' && o.deadline <= Date.now() ? { ...o, status: '已完成' } : o) : items), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const activeMatch = requests.find(r => r.status === '已加入候选名单') ?? null
  const respond = (id: string) => {
    const request = requests.find(r => r.id === id)
    if (!request || request.status !== '待响应') return false
    if (activeMatch || !enabled.includes(request.serviceId)) {
      setFeedback(activeMatch ? '请先取消当前匹配，再接受其他匹配' : '请先开启该服务的接单')
      return false
    }
    setRequests(items => {
      if (items.some(r => r.status === '已加入候选名单')) return items
      return items.map(r => r.id === id && r.status === '待响应' ? { ...r, status: '已加入候选名单' } : r)
    })
    setFeedback('已加入候选名单，等待玩家选择并下单')
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
  const applyService = (optionId: string) => {
    const option = serviceApplicationOptions.find(item => item.id === optionId)
    if (!option) return false
    if (allWorkbenchServices.some(item => item.gameId === option.gameId && item.playName === option.playName && item.levelName === option.levelName && item.unit === option.unit)) {
      setFeedback('这项服务已在列表中，无需重复申请')
      return false
    }
    const application: WorkbenchService = { ...option, id: `service-application-${Date.now()}`, applicationStatus: '待审核', canAcceptOrders: false }
    setServiceApplications(items => [...items, application])
    const key = levelKey(application)
    setExpandedLevelKeys(items => items.includes(key) ? items : [...items, key])
    setSelectedServiceGameId(application.gameId)
    setFeedback('服务申请已提交，审核通过前不可开启接单')
    return true
  }
  const updateOrder = (id: string, status: string) => {
    setOrders(items => items.map(o => o.id === id ? { ...o, status, ...(status === '服务中' ? { startedAt: new Date().toLocaleString('zh-CN') } : {}), ...(status === '待玩家确认' ? { deadline: Date.now() + 86400000, completionRequestedAt: new Date().toLocaleString('zh-CN') } : {}) } : o))
    setFeedback(status === '已取消' ? '订单已取消，已退款并通知玩家' : status === '待玩家确认' ? '已通知玩家确认，24 小时后自动完成' : `订单已变更为${status}`)
  }
  const resumeOrder = (id: string) => {
    const order = orders.find(item => item.id === id)
    if (!order || order.status !== '暂停中') return false
    setOrders(items => items.map(item => item.id === id && item.status === '暂停中' ? { ...item, status: '服务中', startedAt: new Date().toLocaleString('zh-CN', { hour12: false }) } : item))
    setFeedback('已继续服务')
    return true
  }
  const rejectOrder = (id: string) => {
    const order = orders.find(item => item.id === id)
    if (!order || order.status !== '待接单') return false
    setOrders(items => items.map(item => item.id === id && item.status === '待接单' ? { ...item, status: '已取消' } : item))
    setFeedback('已拒绝订单，订单已取消、退款并通知玩家')
    return true
  }
  const recordOrderWaiver = (id: string, quantity: number) => {
    const order = orders.find(item => item.id === id)
    if (!order || !['服务中', '已完成'].includes(order.status) || !Number.isFinite(quantity) || quantity <= 0 || !Number.isSafeInteger(quantity * 2)) return false
    const total = (order.waivedQuantity ?? 0) + quantity
    if (!Number.isSafeInteger(total * 2)) return false
    const record = { id: `${id}-waiver-${Date.now()}`, recordedAt: new Date().toISOString(), category: '免单' as const, amount: null }
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
    if (!order || order.status !== '服务中' || !order.earlyEndRequested || !Number.isFinite(quantity) || quantity <= 0 || quantity > order.duration || (order.durationUnit === '局' && !Number.isInteger(quantity * 2))) return false
    const recordedAt = new Date().toISOString()
    const record = { id: `${id}-early-end-${Date.now()}`, recordedAt, category: '提前结束' as const, amount: null }
    setOrders(items => items.map(item => item.id === id && item.earlyEndRequested ? {
      ...item,
      status: '待玩家确认',
      earlyEndRequested: false,
      completedQuantity: quantity,
      completionRequestedAt: new Date(recordedAt).toLocaleString('zh-CN', { hour12: false }),
      afterSalesRecords: [...(item.afterSalesRecords ?? []), record],
      deadline: Date.now() + 86400000,
    } : item))
    setFeedback(`已同意提前结束，确认完成 ${quantity} ${order.durationUnit}，等待玩家确认`)
    return true
  }
  return { selectedOrderId, setSelectedOrderId, selectedOrder: orders.find(o => o.id === selectedOrderId) ?? null, orderAction, setOrderAction, services: allWorkbenchServices, serviceGroups, serviceApplicationOptions, applyService, selectedServiceGameId, setSelectedServiceGameId, serviceSelections, enabledLevelKeys, expandedLevelKeys, enabled, automatic, requests, orders, feedback, setFeedback, activeMatch, cancelMatch, respond, toggleAutomatic, updateOrder, resumeOrder, rejectOrder, recordOrderWaiver,
    rejectEarlyEnd, agreeEarlyEnd,
    toggleLevel: (key: string) => {
      const opening = !enabledLevelKeys.includes(key)
      setEnabledLevelKeys(items => opening ? [...items.filter(x => x !== key), key] : items.filter(x => x !== key))
      setExpandedLevelKeys(items => opening ? [...items.filter(x => x !== key), key] : items.filter(x => x !== key))
    },
    toggleLevelExpanded: (key: string) => {
      if (!enabledLevelKeys.includes(key) && !serviceApplications.some(service => levelKey(service) === key)) return
      setExpandedLevelKeys(items => items.includes(key) ? items.filter(x => x !== key) : [...items, key])
    },
    toggleService: (id: string) => {
      const service = services.find(s => s.id === id)
      if (!service || !enabledLevelKeys.includes(levelKey(service))) return
      setServiceSelections(items => items.includes(id) ? items.filter(x => x !== id) : [...items, id])
    },
    serviceLabel: (id: string) => { const s = services.find(s => s.id === id); return s ? `${games.find(g => g.id === s.gameId)?.name} · ${s.playName} · ${s.levelName} · ${s.name}` : '游戏服务' },
    pending: requests.filter(r => r.status === '待响应').length + orders.filter(o => o.status === '待接单').length,
  }
}
export type WorkbenchLogic = ReturnType<typeof useWorkbenchLogic>
