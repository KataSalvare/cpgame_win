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

export function useAccountLogic() {
  const [diamondBalance, setDiamondBalance] = useState(initialDiamondBalance)
  const [beanBalance] = useState(initialBeanBalance)
  const [orders, setOrders] = useState(initialOrders)
  const [diamondTransactions, setDiamondTransactions] = useState(walletEntries.diamonds)

  const findOrderService = useCallback((companionId: string | null, serviceId: string | null): { companion: Companion; service: Service } | null => {
    if (!companionId || !serviceId) return null
    const companion = companions.find((item) => item.id === companionId)
    const service = servicesByCompanion[companionId]?.find((item) => item.id === serviceId)
    return companion && service ? { companion, service } : null
  }, [])

  const getGameName = useCallback((gameId: string) => games.find((game) => game.id === gameId)?.name ?? '游戏服务', [])

  const completePayment = useCallback((service: Service, companion: Companion, gameName: string, durationHours: number, amount: number): ClientOrder | null => {
    if (amount > diamondBalance) return null
    const order = makeClientOrder(service, companion, gameName, durationHours, amount)
    setDiamondBalance((balance) => balance - amount)
    setOrders((current) => [order, ...current])
    setDiamondTransactions((current) => [{ id: order.id, title: `订单消费 · ${service.playName}`, date: order.createdAt, amount: -amount }, ...current])
    return order
  }, [diamondBalance])

  return {
    diamondBalance,
    beanBalance,
    orders,
    diamondTransactions,
    beanTransactions: walletEntries.beans,
    findOrderService,
    getGameName,
    completePayment,
  }
}
