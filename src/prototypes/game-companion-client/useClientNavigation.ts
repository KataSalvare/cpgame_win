import { useCallback, useEffect, useState } from 'react'
import { clubs, companions, servicesByCompanion } from './data/mockData'

export type ClientPage = 'system-settings' | 'workbench' | 'home' | 'talents' | 'club-detail' | 'checkout' | 'profile' | 'wallet' | 'orders' | 'messages' | 'voice-room' | 'recharge' | 'coupons' | 'club-cards' | 'my-cards' | 'announcements' | 'club-announcements'

type StorePanel = 'coupons' | 'club-cards' | 'my-cards' | 'diamond-ledger' | 'bean-ledger' | 'bean-withdraw' | 'diamond-recharge' | 'club-groups' | 'club-announcements' | 'club-reviews' | null
type OrderSelectionMode = 'locked' | 'service' | 'cascade'
type RouteSnapshot = { page: ClientPage; clubId: string; companionId: string | null; companionIds: string[]; serviceId: string | null; orderSelectionMode: OrderSelectionMode; returnTo: ClientPage | null; panel: StorePanel; voiceRoomSource: 'personal' | 'club' }

const DEFAULT_CLUB_ID = 'club-001'
const DEFAULT_COMPANION_ID = 'companion-001'
const clientPages: ClientPage[] = ['system-settings', 'workbench', 'home', 'talents', 'club-detail', 'checkout', 'profile', 'wallet', 'orders', 'messages', 'voice-room', 'recharge', 'coupons', 'club-cards', 'my-cards', 'announcements', 'club-announcements']

const readRoute = (entryView: string | undefined): RouteSnapshot => {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const requestedPage = params.get('page')
  const initialView = requestedPage ?? entryView ?? 'home'
  let page: ClientPage = clientPages.includes(initialView as ClientPage)
    ? initialView as ClientPage
    : initialView === 'companion-detail' ? 'club-detail' : 'home'
  const defaultCompanion = companions.find((companion) => companion.id === DEFAULT_COMPANION_ID) ?? companions[0]
  const defaultClubId = initialView === 'companion-detail' ? defaultCompanion.clubId : DEFAULT_CLUB_ID
  const clubId = clubs.some((club) => club.id === params.get('club')) ? params.get('club')! : defaultClubId
  const requestedCompanionId = params.get('companion')
  const requestedCompanion = companions.find((companion) => companion.id === requestedCompanionId && (page === 'talents' || companion.clubId === clubId))
  const requestedCompanionIds = (params.get('companions') ?? '').split(',').filter(Boolean).filter((id) => companions.some((companion) => companion.id === id && (page === 'talents' || companion.clubId === clubId)))
  const initialCompanionId = initialView === 'companion-detail' || initialView === 'checkout' ? DEFAULT_COMPANION_ID : null
  const companionId = requestedCompanionIds[0] ?? requestedCompanion?.id ?? initialCompanionId
  const companionIds = requestedCompanionIds.length ? requestedCompanionIds : companionId ? [companionId] : []
  const defaultServiceId = servicesByCompanion[DEFAULT_COMPANION_ID]?.[0]?.id ?? null
  const requestedReturnTo = params.get('returnTo')
  const returnTo = requestedReturnTo && clientPages.includes(requestedReturnTo as ClientPage) ? requestedReturnTo as ClientPage : null
  let panel: StorePanel = null
  if (page === 'club-cards') { page = 'club-detail'; panel = 'club-cards' }
  if (page === 'coupons' || page === 'my-cards') { panel = page; page = 'wallet' }
  const requestedPanel = params.get('panel')
  if (page === 'club-detail' && requestedPanel === 'club-cards') panel = 'club-cards'
  if (page === 'club-detail' && requestedPanel === 'club-groups') panel = 'club-groups'
  if (page === 'club-detail' && requestedPanel === 'club-announcements') panel = 'club-announcements'
  if (page === 'club-detail' && requestedPanel === 'club-reviews') panel = 'club-reviews'
  if (page === 'wallet' && (requestedPanel === 'coupons' || requestedPanel === 'my-cards' || requestedPanel === 'diamond-ledger' || requestedPanel === 'bean-ledger' || requestedPanel === 'bean-withdraw' || requestedPanel === 'diamond-recharge')) panel = requestedPanel
  const voiceRoomSource = params.get('voiceFrom') === 'club' || (!params.has('voiceFrom') && page === 'voice-room' && params.has('club')) ? 'club' : 'personal'
  const requestedOrderMode = params.get('orderMode')
  const orderSelectionMode = requestedOrderMode === 'cascade' ? 'cascade' : requestedOrderMode === 'locked' || requestedOrderMode === 'fixed' ? 'locked' : 'service'
  return { page, clubId, companionId, companionIds, serviceId: params.get('service') ?? (initialView === 'checkout' ? defaultServiceId : null), orderSelectionMode, returnTo, panel, voiceRoomSource }
}

