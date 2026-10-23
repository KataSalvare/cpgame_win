import { useMemo, useState } from 'react'
import { clubs, companions, games, servicesByCompanion, type Service } from '../data/mockData'

export type MatchGender = '不限' | '男' | '女'
export type MatchPeople = '单陪' | '双陪'

const firstGameId = games.find((game) => game.id !== 'all')?.id ?? games[0].id
const firstClubId = clubs.find((club) => club.gameIds.includes(firstGameId))?.id ?? clubs[0].id
const initialService = companions.filter((companion) => companion.clubId === firstClubId && companion.gameIds.includes(firstGameId))
  .flatMap((companion) => servicesByCompanion[companion.id] ?? [])
  .find((service) => service.gameId === firstGameId)

export function useMatchLogic() {
  const [gameId, setGameId] = useState(firstGameId)
  const [clubId, setClubId] = useState(firstClubId)
  const [tryout, setTryout] = useState(false)
  const [playName, setPlayName] = useState(initialService?.playName ?? '')
  const [levelName, setLevelName] = useState(initialService?.levelName ?? '')
  const [serviceId, setServiceId] = useState(initialService?.id ?? '')
  const [people, setPeople] = useState<MatchPeople>('单陪')
  const [gender, setGender] = useState<MatchGender>('不限')
  const [quantity, setQuantity] = useState(1)
  const [remark, setRemark] = useState('')
  const [addedPrice, setAddedPrice] = useState(0)

  const availableClubs = useMemo(() => clubs.filter((club) => club.gameIds.includes(gameId)), [gameId])
  const availableServices = useMemo(() => {
    const eligibleCompanions = companions.filter((companion) => companion.clubId === clubId && companion.gameIds.includes(gameId))
    const uniqueServices = new Map<string, Service>()
    eligibleCompanions.forEach((companion) => (servicesByCompanion[companion.id] ?? []).forEach((service) => {
      if (service.gameId !== gameId) return
      const key = `${service.gameId}:${service.playName}:${service.levelName}:${service.unit}:${service.price}`
      if (!uniqueServices.has(key)) uniqueServices.set(key, service)
    }))
    return [...uniqueServices.values()]
  }, [clubId, gameId])
  const playOptions = useMemo(() => [...new Set(availableServices.map((service) => service.playName))], [availableServices])
  const levelOptions = useMemo(() => [...new Set(availableServices.filter((service) => !playName || service.playName === playName).map((service) => service.levelName))], [availableServices, playName])
  const serviceOptions = useMemo(() => availableServices.filter((service) => (!playName || service.playName === playName) && (!levelName || service.levelName === levelName)), [availableServices, levelName, playName])
  const selectedService = serviceOptions.find((service) => service.id === serviceId) ?? serviceOptions[0] ?? availableServices[0] ?? null
  const recommendedUnitPrice = selectedService ? selectedService.price * (people === '双陪' ? 2 : 1) : 0

  const chooseGame = (nextGameId: string) => {
    const nextClubId = clubs.find((club) => club.gameIds.includes(nextGameId))?.id ?? ''
    const nextServices = nextClubId ? companions.filter((companion) => companion.clubId === nextClubId && companion.gameIds.includes(nextGameId)).flatMap((companion) => servicesByCompanion[companion.id] ?? []).filter((service) => service.gameId === nextGameId) : []
    setGameId(nextGameId)
    setClubId(nextClubId)
    setPlayName(nextServices[0]?.playName ?? '')
    setLevelName(nextServices[0]?.levelName ?? '')
    setServiceId(nextServices[0]?.id ?? '')
  }
  const chooseClub = (nextClubId: string) => {
    const nextServices = companions.filter((companion) => companion.clubId === nextClubId && companion.gameIds.includes(gameId)).flatMap((companion) => servicesByCompanion[companion.id] ?? []).filter((service) => service.gameId === gameId)
    setClubId(nextClubId)
    setPlayName(nextServices[0]?.playName ?? '')
    setLevelName(nextServices[0]?.levelName ?? '')
    setServiceId(nextServices[0]?.id ?? '')
  }
  const choosePlay = (nextPlayName: string) => {
    const nextLevel = availableServices.find((service) => service.playName === nextPlayName)?.levelName ?? ''
    const nextService = availableServices.find((service) => service.playName === nextPlayName && service.levelName === nextLevel)
    setPlayName(nextPlayName)
    setLevelName(nextLevel)
    setServiceId(nextService?.id ?? '')
  }
  const chooseLevel = (nextLevelName: string) => {
    const nextService = availableServices.find((service) => service.playName === playName && service.levelName === nextLevelName)
    setLevelName(nextLevelName)
    setServiceId(nextService?.id ?? '')
  }

  return {
    gameId, clubId, tryout, playName, levelName, serviceId, people, gender, quantity, remark, addedPrice,
    availableClubs, availableServices, playOptions, levelOptions, serviceOptions, selectedService, recommendedUnitPrice,
    setTryout, setPeople, setGender, setQuantity, setRemark, setAddedPrice,
    chooseGame, chooseClub, choosePlay, chooseLevel, setServiceId,
  }
}
