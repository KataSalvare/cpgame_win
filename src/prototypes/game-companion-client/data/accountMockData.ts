import type { Companion, Service } from './mockData'
import cafeLifePhoto from '../assets/profile-life-photo-cafe.svg'
import windowLifePhoto from '../assets/profile-life-photo-window.svg'
import cityLifePhoto from '../assets/profile-life-photo-city.svg'

export type OrderStatus = '待接单' | '待服务' | '服务中' | '已完成' | '已取消' | '退款'

export type OrderTimeSegment = {
  id: string
  startAt: string | null
  endAt: string | null
}

export type ClientOrder = {
  id: string
  companionId: string
  companionName: string
  companionInitials: string
  serviceName: string
  levelName: string
  gameName: string
  duration: number
  durationUnit: '小时' | '局'
  amount: number
  unitPrice: number
  tipAmount?: number
  paymentSource?: 'wallet' | 'premium-card'
  premiumCardId?: string
  remark: string
  status: OrderStatus
  createdAt: string
  servedDurationMinutes?: number
  serviceSegments: OrderTimeSegment[]
  afterSalesSegments: OrderTimeSegment[]
}

export type PlayerProfile = {
  initials: string
  nickname: string
  userId: string
  gender: string
  birthday: string
  signature: string
  lifePhotoDataUrls: string[]
  friends: number
  following: number
  followers: number
  avatarDataUrl?: string
}

export const playerProfile: PlayerProfile = {
  initials: '晚风',
  nickname: '晚风玩家',
  userId: 'P-102860',
  gender: '女',
  birthday: '2000-08-12',
  signature: '热爱战术竞技，也喜欢轻松组队。',
  lifePhotoDataUrls: [cafeLifePhoto, windowLifePhoto, cityLifePhoto],
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
  { id: 'GC-20261022-0182', companionId: 'companion-001', companionName: '林间晚风', companionInitials: '晚风', serviceName: '默契排位', levelName: '进阶场', gameName: '无畏契约', duration: 2, durationUnit: '小时', unitPrice: 160, amount: 320, remark: '', status: '待接单', createdAt: '2026-10-22 20:16', serviceSegments: [{ id: 'service-1', startAt: null, endAt: null }], afterSalesSegments: [] },
  { id: 'GC-20261021-0127', companionId: 'companion-002', companionName: '北纬三十度', companionInitials: '北纬', serviceName: '团队上分', levelName: '团队场', gameName: '无畏契约', duration: 1, durationUnit: '小时', unitPrice: 140, amount: 140, remark: '', status: '待服务', createdAt: '2026-10-21 19:25', serviceSegments: [{ id: 'service-1', startAt: null, endAt: null }], afterSalesSegments: [] },
  { id: 'GC-20261020-0084', companionId: 'companion-004', companionName: '莓莓汽水', companionInitials: '莓莓', serviceName: '轻松娱乐', levelName: '娱乐局', gameName: '英雄联盟', duration: 2, durationUnit: '小时', unitPrice: 130, amount: 260, remark: '', status: '服务中', createdAt: '2026-10-20 21:08', servedDurationMinutes: 45, serviceSegments: [{ id: 'service-1', startAt: '2026-10-20 21:20', endAt: null }], afterSalesSegments: [] },
  { id: 'GC-20261018-0051', companionId: 'companion-006', companionName: '折光', companionInitials: '折光', serviceName: '战术陪练', levelName: '标准场', gameName: '无畏契约', duration: 1, durationUnit: '小时', unitPrice: 190, amount: 190, remark: '', status: '已完成', createdAt: '2026-10-18 17:32', serviceSegments: [{ id: 'service-1', startAt: '2026-10-18 17:45', endAt: '2026-10-18 18:15' }, { id: 'service-2', startAt: '2026-10-18 18:20', endAt: '2026-10-18 18:50' }], afterSalesSegments: [] },
  { id: 'GC-20261016-0029', companionId: 'companion-003', companionName: '云端指挥官', companionInitials: '云端', serviceName: '基础教学', levelName: '入门场', gameName: '绝地求生', duration: 1, durationUnit: '小时', unitPrice: 120, amount: 120, remark: '', status: '退款', createdAt: '2026-10-16 13:40', serviceSegments: [{ id: 'service-1', startAt: '2026-10-16 14:00', endAt: '2026-10-16 14:30' }], afterSalesSegments: [{ id: 'after-sales-1', startAt: '2026-10-16 15:10', endAt: '2026-10-17 09:25' }] },
]

export const makeClientOrder = (service: Service, companion: Companion, gameName: string, duration: number, amount: number, remark: string, additionalCompanions: Companion[] = [], tipAmount = 0, paymentSource: ClientOrder['paymentSource'] = 'wallet', premiumCardId?: string): ClientOrder => ({
  id: `GC-${Date.now()}`,
  companionId: companion.id,
  companionName: [companion, ...additionalCompanions.filter((item) => item.id !== companion.id)].map((item) => item.name).join('、'),
  companionInitials: companion.initials,
  serviceName: service.playName,
  levelName: service.levelName,
  gameName,
  duration,
  durationUnit: service.unit,
  amount,
  unitPrice: service.price,
  tipAmount,
  paymentSource,
  premiumCardId,
  remark,
  status: '待接单',
  createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  serviceSegments: [{ id: 'service-1', startAt: null, endAt: null }],
  afterSalesSegments: [],
})
