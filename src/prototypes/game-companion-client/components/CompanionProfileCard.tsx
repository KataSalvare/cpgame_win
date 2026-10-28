import { useState, type ReactNode } from 'react'
import { MessageCircle, Shield, Star, ThumbsUp } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import type { ProfileCardData } from './profileCardData'
import { AvatarMark } from './AvatarMark'
import { VoiceMessageButton } from './VoiceMessageButton'

export function CompanionProfileCard({ profile, onChat, className = '', followed = false, blocked = false, onToggleFollow, onBlock }: { profile: ProfileCardData; onChat?: () => void; className?: string; followed?: boolean; blocked?: boolean; onToggleFollow?: () => void; onBlock?: () => void }) {
  const [blockConfirmationOpen, setBlockConfirmationOpen] = useState(false)
  return <>
  <section className={`client-card companion-profile-card${className ? ` ${className}` : ''}`}>
    <AvatarMark initials={profile.initials} size="lg" />
    <div className="companion-profile-card__body">
      <div className="companion-profile-card__name"><h1>{profile.name}</h1><span className={`client-status${profile.status === '接单中' ? ' is-available' : ''}`}>{profile.status}</span></div>
      <div className="companion-profile-card__facts"><span>{profile.gender}</span><span>{profile.age} 岁</span><span>ID：{profile.userId}</span><span className="rating-mark"><Star size={14} />{profile.rating.toFixed(2)}</span></div>
      {profile.friendCount !== undefined && profile.followingCount !== undefined && profile.followerCount !== undefined && <div className="companion-profile-card__stats" aria-label="社交数据"><span><strong>{profile.friendCount}</strong>朋友</span><span><strong>{profile.followingCount}</strong>关注</span><span><strong>{profile.followerCount}</strong>粉丝</span></div>}
      <div className="client-tag-row">{profile.tags.map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
      <p>{profile.intro}</p>
      {profile.voiceMessage && <VoiceMessageButton message={profile.voiceMessage} label="语音介绍" />}
    </div>
    <div className="companion-profile-card__actions" aria-label="用户操作入口">
      <ProfileAction icon={<Shield size={15} />} label={blocked ? '已拉黑' : '拉黑'} onClick={() => !blocked && setBlockConfirmationOpen(true)} disabled={blocked} />
      <ProfileAction icon={<Star size={15} />} label={followed ? '已关注' : '关注'} onClick={onToggleFollow} aria-pressed={followed} />
      <ProfileAction icon={<MessageCircle size={15} />} label="聊一聊" onClick={onChat} />
      <ProfileAction icon={<ThumbsUp size={15} />} label="打赏送礼" />
    </div>
  </section>
  {blockConfirmationOpen && <DialogPanel overlayId={`companion-block-${profile.userId}`} title="确认拉黑" description={`确定拉黑「${profile.name}」吗？`} onClose={() => setBlockConfirmationOpen(false)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setBlockConfirmationOpen(false)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { onBlock?.(); setBlockConfirmationOpen(false) }}>确认拉黑</button></>}><p className="social-dialog-copy">确认后，该陪玩会标记为已拉黑。</p></DialogPanel>}
  </>
}

function ProfileAction({ icon, label, onClick, disabled = false, ...attributes }: { icon: ReactNode; label: string; onClick?: () => void; disabled?: boolean; 'aria-pressed'?: boolean }) {
  return <button type="button" className="client-button client-button--secondary client-display-action" onClick={onClick} disabled={disabled} {...attributes}>{icon}{label}</button>
}
