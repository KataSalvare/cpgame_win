import { useMemo, useState } from 'react'
import { clubs } from '../data/mockData'

export type HomeScope = 'featured' | 'followed'

export function useHomeLogic(followedClubIds?: string[]) {
  const [gameId, setGameId] = useState('all')
  const [scope, setScope] = useState<HomeScope>('featured')
  const [tag, setTag] = useState<string | null>(null)

  const setTagScope = (nextTag: string | null) => setTag(nextTag)

  const visibleClubs = useMemo(() => clubs.filter((club) => {
    const matchesGame = gameId === 'all' || club.gameIds.includes(gameId)
    const matchesScope = scope === 'featured'
      ? club.featured
      : followedClubIds ? followedClubIds.includes(club.id) : club.followed
    const matchesTag = !tag || club.tags.includes(tag)
    return matchesGame && matchesScope && matchesTag
  }), [gameId, scope, tag, followedClubIds])

  const resetFilters = () => {
    setGameId('all')
    setScope('featured')
    setTag(null)
  }

  return { gameId, setGameId, scope, setScope, tag, setTagScope, visibleClubs, resetFilters }
}
