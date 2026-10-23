import { useCallback, useEffect, useState } from 'react'
import { clubs, companions, servicesByCompanion } from './data/mockData'

export type ClientPage = 'home' | 'club-detail' | 'checkout' | 'profile' | 'wallet' | 'orders' | 'messages' | 'voice-room'

type RouteSnapshot = { page: ClientPage; clubId: string; companionId: string | null; serviceId: string | null }

const DEFAULT_CLUB_ID = 'club-001'
const DEFAULT_COMPANION_ID = 'companion-001'
const clientPages: ClientPage[] = ['home', 'club-detail', 'checkout', 'profile', 'wallet', 'orders', 'messages', 'voice-room']

const readRoute = (entryView: string | undefined): RouteSnapshot => {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const requestedPage = params.get('page')
  const initialView = requestedPage ?? entryView ?? 'home'
  const page: ClientPage = clientPages.includes(initialView as ClientPage)
    ? initialView as ClientPage
    : initialView === 'companion-detail' ? 'club-detail' : 'home'
  const defaultCompanion = companions.find((companion) => companion.id === DEFAULT_COMPANION_ID) ?? companions[0]
  const defaultClubId = initialView === 'companion-detail' ? defaultCompanion.clubId : DEFAULT_CLUB_ID
  const clubId = clubs.some((club) => club.id === params.get('club')) ? params.get('club')! : defaultClubId
  const requestedCompanionId = params.get('companion')
  const requestedCompanion = companions.find((companion) => companion.id === requestedCompanionId && companion.clubId === clubId)
  const initialCompanionId = initialView === 'companion-detail' || initialView === 'checkout' ? DEFAULT_COMPANION_ID : null
  const companionId = requestedCompanion?.id ?? initialCompanionId
  const defaultServiceId = servicesByCompanion[DEFAULT_COMPANION_ID]?.[0]?.id ?? null
  return { page, clubId, companionId, serviceId: params.get('service') ?? (initialView === 'checkout' ? defaultServiceId : null) }
}

const writeRoute = (page: ClientPage, clubId: string, companionId: string | null, serviceId?: string | null) => {
  const params = new URLSearchParams({ page, club: clubId })
  if (companionId) params.set('companion', companionId)
  if (serviceId) params.set('service', serviceId)
  window.location.hash = params.toString()
}

export function useClientNavigation(entryView?: string) {
  const [route, setRoute] = useState<RouteSnapshot>(() => readRoute(entryView))

  useEffect(() => {
    const syncRoute = () => setRoute(readRoute(entryView))
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [entryView])

  const goHome = useCallback(() => writeRoute('home', route.clubId, null), [route.clubId])
  const openClub = useCallback((clubId: string) => writeRoute('club-detail', clubId, route.companionId), [route.companionId])
  const openCompanion = useCallback((companionId: string) => writeRoute('club-detail', route.clubId, companionId), [route.clubId])
  const closeCompanion = useCallback(() => writeRoute('club-detail', route.clubId, null), [route.clubId])
  const backToClub = closeCompanion
  const goToPage = useCallback((page: ClientPage) => writeRoute(page, route.clubId, route.companionId), [route.clubId, route.companionId])
  const beginOrder = useCallback((serviceId: string, companionId: string) => writeRoute('checkout', route.clubId, companionId, serviceId), [route.clubId])

  return {
    ...route,
    club: clubs.find((club) => club.id === route.clubId) ?? clubs[0],
    companion: route.companionId ? companions.find((companion) => companion.id === route.companionId) ?? null : null,
    goHome,
    openClub,
    openCompanion,
    backToClub,
    closeCompanion,
    goToPage,
    beginOrder,
  }
}
