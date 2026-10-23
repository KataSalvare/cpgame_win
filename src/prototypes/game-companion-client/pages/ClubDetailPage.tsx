import type { ReactNode } from 'react'
import { ArrowLeft, Headphones, MessageCircle, ShieldCheck, Star, UsersRound } from 'lucide-react'
import type { Club } from '../data/mockData'
import { games, regions } from '../data/mockData'
import { useClubDetailLogic } from '../hooks/useClubDetailLogic'
import { AvatarMark } from '../components/AvatarMark'
import { CompanionCard } from '../components/CompanionCard'
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
  onOpenPremiumCards: () => void
  onRetry: () => void
}

const ages = ['全部年龄', '18-25岁', '26-30岁', '31-35岁', '36-40岁', '41岁及以上']
const sortLabels: Record<string, string> = {
  recommended: '综合排序',
  'price-asc': '价格从低到高',
  'price-desc': '价格从高到低',
  'orders-asc': '单数从低到高',
  'orders-desc': '单数从高到低',
}

export function ClubDetailPage({ club, pageState, onBack, onOpenCompanion, onChatWithCompanion, onOrderWithCompanion, onOpenVoiceRoom, onOpenClubGroups, onOpenPremiumCards, onRetry }: Props) {
  const logic = useClubDetailLogic(club.id)

  if (pageState !== 'normal') {
    return <div className="client-content client-content--narrow-state">
      <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={16} /> 返回俱乐部</button>
      <PageStatePanel
        state={pageState}
        title={pageState === 'empty' ? '暂时没有陪玩成员' : '俱乐部内容暂不可用'}
        description={pageState === 'error' ? '俱乐部信息暂时无法加载，请重试。' : '当前条件下没有符合的成员，清除筛选后再看看。'}
        actionLabel={pageState === 'error' ? '重新加载' : '清除筛选'}
        onAction={pageState === 'error' ? onRetry : logic.resetFilters}
      />
    </div>
  }

  return <div className="client-content club-detail-page">
    <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={16} /> 首页 <span>/</span> 俱乐部详情</button>
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
      <div className="club-profile-card__actions" aria-label="俱乐部操作入口">
        <DisplayAction icon={<UsersRound size={15} />} label="接待大厅" onClick={onOpenVoiceRoom} />
        <DisplayAction icon={<Star size={15} />} label="价目表" />
        <DisplayAction icon={<ShieldCheck size={15} />} label="尊享卡" onClick={onOpenPremiumCards} />
        <DisplayAction icon={<Headphones size={15} />} label="客服" />
        <DisplayAction icon={<UsersRound size={15} />} label="自助下单" disabled />
        <DisplayAction icon={<Star size={15} />} label="优惠券" />
        <DisplayAction icon={<MessageCircle size={15} />} label="群聊" onClick={onOpenClubGroups} />
      </div>
    </section>

    <section className="club-members-section" aria-labelledby="club-members-title">
      <div className="client-section-heading club-members-section__heading"><div><span className="client-eyebrow">认识俱乐部成员</span><h2 id="club-members-title">陪玩成员</h2></div><span className="client-count">{logic.visibleCompanions.length} 位成员</span></div>
      <div className="club-game-filter" role="group" aria-label="游戏筛选">
        <span className="client-eyebrow">游戏</span>
        <div className="home-game-list club-game-list">
          {games.map((game) => <button key={game.id} type="button" className={`game-choice${logic.gameId === game.id ? ' is-active' : ''}`} aria-pressed={logic.gameId === game.id} onClick={() => logic.setGameId(game.id)}>
            <span className="game-choice__mark">{game.shortName}</span><span>{game.name}</span>
          </button>)}
        </div>
      </div>
      <div className="club-filter-panel">
        <FilterSelect label="接单状态" value={logic.status} onChange={logic.setStatus} options={['全部状态', '接单中', '服务中', '暂不接单'].map((value) => ({ value, label: value }))} />
        <FilterSelect label="性别" value={logic.gender} onChange={logic.setGender} options={['全部性别', '女', '男'].map((value) => ({ value, label: value }))} />
        <FilterSelect label="地区" value={logic.region} onChange={logic.setRegion} options={['全部地区', ...regions].map((value) => ({ value, label: value }))} />
        <FilterSelect label="年龄" value={logic.age} onChange={logic.setAge} options={ages.map((value) => ({ value, label: value }))} />
        <FilterSelect label="排序" value={logic.sort} onChange={(value) => logic.setSort(value as typeof logic.sort)} options={Object.entries(sortLabels).map(([value, label]) => ({ value, label }))} />
      </div>

      {logic.visibleCompanions.length > 0 ? <div className="client-card-grid client-card-grid--companions">
        {logic.visibleCompanions.map((person) => <CompanionCard
          key={person.id}
          companion={person}
          onOpen={() => onOpenCompanion(person.id)}
          onChat={() => onChatWithCompanion(person.id)}
          onOrder={() => onOrderWithCompanion(person.id)}
        />)}
      </div> : <div className="client-inline-empty"><p>没有符合筛选条件的成员</p><button type="button" className="client-button client-button--secondary" onClick={logic.resetFilters}>清除筛选</button></div>}
    </section>
  </div>
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="client-filter-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
}

function DisplayAction({ icon, label, onClick, disabled = false }: { icon: ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return <button type="button" className="client-button client-button--secondary client-display-action" onClick={onClick} disabled={disabled}>{icon}{label}</button>
}
