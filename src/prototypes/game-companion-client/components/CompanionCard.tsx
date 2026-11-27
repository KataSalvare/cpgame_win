import { GenderAgeBadge } from './GenderAgeBadge'
import { Star } from 'lucide-react'
import type { Companion } from '../data/mockData'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'
import { VoiceMessageButton } from './VoiceMessageButton'

type CompanionCardProps = {
  companion: Companion
  onOpen: () => void
  onChat: () => void
}

export function CompanionCard({ companion, onOpen, onChat }: CompanionCardProps) {
  return <article
    className="client-card companion-card companion-card--hero"
    data-companion-id={companion.id}
    tabIndex={0}
    aria-label={`查看${companion.name}详情`}
    onClick={onOpen}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
      event.preventDefault()
      onOpen()
    }}
  >
    <div className="companion-card__visual">
      <AvatarMark initials={companion.initials} size="lg" />
      <span className="client-status companion-card__visual-status" data-person-status={companion.status}>{companion.status}</span>
      {companion.voiceMessage && <VoiceMessageButton message={companion.voiceMessage} label="语音介绍" compact />}
    </div>
    <div className="companion-card__body">
      <div className="companion-card__heading">
        <div className="companion-card__identity">
          <div className="companion-card__name-row">
            <h3><UserNameWithLevel name={companion.name} identityId={companion.id} /></h3>
            <GenderAgeBadge gender={companion.gender} age={companion.age} />
          </div>
        </div>
      </div>
      <div className="client-tag-row">{companion.tags.slice(0, 3).map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
      <p className="companion-card__intro">{companion.intro}</p>
      <div className="companion-card__meta">
        <div className="companion-card__metrics">
          <span className="rating-mark"><Star size={14} />{companion.rating.toFixed(2)}</span>
          <span>{companion.orderCount.toLocaleString()} 单</span>
        </div>
        <button type="button" className="companion-card__chat" onClick={(event) => { event.stopPropagation(); onChat() }}>
          聊一聊
        </button>
      </div>
    </div>
  </article>
}
