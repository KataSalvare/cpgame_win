import { useMemo, useState } from 'react'
import type { Companion } from '../data/mockData'
import { companions } from '../data/mockData'

export type CompanionSort = 'recommended' | 'price-asc' | 'price-desc' | 'orders-asc' | 'orders-desc' | 'rating-desc' | 'rating-asc'

export function useCompanionDirectoryLogic(clubId?: string) {
  const [gameId, setGameId] = useState('all')
  const [onlineStatus, setOnlineStatus] = useState('全部在线状态')
  const [status, setStatus] = useState('全部接单状态')
  const [gender, setGender] = useState('全部性别')
  const [region, setRegion] = useState('全部地区')
  const [age, setAge] = useState('全部年龄')
  const [sort, setSort] = useState<CompanionSort>('recommended')

  const visibleCompanions = useMemo(() => {
    const filtered = companions.filter((person) => {
      if (clubId && person.clubId !== clubId) return false
      if (gameId !== 'all' && !person.gameIds.includes(gameId)) return false
      if (onlineStatus !== '全部在线状态' && person.onlineStatus !== onlineStatus) return false
      if (status !== '全部接单状态' && person.status !== status) return false
      if (gender !== '全部性别' && person.gender !== gender) return false
      if (region !== '全部地区' && person.region !== region) return false
      if (age !== '全部年龄' && !matchesAge(person.age, age)) return false
      return true
    })

    const priceFor = (person: Companion) => 80 + Number(person.id.slice(-1)) * 10
    return filtered.sort((a, b) => {
      if (sort === 'rating-asc') return a.rating - b.rating
      if (sort === 'rating-desc') return b.rating - a.rating
      if (sort === 'price-asc') return priceFor(a) - priceFor(b)
      if (sort === 'price-desc') return priceFor(b) - priceFor(a)
      if (sort === 'orders-asc') return a.orderCount - b.orderCount
      if (sort === 'orders-desc') return b.orderCount - a.orderCount
      return b.rating - a.rating
    })
  }, [clubId, gameId, onlineStatus, status, gender, region, age, sort])

  const resetFilters = () => {
    setGameId('all')
    setOnlineStatus('全部在线状态')
    setStatus('全部接单状态')
    setGender('全部性别')
    setRegion('全部地区')
    setAge('全部年龄')
    setSort('recommended')
  }

  return { gameId, setGameId, onlineStatus, setOnlineStatus, status, setStatus, gender, setGender, region, setRegion, age, setAge, sort, setSort, visibleCompanions, resetFilters }
}

export const useClubDetailLogic = useCompanionDirectoryLogic

function matchesAge(value: number, option: string) {
  if (option === '18-25岁') return value >= 18 && value <= 25
  if (option === '26-30岁') return value >= 26 && value <= 30
  if (option === '31-35岁') return value >= 31 && value <= 35
  if (option === '36-40岁') return value >= 36 && value <= 40
  if (option === '40岁以上') return value >= 40
  return true
}
