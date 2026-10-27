import { useCallback, useState } from 'react'
import { games, companions, servicesByCompanion, type Companion, type Service } from '../data/mockData'
import {
  initialBeanBalance,
  initialDiamondBalance,
  initialOrders,
  makeClientOrder,
  walletEntries,
  type ClientOrder,
} from '../data/accountMockData'
import { initialCoupons, initialOwnedPremiumCardIds, initialPremiumCardBalances, initialPremiumCardTransactions, premiumCards, type PremiumCardTransaction } from '../data/storeMockData'

export function useAccountLogic() {
  const [diamondBalance, setDiamondBalance] = useState(initialDiamondBalance)
  const [beanBalance, setBeanBalance] = useState(initialBeanBalance)
  const [orders, setOrders] = useState(initialOrders)
  const [diamondTransactions, setDiamondTransactions] = useState(walletEntries.diamonds)
  const [beanTransactions, setBeanTransactions] = useState(walletEntries.beans)
  const [coupons, setCoupons] = useState(initialCoupons)
  const [ownedPremiumCardIds, setOwnedPremiumCardIds] = useState(initialOwnedPremiumCardIds)
  const [premiumCardBalances, setPremiumCardBalances] = useState(initialPremiumCardBalances)
  const [premiumCardTransactions, setPremiumCardTransactions] = useState<PremiumCardTransaction[]>(initialPremiumCardTransactions)

  const findOrderService = useCallback((companionId: string | null, serviceId: string | null): { companion: Companion; service: Service } | null => {
    if (!companionId || !serviceId) return null
    const companion = companions.find((item) => item.id === companionId)
    const service = servicesByCompanion[companionId]?.find((item) => item.id === serviceId)
    return companion && service ? { companion, service } : null
  }, [])

  const getGameName = useCallback((gameId: string) => games.find((game) => game.id === gameId)?.name ?? '游戏服务', [])

  const updateOrderStatus = useCallback((orderId: string, status: ClientOrder['status']) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order))
  }, [])

  const completePayment = useCallback((service: Service, companion: Companion, gameName: string, quantity: number, amount: number, remark: string, selectedCompanions: Companion[] = []): ClientOrder | null => {
    if (amount > diamondBalance) return null
    const order = makeClientOrder(service, companion, gameName, quantity, amount, remark, selectedCompanions.filter((item) => item.id !== companion.id))
    setDiamondBalance((balance) => balance - amount)
    setOrders((current) => [order, ...current])
    setDiamondTransactions((current) => [{ id: order.id, title: `订单消费 · ${service.playName}`, date: order.createdAt, amount: -amount }, ...current])
    return order
  }, [diamondBalance])

  const completeRecharge = useCallback((diamonds: number, amount: number, couponId: string | null) => {
    setDiamondBalance((balance) => balance + diamonds)
    setDiamondTransactions((current) => [{ id: `recharge-${Date.now()}`, title: `钻石充值 · ¥${amount}`, date: new Date().toLocaleString('zh-CN', { hour12: false }), amount: diamonds }, ...current])
    if (couponId) setCoupons((current) => current.map((coupon) => coupon.id === couponId ? { ...coupon, status: '已使用' } : coupon))
  }, [])

  const purchasePremiumCard = useCallback((cardId: string) => {
    const card = premiumCards.find((item) => item.id === cardId)
    if (!card || ownedPremiumCardIds.includes(cardId) || diamondBalance < card.price) return false
    setDiamondBalance((balance) => balance - card.price)
    setDiamondTransactions((current) => [{ id: `premium-${Date.now()}`, title: `尊享卡购买 · ${card.name}`, date: new Date().toLocaleString('zh-CN', { hour12: false }), amount: -card.price }, ...current])
    setOwnedPremiumCardIds((current) => [...current, cardId])
    setPremiumCardTransactions((current) => [{ id: `premium-tx-${Date.now()}`, cardId, title: '尊享卡购买', date: new Date().toLocaleString('zh-CN', { hour12: false }), amount: -card.price }, ...current])
    return true
  }, [diamondBalance, ownedPremiumCardIds])

  const rechargePremiumCard = useCallback((cardId: string, amount: number) => {
    const card = premiumCards.find((item) => item.id === cardId)
    if (!card || !ownedPremiumCardIds.includes(cardId) || !Number.isInteger(amount) || amount < card.minimumRechargeAmount || amount > diamondBalance) return false
    setDiamondBalance((balance) => balance - amount)
    setPremiumCardBalances((current) => ({ ...current, [cardId]: (current[cardId] ?? 0) + amount }))
    setDiamondTransactions((current) => [{ id: `premium-topup-${Date.now()}`, title: `尊享卡续充 · ${card.name}`, date: new Date().toLocaleString('zh-CN', { hour12: false }), amount: -amount }, ...current])
    setPremiumCardTransactions((current) => [{ id: `premium-topup-tx-${Date.now()}`, cardId, title: '卡内余额续充', date: new Date().toLocaleString('zh-CN', { hour12: false }), amount }, ...current])
    return true
  }, [diamondBalance, ownedPremiumCardIds])

  return {
    diamondBalance,
    beanBalance,
    orders,
    diamondTransactions,
    coupons,
    ownedPremiumCardIds,
    premiumCardBalances,
    premiumCardTransactions,
    withdrawBeans: (amount: number) => {
      if (!Number.isInteger(amount) || amount <= 0 || amount > beanBalance) return false
      setBeanBalance((balance) => balance - amount)
      setBeanTransactions((current) => [{ id: `bean-withdraw-${Date.now()}`, title: '糖豆提现申请', date: new Date().toLocaleString('zh-CN', { hour12: false }), amount: -amount }, ...current])
      return true
    },
    beanTransactions,
    findOrderService,
    getGameName,
    completePayment,
    completeRecharge,
    purchasePremiumCard,
    rechargePremiumCard,
    updateOrderStatus,
  }
}
