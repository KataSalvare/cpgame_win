import { useMemo, useState } from 'react'
import { servicesByCompanion } from '../data/mockData'

export const SERVICES_PER_PAGE = 20

export function useCompanionDetailLogic(companionId: string) {
  const [gameId, setGameId] = useState('all')
  const [page, setPage] = useState(1)
  const filteredServices = useMemo(() => {
    const services = servicesByCompanion[companionId] ?? []
    return gameId === 'all' ? services : services.filter((service) => service.gameId === gameId)
  }, [companionId, gameId])
  const pageCount = Math.max(1, Math.ceil(filteredServices.length / SERVICES_PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const pageServices = filteredServices.slice((safePage - 1) * SERVICES_PER_PAGE, safePage * SERVICES_PER_PAGE)

  const selectGame = (nextGameId: string) => {
    setGameId(nextGameId)
    setPage(1)
  }

  return { gameId, selectGame, page: safePage, setPage, pageCount, pageServices, totalServices: filteredServices.length }
}
