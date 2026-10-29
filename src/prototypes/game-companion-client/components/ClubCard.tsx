import { Compass, Gamepad2, Star } from 'lucide-react'
import type { Club, Game } from '../data/mockData'
import { AvatarMark } from './AvatarMark'

type ClubCardProps = { club: Club; gamesById: Map<string, Game>; onOpen: () => void; onBrowse: () => void; onSelfOrder: () => void; showActions?: boolean }

export function ClubCard({ club, gamesById, onOpen, onBrowse, onSelfOrder, showActions = true }: ClubCardProps) {
  const clubGames = club.gameIds.map((id) => gamesById.get(id)).filter((game): game is Game => Boolean(game))
  return <article
    className="client-card club-card"
    tabIndex={0}
    aria-label={`查看${club.name}详情`}
    onClick={onOpen}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
      event.preventDefault()
      onOpen()
    }}
  >
    <div className="club-card__heading">
      <AvatarMark initials={club.initials} size="lg" />
      <div className="club-card__identity">
        <div className="club-card__name-row"><h3>{club.name}</h3>{club.selfOperated && <span className="client-badge">自营</span>}</div>
        <span className="client-muted">ID：{club.id.replace('club-', 'C-')}</span>
      </div>
      <span className="rating-mark"><Star size={14} />{club.rating.toFixed(2)}</span>
    </div>
    <div className="client-tag-row">{club.tags.map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
    <p className="club-card__intro">{club.intro}</p>
    <div className="club-card__meta">
      <div><span className="client-muted">主营游戏</span><span className="club-card__game-list" aria-label={`主营游戏：${clubGames.map((game) => game.name).join('、')}`}>{clubGames.map((game) => <span className="club-card__game" key={game.id} title={game.name}><Gamepad2 size={12} aria-hidden="true" /><span>{game.shortName}</span></span>)}</span></div>
      <span>{club.companionCount} 位陪玩</span>
    </div>
    {showActions && <div className="club-card__actions">
      <button type="button" className="client-button client-button--secondary" onClick={(event) => { event.stopPropagation(); onBrowse() }}><Compass size={15} />逛一逛</button>
      <button type="button" className="client-button client-button--secondary" onClick={(event) => { event.stopPropagation(); onSelfOrder() }}>自助下单</button>
    </div>}
  </article>
}
