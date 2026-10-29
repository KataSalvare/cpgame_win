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

  const pauseOrder = useCallback((orderId: string) => {
    const pausedAt = new Date().toLocaleString('zh-CN', { hour12: false })
    setOrders((current) => current.map((order) => {
      if (order.id !== orderId || order.status !== '服务中') return order
      const activeSegmentIndex = order.serviceSegments.findLastIndex((segment) => segment.startAt && !segment.endAt)
      const serviceSegments = activeSegmentIndex < 0
        ? order.serviceSegments
        : order.serviceSegments.map((segment, index) => index === activeSegmentIndex ? { ...segment, endAt: pausedAt } : segment)
      return { ...order, status: '待服务', serviceSegments }
    }))
  }, [])

  const renewOrder = useCallback((orderId: string, quantity: number) => {
    const order = orders.find((item) => item.id === orderId)
    if (!order || order.status !== '服务中' || !Number.isInteger(quantity) || quantity <= 0) return false
    const renewalAmount = order.unitPrice * quantity
    if (!Number.isInteger(renewalAmount) || renewalAmount <= 0 || renewalAmount > diamondBalance) return false
    const renewedAt = new Date().toLocaleString('zh-CN', { hour12: false })
    setDiamondBalance((balance) => balance - renewalAmount)
    setDiamondTransactions((current) => [{ id: `renewal-${Date.now()}`, title: `订单续单 · ${order.serviceName}`, date: renewedAt, amount: -renewalAmount }, ...current])
    setOrders((current) => current.map((item) => item.id === orderId
      ? { ...item, duration: item.duration + quantity, amount: item.amount + renewalAmount }
      : item))
    return true
  }, [diamondBalance, orders])

  const completePayment = useCallback((service: Service, companion: Companion, gameName: string, quantity: number, amount: number, remark: string, selectedCompanions: Companion[] = [], tipAmount = 0, paymentSource: 'wallet' | 'premium-card' = 'wallet', premiumCardId?: string): ClientOrder | null => {
    const paymentCard = paymentSource === 'premium-card' ? premiumCards.find((card) => card.id === premiumCardId && card.clubId === companion.clubId && ownedPremiumCardIds.includes(card.id)) : undefined
    const availableBalance = paymentSource === 'wallet' ? diamondBalance : paymentCard ? premiumCardBalances[paymentCard.id] ?? 0 : 0
    const companionCount = Math.max(1, selectedCompanions.length)
    const serviceSubtotal = service.price * quantity * companionCount
    const discountedSubtotal = Math.round(serviceSubtotal * (paymentCard?.serviceDiscountRate ?? 1))
    const expectedAmount = discountedSubtotal + tipAmount
    if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isInteger(tipAmount) || tipAmount < 0 || !Number.isInteger(amount) || amount !== expectedAmount || amount > availableBalance || (paymentSource === 'premium-card' && !paymentCard)) return null
    const order = makeClientOrder(service, companion, gameName, quantity, amount, remark, selectedCompanions.filter((item) => item.id !== companion.id), tipAmount, paymentSource, paymentCard?.id)
    if (paymentSource === 'wallet') {
      setDiamondBalance((balance) => balance - amount)
      setDiamondTransactions((current) => [{ id: order.id, title: `订单消费 · ${service.playName}${tipAmount > 0 ? `（含加价 ${tipAmount}）` : ''}`, date: order.createdAt, amount: -amount }, ...current])
    } else if (paymentCard) {
      setPremiumCardBalances((current) => ({ ...current, [paymentCard.id]: (current[paymentCard.id] ?? 0) - amount }))
      setPremiumCardTransactions((current) => [{ id: order.id, cardId: paymentCard.id, title: `服务订单支付 · ${service.playName}${tipAmount > 0 ? `（含加价 ${tipAmount}）` : ''}`, date: order.createdAt, amount: -amount }, ...current])
    }
    setOrders((current) => [order, ...current])
    return order
  }, [diamondBalance, ownedPremiumCardIds, premiumCardBalances])

  const completeRecharge = useCallback((diamonds: number, amount: number, couponId: string | null) => {
    setDiamondBalance((balance) => balance + diamonds)
    setDiamondTransactions((current) => [{ id: `recharge-${Date.now()}`, title: `钻石充值 · ¥${amount}`, date: new Date().toLocaleString('zh-CN', { hour12: false }), amount: diamonds }, ...current])
    if (couponId) setCoupons((current) => current.map((coupon) => coupon.id === couponId ? { ...coupon, status: '已使用' } : coupon))
  }, [])

  const payGift = useCallback((giftName: string, recipientName: string, amount: number) => {
    if (!Number.isInteger(amount) || amount <= 0 || amount > diamondBalance) return false
    setDiamondBalance((balance) => balance - amount)
    setDiamondTransactions((current) => [{ id: `gift-${Date.now()}`, title: `赠送礼物 · ${giftName}（送给${recipientName}）`, date: new Date().toLocaleString('zh-CN', { hour12: false }), amount: -amount }, ...current])
    return true
  }, [diamondBalance])

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
    exchangeBeans: (amount: number) => {
      if (!Number.isInteger(amount) || amount <= 0 || amount > beanBalance) return false
      const id = `bean-exchange-${Date.now()}`
      const date = new Date().toLocaleString('zh-CN', { hour12: false })
      setBeanBalance((balance) => balance - amount)
      setDiamondBalance((balance) => balance + amount)
      setBeanTransactions((current) => [{ id, title: '兑换钻石', date, amount: -amount }, ...current])
      setDiamondTransactions((current) => [{ id, title: '糖豆兑换', date, amount }, ...current])
      return true
    },
    beanTransactions,
    findOrderService,
    getGameName,
    completePayment,
    completeRecharge,
    payGift,
    pauseOrder,
    renewOrder,
    purchasePremiumCard,
    rechargePremiumCard,
    updateOrderStatus,
  }
}
