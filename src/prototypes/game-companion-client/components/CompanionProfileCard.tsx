import type { ReactNode } from 'react'
import { MessageCircle, Shield, Star, ThumbsUp } from 'lucide-react'
import type { ProfileCardData } from './profileCardData'
import { AvatarMark } from './AvatarMark'

export function CompanionProfileCard({ profile, onChat, className = '' }: { profile: ProfileCardData; onChat?: () => void; className?: string }) {
  return <section className={`client-card companion-profile-card${className ? ` ${className}` : ''}`}>
    <AvatarMark initials={profile.initials} size="lg" />
    <div className="companion-profile-card__body">
      <div className="companion-profile-card__name"><h1>{profile.name}</h1><span className={`client-status${profile.status === '接单中' ? ' is-available' : ''}`}>{profile.status}</span></div>
      <div className="companion-profile-card__facts"><span>{profile.gender}</span><span>{profile.age} 岁</span><span>ID：{profile.userId}</span><span className="rating-mark"><Star size={14} />{profile.rating.toFixed(2)}</span></div>
      <div className="client-tag-row">{profile.tags.map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
      <p>{profile.intro}</p>
    </div>
    <div className="companion-profile-card__actions" aria-label="用户操作入口">
      <ProfileAction icon={<Shield size={15} />} label="拉黑" />
      <ProfileAction icon={<Star size={15} />} label="关注" />
      <ProfileAction icon={<MessageCircle size={15} />} label="聊一聊" onClick={onChat} />
      <ProfileAction icon={<ThumbsUp size={15} />} label="打赏送礼" />
    </div>
  </section>
}

function ProfileAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return <button type="button" className="client-button client-button--secondary client-display-action" onClick={onClick}>{icon}{label}</button>
}
