import { ArrowUpRight, Star } from 'lucide-react'
import type { Companion } from '../data/mockData'
import { AvatarMark } from './AvatarMark'

export function CompanionCard({ companion, onOpen }: { companion: Companion; onOpen: () => void }) {
  return <article className="client-card companion-card">
    <div className="companion-card__heading">
      <AvatarMark initials={companion.initials} size="lg" />
      <div className="companion-card__identity">
        <h3>{companion.name}</h3>
        <span className="client-muted">{companion.gender} · {companion.age} 岁 · {companion.region}</span>
      </div>
      <span className={`client-status ${companion.status === '接单中' ? 'is-available' : ''}`}>{companion.status}</span>
    </div>
    <div className="client-tag-row">{companion.tags.slice(0, 3).map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
    <p className="companion-card__intro">{companion.intro}</p>
    <div className="companion-card__meta">
      <span className="rating-mark"><Star size={14} />{companion.rating.toFixed(2)}</span>
      <span>{companion.orderCount.toLocaleString()} 单</span>
    </div>
    <button type="button" className="client-button client-button--secondary companion-card__open" onClick={onOpen}>
      查看资料 <ArrowUpRight size={15} />
    </button>
  </article>
}
