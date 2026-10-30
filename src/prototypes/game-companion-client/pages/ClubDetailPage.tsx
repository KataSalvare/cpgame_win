import { useState, type ReactNode } from 'react'
import { ArrowLeft, Bell, Headphones, MessageCircle, ShieldCheck, ShoppingCart, Star, UsersRound } from 'lucide-react'
import type { Club } from '../data/mockData'
import type { ClientOrder } from '../data/accountMockData'
import { AvatarMark } from '../components/AvatarMark'
import { FollowIconButton } from '../components/FollowIconButton'
import { ClubInfoDialog, ClubMoreActions, type ClubInfoTab } from '../components/ClubMoreActions'
import { CompanionDirectory } from '../components/CompanionDirectory'
import { PageStatePanel } from '../components/PageStatePanel'
import { PromotionBanner } from '../components/PromotionBanner'
import type { useSocialLogic } from '../hooks/useSocialLogic'
import { ClubSupportChatPanel, ClubSupportSelectionDialog } from './SocialPages'

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
  onOpenClubReviews: () => void
  social: ReturnType<typeof useSocialLogic>
  orders: ClientOrder[]
  onRetry: () => void
}

export function ClubDetailPage({ club, pageState, onBack, onOpenCompanion, onChatWithCompanion, onOrderWithCompanion, onOpenVoiceRoom, onOpenClubGroups, onOpenMatch, onOpenPremiumCards, onOpenAnnouncements, onOpenClubReviews, social, orders, onRetry }: Props) {
  const [supportChatOpen, setSupportChatOpen] = useState(false)
  const [supportSelectionOpen, setSupportSelectionOpen] = useState(false)
  const [clubInfoTab, setClubInfoTab] = useState<ClubInfoTab | null>(null)
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
          <div className="club-profile-card__subline"><span>ID：{club.id.replace('club-', 'C-')}</span><span className="client-inline-meta"><UsersRound size={14} />{club.companionCount} 位陪玩</span><button type="button" className="rating-mark club-profile-rating-button" onClick={onOpenClubReviews} aria-label={`查看俱乐部评价，评分 ${club.rating.toFixed(2)}`}><Star size={14} />{club.rating.toFixed(2)}</button></div>
          <div className="client-tag-row">{club.tags.map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
          <p>{club.intro}</p>
        </div>
        <div className="club-profile-card__tools"><FollowIconButton followed={social.followedClubIds.includes(club.id)} name={club.name} onToggle={() => social.toggleClubFollow(club.id)} /><ClubMoreActions club={club} followed={social.followedClubIds.includes(club.id)} onToggleFollow={() => social.toggleClubFollow(club.id)} onOpenInfo={setClubInfoTab} /></div>
      </div>
      <div className="club-profile-card__actions" role="group" aria-label="俱乐部操作">
        <div className="club-profile-card__primary-actions" role="group" aria-label="主要操作">
        <DisplayAction icon={<UsersRound size={17} />} label="接待大厅" onClick={onOpenVoiceRoom} variant="primary" />
        <DisplayAction icon={<ShoppingCart size={17} />} label="自助下单" onClick={onOpenMatch} variant="primary" />
        </div>
        <div className="club-profile-card__secondary-actions" role="group" aria-label="俱乐部服务">
        <DisplayAction icon={<Headphones size={15} />} label="客服" onClick={() => setSupportSelectionOpen(true)} />
        <DisplayAction icon={<ShieldCheck size={15} />} label="尊享卡" onClick={onOpenPremiumCards} />
        <DisplayAction icon={<Star size={15} />} label="价目表" onClick={() => setClubInfoTab('pricing')} />
        </div>
        <div className="club-profile-card__community-actions" role="group" aria-label="俱乐部动态">
        <DisplayAction icon={<Bell size={15} />} label="俱乐部公告" onClick={onOpenAnnouncements} />
        <DisplayAction icon={<MessageCircle size={15} />} label="群聊" onClick={onOpenClubGroups} />
        </div>
      </div>
    </section>

    <CompanionDirectory clubId={club.id} pageState="normal" onRetry={onRetry} onOpenCompanion={onOpenCompanion} onChatWithCompanion={onChatWithCompanion} onOrderWithCompanion={onOrderWithCompanion} />
    {clubInfoTab && <ClubInfoDialog key={`${club.id}-${clubInfoTab}`} club={club} initialTab={clubInfoTab} onClose={() => setClubInfoTab(null)} />}
    {supportSelectionOpen && <ClubSupportSelectionDialog onClose={() => setSupportSelectionOpen(false)} onConsult={() => { social.markConversationRead('direct-club-support'); setSupportChatOpen(true) }} />}
    {supportChatOpen && <ClubSupportChatPanel conversation={social.conversations.find((item) => item.id === 'direct-club-support')} orders={orders} onClose={() => setSupportChatOpen(false)} onSend={(kind, content, duration, replyTo) => social.sendChatMessageToConversation('direct-club-support', kind, content, duration, replyTo)} onSendOrder={(order) => social.sendSupportCardToConversation('direct-club-support', order)} onReview={(messageId, rating, submitted) => social.updateSupportReviewInConversation('direct-club-support', messageId, rating, submitted)} />}
  </div>
}

function DisplayAction({ icon, label, onClick, disabled = false, variant = 'secondary' }: { icon: ReactNode; label: string; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' }) {
  return <button type="button" className={`client-button client-button--${variant} client-display-action`} onClick={onClick} disabled={disabled}>{icon}{label}</button>
}
