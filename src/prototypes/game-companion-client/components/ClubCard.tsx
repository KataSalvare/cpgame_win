import { ArrowUpRight, Star } from 'lucide-react'
import type { Club, Game } from '../data/mockData'
import { AvatarMark } from './AvatarMark'

export function ClubCard({ club, gamesById, onOpen }: { club: Club; gamesById: Map<string, Game>; onOpen: () => void }) {
  return <article className="client-card club-card">
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
      <div><span className="client-muted">主营游戏</span><span>{club.gameIds.map((id) => gamesById.get(id)?.name).filter(Boolean).join(' · ')}</span></div>
      <span>{club.companionCount} 位陪玩</span>
    </div>
    <button type="button" className="client-button client-button--secondary club-card__open" onClick={onOpen}>
      进入详情 <ArrowUpRight size={15} />
    </button>
  </article>
}