const writeRoute = (page: ClientPage, clubId: string, companionId: string | null, serviceId?: string | null, returnTo?: ClientPage | null, panel?: StorePanel, companionIds?: string[], voiceRoomSource?: 'personal' | 'club', orderSelectionMode?: OrderSelectionMode) => {
  const params = new URLSearchParams({ page, club: clubId })
  if (companionId) params.set('companion', companionId)
  if (serviceId) params.set('service', serviceId)
  if (returnTo) params.set('returnTo', returnTo)
  if (panel) params.set('panel', panel)
  if (companionIds && companionIds.length > 1) params.set('companions', companionIds.join(','))
  if (page === 'voice-room' && voiceRoomSource) params.set('voiceFrom', voiceRoomSource)
  if (page === 'checkout' && orderSelectionMode) params.set('orderMode', orderSelectionMode)
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
  const openCompanion = useCallback((companionId: string) => {
    const companion = companions.find((item) => item.id === companionId)
    if (!companion) return
    const page = route.page === 'talents' ? 'talents' : 'club-detail'
    writeRoute(page, companion.clubId, companionId)
  }, [route.page])
  const closeCompanion = useCallback(() => writeRoute(route.page === 'talents' ? 'talents' : 'club-detail', route.clubId, null), [route.page, route.clubId])
  const backToClub = closeCompanion
  const goToPage = useCallback((requestedPage: ClientPage, returnTo?: ClientPage) => {
    const page: ClientPage = requestedPage === 'club-cards' ? 'club-detail' : requestedPage === 'coupons' || requestedPage === 'my-cards' ? 'wallet' : requestedPage
    const panel: StorePanel = requestedPage === 'club-cards' || requestedPage === 'coupons' || requestedPage === 'my-cards' ? requestedPage : null
    const serviceId = requestedPage === 'recharge' && returnTo === 'checkout' ? route.serviceId : null
    writeRoute(page, route.clubId, requestedPage === 'talents' ? null : route.companionId, serviceId, returnTo, panel, undefined, page === 'voice-room' ? route.voiceRoomSource : undefined)
  }, [route.clubId, route.companionId, route.serviceId, route.voiceRoomSource])
  const goToVoiceRoom = useCallback((source: 'personal' | 'club' = 'personal') => writeRoute('voice-room', route.clubId, route.companionId, null, null, null, undefined, source), [route.clubId, route.companionId])
  const closePanel = useCallback(() => writeRoute(route.page, route.clubId, route.companionId), [route.page, route.clubId, route.companionId])
  const openWalletLedger = useCallback((wallet: 'diamond' | 'bean') => {
    writeRoute('wallet', route.clubId, route.companionId, null, null, wallet === 'diamond' ? 'diamond-ledger' : 'bean-ledger')
  }, [route.clubId, route.companionId])
  const openBeanWithdraw = useCallback(() => {
    writeRoute('wallet', route.clubId, route.companionId, null, null, 'bean-withdraw')
  }, [route.clubId, route.companionId])
  const openDiamondRecharge = useCallback(() => {
    writeRoute('wallet', route.clubId, route.companionId, null, null, 'diamond-recharge')
  }, [route.clubId, route.companionId])
  const openClubGroups = useCallback(() => writeRoute('club-detail', route.clubId, null, null, null, 'club-groups'), [route.clubId])
  const openClubAnnouncements = useCallback(() => writeRoute('club-detail', route.clubId, null, null, null, 'club-announcements'), [route.clubId])
  const openClubReviews = useCallback(() => writeRoute('club-detail', route.clubId, null, null, null, 'club-reviews'), [route.clubId])
  const beginOrder = useCallback((serviceId: string, companionId: string, orderSelectionMode: OrderSelectionMode = 'service') => {
    const companionClubId = companions.find((item) => item.id === companionId)?.clubId ?? route.clubId
    const companionIds = route.page === 'checkout' && route.companionIds.includes(companionId) ? route.companionIds : undefined
    const returnTo = route.page === 'checkout' ? route.returnTo : route.page === 'talents' ? 'talents' : null
    writeRoute('checkout', companionClubId, companionId, serviceId, returnTo, null, companionIds, undefined, orderSelectionMode)
  }, [route.clubId, route.companionIds, route.page, route.returnTo])
  const beginMatchOrder = useCallback((serviceId: string, companionIds: string[]) => {
    const primaryCompanion = companions.find((item) => item.id === companionIds[0])
    if (!primaryCompanion) return
    writeRoute('checkout', primaryCompanion.clubId, primaryCompanion.id, serviceId, null, null, companionIds, undefined, 'locked')
  }, [])

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
    goToVoiceRoom,
    closePanel,
    openWalletLedger,
    openBeanWithdraw,
    openDiamondRecharge,
    openClubGroups,
    openClubAnnouncements,
    openClubReviews,
    beginOrder,
    beginMatchOrder,
  }
}
