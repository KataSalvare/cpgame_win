export type RechargeCouponStatus = '可用' | '已过期' | '已使用'

export type RechargeCoupon = {
  id: string
  title: string
  description: string
  threshold: number
  discount: number
  status: RechargeCouponStatus
  expiresAt: string
}

export const rechargePackages = [
  { id: 'recharge-60', diamonds: 60, price: 6, label: '入门档' },
  { id: 'recharge-300', diamonds: 300, price: 30, label: '常用档' },
  { id: 'recharge-980', diamonds: 980, price: 98, label: '进阶档' },
  { id: 'recharge-1980', diamonds: 1980, price: 198, label: '畅玩档' },
]

export const initialCoupons: RechargeCoupon[] = [
  { id: 'coupon-001', title: '充值立减 5 元', description: '充值满 30 元可用', threshold: 30, discount: 5, status: '可用', expiresAt: '2026-11-30' },
  { id: 'coupon-002', title: '充值立减 2 元', description: '充值满 10 元可用', threshold: 10, discount: 2, status: '可用', expiresAt: '2026-12-15' },
  { id: 'coupon-003', title: '充值立减 10 元', description: '充值满 98 元可用', threshold: 98, discount: 10, status: '已使用', expiresAt: '2026-10-20' },
  { id: 'coupon-004', title: '充值立减 3 元', description: '充值满 30 元可用', threshold: 30, discount: 3, status: '已过期', expiresAt: '2026-10-01' },
]

export type PremiumCard = {
  id: string
  clubId: string
  name: string
  price: number
  minimumRechargeAmount: number
  serviceDiscountRate: number
  benefits: string[]
}

export type PremiumCardTransaction = {
  id: string
  cardId: string
  title: string
  date: string
  amount: number
}

export const premiumCards: PremiumCard[] = [
  { id: 'premium-001-a', clubId: 'club-001', name: '北境月度尊享卡', price: 300, minimumRechargeAmount: 100, serviceDiscountRate: 0.95, benefits: ['俱乐部专属身份标识', '每月专属组队活动名额', '俱乐部服务下单 95 折'] },
  { id: 'premium-001-b', clubId: 'club-001', name: '北境季度尊享卡', price: 800, minimumRechargeAmount: 100, serviceDiscountRate: 0.95, benefits: ['俱乐部专属身份标识', '优先参与俱乐部活动', '俱乐部服务下单 95 折', '专属客服通道'] },
  { id: 'premium-001-c', clubId: 'club-001', name: '北境年度尊享卡', price: 2880, minimumRechargeAmount: 100, serviceDiscountRate: 0.95, benefits: ['俱乐部专属身份标识', '优先参与俱乐部活动', '俱乐部服务下单 95 折', '专属客服通道'] },
  { id: 'premium-002-a', clubId: 'club-002', name: '月光月度畅玩卡', price: 260, minimumRechargeAmount: 100, serviceDiscountRate: 0.95, benefits: ['俱乐部专属身份标识', '每月组队活动名额', '俱乐部服务下单 95 折'] },
  { id: 'premium-002-b', clubId: 'club-002', name: '月光季度畅玩卡', price: 720, minimumRechargeAmount: 100, serviceDiscountRate: 0.95, benefits: ['俱乐部专属身份标识', '优先参与组队活动', '俱乐部服务下单 95 折'] },
  { id: 'premium-003-a', clubId: 'club-003', name: '破晓赛季卡', price: 520, minimumRechargeAmount: 100, serviceDiscountRate: 0.95, benefits: ['俱乐部专属身份标识', '赛事训练活动名额', '俱乐部服务下单 95 折'] },
]

export const initialOwnedPremiumCardIds = ['premium-001-a', 'premium-002-b']
export const initialPremiumCardBalances: Record<string, number> = {
  'premium-001-a': 120,
  'premium-002-b': 360,
}

export const initialPremiumCardTransactions: PremiumCardTransaction[] = [
  { id: 'premium-tx-001', cardId: 'premium-001-a', title: '尊享卡购买', date: '2026-10-10 14:20', amount: -300 },
  { id: 'premium-tx-002', cardId: 'premium-001-a', title: '卡内余额续充', date: '2026-10-18 19:35', amount: 120 },
  { id: 'premium-tx-003', cardId: 'premium-002-b', title: '尊享卡购买', date: '2026-10-12 16:08', amount: -720 },
  { id: 'premium-tx-004', cardId: 'premium-002-b', title: '卡内余额续充', date: '2026-10-21 20:12', amount: 360 },
]
