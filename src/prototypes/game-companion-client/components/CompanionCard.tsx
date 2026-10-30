import { MessageCircle, Star } from 'lucide-react'
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
    className="client-card companion-card"
    tabIndex={0}
    aria-label={`查看${companion.name}详情`}
    onClick={onOpen}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
      event.preventDefault()
      onOpen()
    }}
  >
    <div className="companion-card__heading">
      <AvatarMark initials={companion.initials} size="lg" />
      <div className="companion-card__identity">
        <h3><UserNameWithLevel name={companion.name} identityId={companion.id} /></h3>
        <span className="client-muted">{companion.gender} · {companion.age} 岁 · {companion.region}</span>
      </div>
      <div className="companion-card__controls">
        <span className={`client-status ${companion.status === '接单中' ? 'is-available' : ''}`}>{companion.status}</span>
      </div>
    </div>
    <div className="client-tag-row">{companion.tags.slice(0, 3).map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
    <p className="companion-card__intro">{companion.intro}</p>
    {companion.voiceMessage && <VoiceMessageButton message={companion.voiceMessage} label="语音介绍" compact />}
    <div className="companion-card__meta">
      <div className="companion-card__metrics">
        <span className="rating-mark"><Star size={14} />{companion.rating.toFixed(2)}</span>
        <span>{companion.orderCount.toLocaleString()} 单</span>
      </div>
      <button type="button" className="companion-card__chat" onClick={(event) => { event.stopPropagation(); onChat() }}>
        <MessageCircle size={14} />聊一聊
      </button>
    </div>
  </article>
}
