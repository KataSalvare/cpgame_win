import { useMemo, useState } from 'react'
import { clubs, companions, games, servicesByCompanion, type Service } from '../data/mockData'
import { quickMatchClubs, quickMatchCompanions, quickMatchServicesByCompanion } from '../data/quickMatchMockData'

export type MatchGender = '不限' | '男' | '女'
export type MatchPeople = '单陪' | '双陪' | '选项数量后台配置'

const firstGameId = games.find((game) => game.id !== 'all')?.id ?? games[0].id
const matchClubs = [...clubs, ...quickMatchClubs]
const matchCompanions = [...companions, ...quickMatchCompanions]
const firstClubId = matchClubs.find((club) => club.gameIds.includes(firstGameId))?.id ?? clubs[0].id
export function useMatchLogic() {
  const [gameId, setGameId] = useState(firstGameId)
  const [clubId, setClubId] = useState(firstClubId)
  const [tryout, setTryout] = useState(false)
  const [playName, setPlayName] = useState('')
  const [levelName, setLevelName] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [people, setPeople] = useState<MatchPeople>('单陪')
  const [gender, setGender] = useState<MatchGender>('不限')
  const [quantity, setQuantity] = useState(1)
  const [remark, setRemark] = useState('')
  const [addedPrice, setAddedPrice] = useState(0)

  const availableClubs = useMemo(() => matchClubs.filter((club) => club.gameIds.includes(gameId)), [gameId])
  const availableServices = useMemo(() => {
    const eligibleCompanions = matchCompanions.filter((companion) => companion.clubId === clubId && companion.gameIds.includes(gameId))
    const uniqueServices = new Map<string, Service>()
    eligibleCompanions.forEach((companion) => ([...(servicesByCompanion[companion.id] ?? []), ...(quickMatchServicesByCompanion[companion.id] ?? [])]).forEach((service) => {
      if (service.gameId !== gameId) return
      const key = `${service.gameId}:${service.playName}:${service.levelName}:${service.unit}:${service.price}`
      if (!uniqueServices.has(key)) uniqueServices.set(key, service)
    }))
    return [...uniqueServices.values()]
  }, [clubId, gameId])
  const playOptions = useMemo(() => [...new Set(availableServices.map((service) => service.playName))], [availableServices])
  const levelOptions = useMemo(() => playName ? [...new Set(availableServices.filter((service) => service.playName === playName).map((service) => service.levelName))] : [], [availableServices, playName])
  const serviceOptions = useMemo(() => playName && levelName ? availableServices.filter((service) => service.playName === playName && service.levelName === levelName) : [], [availableServices, levelName, playName])
  const selectedService = serviceOptions.find((service) => service.id === serviceId) ?? null
  const peopleCount = people === '双陪' ? 2 : people === '选项数量后台配置' ? 3 : 1
  const genderUnitPrice = gender === '女' ? 100 : 80
  const recommendedUnitPrice = selectedService ? genderUnitPrice * peopleCount : 0
  const recommendedUnitPriceLabel = !selectedService ? '0' : gender === '不限'
    ? `${80 * peopleCount}–${100 * peopleCount}`
    : (genderUnitPrice * peopleCount).toLocaleString()

  const chooseGame = (nextGameId: string) => {
    const nextClubId = matchClubs.find((club) => club.gameIds.includes(nextGameId))?.id ?? ''
    setGameId(nextGameId)
    setClubId(nextClubId)
    setPlayName('')
    setLevelName('')
    setServiceId('')
  }
  const chooseClub = (nextClubId: string) => {
    const nextClub = matchClubs.find((club) => club.id === nextClubId)
    if (!nextClub) return
    const nextGameId = nextClub.gameIds.includes(gameId) ? gameId : nextClub.gameIds[0] ?? firstGameId
    setGameId(nextGameId)
    setClubId(nextClubId)
    setPlayName('')
    setLevelName('')
    setServiceId('')
  }
  const choosePlay = (nextPlayName: string) => {
    setPlayName(nextPlayName)
    setLevelName('')
    setServiceId('')
  }
  const chooseLevel = (nextLevelName: string) => {
    setLevelName(nextLevelName)
    setServiceId('')
  }

  return {
    gameId, clubId, tryout, playName, levelName, serviceId, people, gender, quantity, remark, addedPrice,
    availableClubs, availableServices, playOptions, levelOptions, serviceOptions, selectedService, peopleCount, recommendedUnitPrice, recommendedUnitPriceLabel,
    setTryout, setPeople, setGender, setQuantity, setRemark, setAddedPrice,
    chooseGame, chooseClub, choosePlay, chooseLevel, setServiceId,
  }
}
