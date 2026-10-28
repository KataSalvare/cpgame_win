import type { ReactNode } from 'react'
import { ArrowLeft, Bell, Headphones, MessageCircle, ShieldCheck, Star, UsersRound } from 'lucide-react'
import type { Club } from '../data/mockData'
import { AvatarMark } from '../components/AvatarMark'
import { CompanionDirectory } from '../components/CompanionDirectory'
import { PageStatePanel } from '../components/PageStatePanel'
import { PromotionBanner } from '../components/PromotionBanner'

type Props = {
  club: Club
  pageState: 'normal' | 'loading' | 'empty' | 'error'
  onBack: () => void
  onOpenCompanion: (companionId: string) => void
  onChatWithCompanion: (companionId: string) => void
  onOrderWithCompanion: (companionId: string) => void
  onOpenVoiceRoom: () => void
  onOpenClubGroups: () => void
  onOpenMatch: () => void
  onOpenPremiumCards: () => void
  onOpenAnnouncements: () => void
  onRetry: () => void
}

export function ClubDetailPage({ club, pageState, onBack, onOpenCompanion, onChatWithCompanion, onOrderWithCompanion, onOpenVoiceRoom, onOpenClubGroups, onOpenMatch, onOpenPremiumCards, onOpenAnnouncements, onRetry }: Props) {
  if (pageState !== 'normal') {
    return <div className="client-content client-content--narrow-state">
      <button type="button" className="client-back-link" onClick={onBack} aria-label="返回首页"><ArrowLeft size={16} /> 首页</button>
      <PageStatePanel
        state={pageState}
        title={pageState === 'empty' ? '暂时没有陪玩成员' : '俱乐部内容暂不可用'}
        description={pageState === 'error' ? '俱乐部信息暂时无法加载，请重试。' : '当前条件下没有符合的成员，清除筛选后再看看。'}
        actionLabel={pageState === 'error' ? '重新加载' : '返回首页'}
        onAction={pageState === 'error' ? onRetry : onBack}
      />
    </div>
  }

  return <div className="client-content club-detail-page">
    <button type="button" className="client-back-link" onClick={onBack} aria-label="返回首页"><ArrowLeft size={16} /> 首页</button>
    <PromotionBanner />
    <section className="client-card club-profile-card">
      <div className="club-profile-card__main">
        <AvatarMark initials={club.initials} size="lg" />
        <div className="club-profile-card__body">
          <div className="club-card__name-row"><h1>{club.name}</h1>{club.selfOperated && <span className="client-badge"><ShieldCheck size={13} /> 自营</span>}</div>
          <div className="club-profile-card__subline"><span>ID：{club.id.replace('club-', 'C-')}</span><span className="rating-mark"><Star size={14} />{club.rating.toFixed(2)}</span><span className="client-inline-meta"><UsersRound size={14} />{club.companionCount} 位陪玩</span></div>
          <div className="client-tag-row">{club.tags.map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
          <p>{club.intro}</p>
        </div>
      </div>
      <div className="club-profile-card__actions" role="group" aria-label="俱乐部操作">
        <DisplayAction icon={<UsersRound size={15} />} label="接待大厅" onClick={onOpenVoiceRoom} />
        <DisplayAction icon={<Star size={15} />} label="价目表" />
        <DisplayAction icon={<ShieldCheck size={15} />} label="尊享卡" onClick={onOpenPremiumCards} />
        <DisplayAction icon={<Headphones size={15} />} label="客服" />
        <DisplayAction icon={<UsersRound size={15} />} label="自助下单" onClick={onOpenMatch} variant="primary" />
        <DisplayAction icon={<Star size={15} />} label="优惠券" />
        <DisplayAction icon={<MessageCircle size={15} />} label="群聊" onClick={onOpenClubGroups} />
        <DisplayAction icon={<Bell size={15} />} label="俱乐部公告" onClick={onOpenAnnouncements} />
      </div>
    </section>

    <CompanionDirectory clubId={club.id} pageState="normal" onRetry={onRetry} onOpenCompanion={onOpenCompanion} onChatWithCompanion={onChatWithCompanion} onOrderWithCompanion={onOrderWithCompanion} />
  </div>
}

function DisplayAction({ icon, label, onClick, disabled = false, variant = 'secondary' }: { icon: ReactNode; label: string; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' }) {
  return <button type="button" className={`client-button client-button--${variant} client-display-action`} onClick={onClick} disabled={disabled}>{icon}{label}</button>
}
