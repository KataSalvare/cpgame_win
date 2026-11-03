import { Compass, Star, UsersRound } from 'lucide-react'
import type { Club } from '../data/mockData'
import { AvatarMark } from './AvatarMark'

type ClubCardProps = { club: Club; onOpen: () => void; onBrowse: () => void; onSelfOrder: () => void; showActions?: boolean; layout?: 'default' | 'gallery' }

export function ClubCard({ club, onOpen, onBrowse, onSelfOrder, showActions = true, layout = 'default' }: ClubCardProps) {
  const isGallery = layout === 'gallery'
  return <article
    className={`client-card club-card${isGallery ? ' club-card--gallery' : ''}`}
    tabIndex={0}
    aria-label={`查看${club.name}详情`}
    onClick={onOpen}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
      event.preventDefault()
      onOpen()
    }}
  >
    {isGallery && <div className="club-card__visual" aria-hidden="true">
      <AvatarMark initials={club.initials} size="lg" />
    </div>}
    {isGallery && <span className="club-card__visual-rating"><Star size={13} aria-hidden="true" />{club.rating.toFixed(1)}</span>}
    <div className="club-card__body">
      <div className="club-card__heading">
        {!isGallery && <AvatarMark initials={club.initials} size="lg" />}
        <div className="club-card__identity">
          <div className="club-card__name-row"><h3>{club.name}</h3>{club.selfOperated && <span className="client-badge">自营</span>}</div>
          <div className="club-card__details-line">
            <span className="client-muted">ID：{club.id.replace('club-', 'C-')}</span>
            <span className="club-card__count" aria-label={`${club.companionCount} 位陪玩`}><UsersRound size={13} aria-hidden="true" />{club.companionCount}</span>
          </div>
        </div>
        {!isGallery && <span className="rating-mark"><Star size={14} />{club.rating.toFixed(1)}</span>}
      </div>
      <div className="client-tag-row">{club.tags.map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
      <p className="club-card__intro">{club.intro}</p>
      {showActions && <div className="club-card__actions">
        <button type="button" className="client-button client-button--secondary" onClick={(event) => { event.stopPropagation(); onBrowse() }}><Compass size={15} />逛一逛</button>
        <button type="button" className="client-button client-button--secondary" onClick={(event) => { event.stopPropagation(); onSelfOrder() }}>自助下单</button>
      </div>}
    </div>
  </article>
}
