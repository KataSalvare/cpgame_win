import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Gamepad2, LayoutGrid } from 'lucide-react'
import { games } from '../data/mockData'

type Props = {
  gameId: string
  onSelect: (gameId: string) => void
  label?: string
  includeAll?: boolean
}

export function GameFilter({ gameId, onSelect, label = '游戏筛选', includeAll = true }: Props) {
  const browserRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [allGamesOpen, setAllGamesOpen] = useState(false)
  const choices = includeAll ? games : games.filter((game) => game.id !== 'all')

  useEffect(() => {
    if (!allGamesOpen) return
    const closeWhenOutside = (event: PointerEvent) => {
      if (!browserRef.current?.contains(event.target as Node)) setAllGamesOpen(false)
    }
    document.addEventListener('pointerdown', closeWhenOutside)
    return () => document.removeEventListener('pointerdown', closeWhenOutside)
  }, [allGamesOpen])

  const selectGame = (id: string) => {
    onSelect(id)
    setAllGamesOpen(false)
    requestAnimationFrame(() => {
      const list = listRef.current
      const selected = [...(list?.querySelectorAll<HTMLButtonElement>('[data-game-id]') ?? [])].find((item) => item.dataset.gameId === id)
      if (!list || !selected) return
      const selectedLeft = selected.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft
      list.scrollTo({ left: selectedLeft - (list.clientWidth - selected.offsetWidth) / 2, behavior: 'smooth' })
    })
  }

  return <div ref={browserRef} className="home-game-browser" onKeyDown={(event) => { if (event.key === 'Escape') setAllGamesOpen(false) }}>
    <div ref={listRef} className="home-game-list" role="group" aria-label={label} tabIndex={0}>
      {choices.map((game) => <button key={game.id} data-game-id={game.id} type="button" className={`game-choice${gameId === game.id ? ' is-active' : ''}`} aria-pressed={gameId === game.id} onClick={() => selectGame(game.id)}>
        <span className="game-choice__mark home-game-choice__mark">{game.id === 'all' ? <LayoutGrid size={17} aria-hidden="true" /> : <Gamepad2 size={17} aria-hidden="true" />}<small>{game.shortName}</small></span><span>{game.name}</span>
      </button>)}
    </div>
    <button type="button" className={`home-game-expand${allGamesOpen ? ' is-open' : ''}`} aria-label={allGamesOpen ? '收起全部游戏' : '展开全部游戏'} aria-expanded={allGamesOpen} aria-controls="all-games-popover" onClick={() => setAllGamesOpen((open) => !open)}><ChevronDown size={18} aria-hidden="true" /></button>
    {allGamesOpen && <div id="all-games-popover" className="home-game-popover" role="group" aria-label="全部游戏">
      {choices.map((game) => <button key={game.id} type="button" className={`home-game-popover__option${gameId === game.id ? ' is-active' : ''}`} aria-pressed={gameId === game.id} onClick={() => selectGame(game.id)}>
        <span className="game-choice__mark home-game-choice__mark">{game.id === 'all' ? <LayoutGrid size={17} aria-hidden="true" /> : <Gamepad2 size={17} aria-hidden="true" />}<small>{game.shortName}</small></span><span>{game.name}</span>
      </button>)}
    </div>}
  </div>
}
