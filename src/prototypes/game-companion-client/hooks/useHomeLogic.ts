import { useMemo, useState } from 'react'
import { clubTags, clubs } from '../data/mockData'

export type HomeScope = 'featured' | 'followed' | 'tag'

export function useHomeLogic() {
  const [gameId, setGameId] = useState('all')
  const [scope, setScope] = useState<HomeScope>('featured')
  const [tag, setTag] = useState(clubTags[0])

  const setTagScope = (nextTag: string) => {
    setTag(nextTag)
    setScope('tag')
  }

  const visibleClubs = useMemo(() => clubs.filter((club) => {
    const matchesGame = gameId === 'all' || club.gameIds.includes(gameId)
    const matchesScope = scope === 'featured'
      ? club.featured
      : scope === 'followed'
        ? club.followed
        : club.tags.includes(tag)
    return matchesGame && matchesScope
  }), [gameId, scope, tag])

  const resetFilters = () => {
    setGameId('all')
    setScope('featured')
  }

  return { gameId, setGameId, scope, setScope, tag, setTagScope, visibleClubs, resetFilters }
}
