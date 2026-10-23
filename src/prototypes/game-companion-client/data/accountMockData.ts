import type { Companion, Service } from './mockData'

export type OrderStatus = '待接单' | '待服务' | '服务中' | '已完成' | '退款'

export type ClientOrder = {
  id: string
  companionId: string
  companionName: string
  companionInitials: string
  serviceName: string
  gameName: string
  durationHours: number
  amount: number
  status: OrderStatus
  createdAt: string
}

export const playerProfile = {
  initials: '晚风',
  nickname: '晚风玩家',
  gender: '女',
  friends: 28,
  following: 136,
  followers: 284,
}

export const initialDiamondBalance = 260
export const initialBeanBalance = 12800

export const walletEntries = {
  diamonds: [
    { id: 'diamond-001', title: '订单消费', date: '2026-10-22 20:16', amount: -160 },
    { id: 'diamond-002', title: '活动赠送', date: '2026-10-21 12:30', amount: 200 },
    { id: 'diamond-003', title: '订单消费', date: '2026-10-19 22:05', amount: -240 },
  ],
  beans: [
    { id: 'bean-001', title: '每日签到', date: '2026-10-23 09:10', amount: 20 },
    { id: 'bean-002', title: '礼物兑换', date: '2026-10-22 18:44', amount: -300 },
    { id: 'bean-003', title: '活动奖励', date: '2026-10-20 14:12', amount: 500 },
  ],
}

export const initialOrders: ClientOrder[] = [
  { id: 'GC-20261022-0182', companionId: 'companion-001', companionName: '林间晚风', companionInitials: '晚风', serviceName: '默契排位', gameName: '无畏契约', durationHours: 2, amount: 320, status: '待接单', createdAt: '2026-10-22 20:16' },
  { id: 'GC-20261021-0127', companionId: 'companion-002', companionName: '北纬三十度', companionInitials: '北纬', serviceName: '团队上分', gameName: '无畏契约', durationHours: 1, amount: 140, status: '待服务', createdAt: '2026-10-21 19:25' },
  { id: 'GC-20261020-0084', companionId: 'companion-004', companionName: '莓莓汽水', companionInitials: '莓莓', serviceName: '轻松娱乐', gameName: '英雄联盟', durationHours: 2, amount: 260, status: '服务中', createdAt: '2026-10-20 21:08' },
  { id: 'GC-20261018-0051', companionId: 'companion-006', companionName: '折光', companionInitials: '折光', serviceName: '战术陪练', gameName: '无畏契约', durationHours: 1, amount: 190, status: '已完成', createdAt: '2026-10-18 17:32' },
  { id: 'GC-20261016-0029', companionId: 'companion-003', companionName: '云端指挥官', companionInitials: '云端', serviceName: '基础教学', gameName: '绝地求生', durationHours: 1, amount: 120, status: '退款', createdAt: '2026-10-16 13:40' },
]

export const makeClientOrder = (service: Service, companion: Companion, gameName: string, durationHours: number, amount: number): ClientOrder => ({
  id: `GC-${Date.now()}`,
  companionId: companion.id,
  companionName: companion.name,
  companionInitials: companion.initials,
  serviceName: service.playName,
  gameName,
  durationHours,
  amount,
  status: '待接单',
  createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
})
