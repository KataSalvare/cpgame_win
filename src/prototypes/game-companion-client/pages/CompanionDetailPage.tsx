import { useState } from 'react'
import { ArrowLeft, BatteryCharging, ChevronLeft, ChevronRight, Gift, HandHeart, MessageCircle, Orbit, Sparkles, Star, UsersRound } from 'lucide-react'
import type { Companion } from '../data/mockData'
import { games, gifts, reviews, servicesByCompanion } from '../data/mockData'
import { useCompanionDetailLogic } from '../hooks/useCompanionDetailLogic'
import { AvatarMark } from '../components/AvatarMark'
import { CompanionProfileCard } from '../components/CompanionProfileCard'
import { companionToProfileCard } from '../components/profileCardData'
import type { ProfileCardData } from '../components/profileCardData'
import { PageStatePanel } from '../components/PageStatePanel'
import { VoiceMessageButton } from '../components/VoiceMessageButton'

type Props = {
  onShare?: (friendIds: string[]) => void
  companion: Companion
  pageState: 'normal' | 'loading' | 'empty' | 'error'
  onBack: () => void
  onRetry: () => void
  onOrder: (serviceId: string, companionId: string) => void
  presentation?: 'page' | 'panel'
  profileOverride?: ProfileCardData
  onChat?: () => void
  onGift?: (anchor: HTMLButtonElement) => void
  followed?: boolean
  blocked?: boolean
  onToggleFollow?: () => void
  onBlock?: () => void
  note?: string
  onSaveNote?: (note: string) => void
}

type DetailTab = 'services' | 'reviews' | 'gifts'
type ReviewFilter = 'all' | 'images' | 'latest' | 'good' | 'middle' | 'poor'
const tabNames: Record<DetailTab, string> = { services: '服务', reviews: '评价', gifts: '礼物' }
const giftIcons = [Star, HandHeart, BatteryCharging, UsersRound, Sparkles, Orbit]
const receivedGiftCount = gifts.reduce((total, gift) => total + gift.count, 0)

export function CompanionDetailPage({ companion, pageState, onBack, onRetry, onOrder, presentation = 'page', profileOverride, onChat, onGift, followed, blocked, onToggleFollow, onBlock, note, onSaveNote, onShare }: Props) {
  const [activeTab, setActiveTab] = useState<DetailTab>('services')
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all')
  const logic = useCompanionDetailLogic(companion.id)
  const totalServiceCount = servicesByCompanion[companion.id]?.length ?? 0
  const goodReviewCount = reviews.filter((review) => review.rating >= 4).length
  const middleReviewCount = reviews.filter((review) => review.rating >= 3 && review.rating < 4).length
  const poorReviewCount = reviews.filter((review) => review.rating < 3).length
  const visibleReviews = (reviewFilter === 'images' ? reviews.filter((review) => review.images?.length) : reviewFilter === 'good' ? reviews.filter((review) => review.rating >= 4) : reviewFilter === 'middle' ? reviews.filter((review) => review.rating >= 3 && review.rating < 4) : reviewFilter === 'poor' ? reviews.filter((review) => review.rating < 3) : reviews)
    .slice()
    .sort((a, b) => reviewFilter === 'latest' ? b.date.localeCompare(a.date) : 0)

  if (pageState !== 'normal') {
    return <div className={`client-content client-content--narrow-state${presentation === 'panel' ? ' companion-detail-page--panel' : ''}`}>
      {presentation !== 'panel' && <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={16} /> 返回俱乐部</button>}
      <PageStatePanel
        state={pageState}
        title={pageState === 'empty' ? '暂时没有陪玩资料' : '陪玩资料暂不可用'}
        description={pageState === 'error' ? '资料加载遇到问题，请重试。' : '当前没有可展示的资料或服务。'}
        actionLabel={pageState === 'error' ? '重新加载' : '返回俱乐部'}
        onAction={pageState === 'error' ? onRetry : onBack}
      />
    </div>
  }

  return <div className={`client-content companion-detail-page${presentation === 'panel' ? ' companion-detail-page--panel' : ''}`}>
    {presentation !== 'panel' && <button type="button" className="client-back-link" onClick={onBack} aria-label="返回俱乐部详情"><ArrowLeft size={16} /> 俱乐部</button>}
    <CompanionProfileCard onShare={onShare} profile={{ ...companionToProfileCard(companion), ...profileOverride }} onChat={onChat} followed={followed} blocked={blocked} onToggleFollow={onToggleFollow} onBlock={onBlock} note={note} onSaveNote={onSaveNote} />

    <section className="companion-detail-content">
      <div className="companion-tabs" role="tablist" aria-label="陪玩详情内容">
        {(Object.keys(tabNames) as DetailTab[]).map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={`companion-tabs__tab${activeTab === tab ? ' is-active' : ''}`} onClick={() => setActiveTab(tab)}>
          {tabNames[tab]}<span>{tab === 'services' ? totalServiceCount : tab === 'reviews' ? reviews.length : receivedGiftCount}</span>
        </button>)}
      </div>

      <div className="companion-tab-panel" role="tabpanel">
        {activeTab === 'services' && <section className="service-section" aria-labelledby="service-title">
          <div className="client-section-heading service-section__heading"><h2 id="service-title">服务</h2><label className="client-filter-select client-filter-select--inline"><span>游戏</span><select value={logic.gameId} onChange={(event) => logic.selectGame(event.target.value)}>{games.map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select></label></div>
          {logic.totalServices === 0 ? <div className="client-inline-empty"><p>该游戏暂时没有服务项目</p><button type="button" className="client-button client-button--secondary" onClick={() => logic.selectGame('all')}>查看全部服务</button></div> : <>
            {presentation === 'panel' ? <div className="service-offer-list">{logic.pageServices.map((service) => {
              const game = games.find((item) => item.id === service.gameId)
              return <article className="service-offer" key={service.id}>
              <div className="service-offer__heading"><div className="service-game-cell"><span className="game-choice__mark">{game?.shortName ?? '游戏'}</span><span><strong>{game?.name ?? '游戏'}</strong><small className="service-offer__play-level"><span>{service.playName}</span><span aria-label={`等级：${service.levelName}`}>{service.levelName}</span></small></span></div><button type="button" className="client-button client-button--primary client-button--small" disabled={!service.canAcceptOrders} onClick={() => onOrder(service.id, companion.id)}>{service.canAcceptOrders ? '下单' : '暂不可接单'}</button></div>
              {service.voiceMessage && <VoiceMessageButton message={service.voiceMessage} label="服务语音" compact />}
                <div className="service-offer__facts"><span><small>单价</small><strong className="service-offer__price">{service.price} 钻石 / {service.unit}</strong></span><span><small>服务单数</small>{service.orderCount}</span><span><small>评分</small><span className="rating-mark"><Star size={12} />{service.rating.toFixed(2)}</span></span></div>
              </article>
            })}</div> : <div className="service-table-wrap">
              <table className="service-table">
                <thead><tr><th>游戏 / 玩法</th><th>等级</th><th>服务单数</th><th>服务评分</th><th>单价</th><th>操作</th></tr></thead>
                <tbody>{logic.pageServices.map((service) => {
                  const game = games.find((item) => item.id === service.gameId)
                  return <tr key={service.id}>
                    <td><div className="service-game-cell"><span className="game-choice__mark">{game?.shortName ?? '游戏'}</span><span><strong>{game?.name ?? '游戏'}</strong><small>{service.playName}</small>{service.voiceMessage && <VoiceMessageButton message={service.voiceMessage} label="服务语音" compact />}</span></div></td>
                    <td>{service.levelName}</td><td>{service.orderCount}</td><td><span className="rating-mark"><Star size={14} />{service.rating.toFixed(2)}</span></td><td><strong>{service.price} 钻石 / {service.unit}</strong></td><td><button type="button" className="client-button client-button--primary client-button--small" disabled={!service.canAcceptOrders} onClick={() => onOrder(service.id, companion.id)}>{service.canAcceptOrders ? '下单' : '暂不可接单'}</button></td>
                  </tr>
                })}</tbody>
              </table>
            </div>}
            <div className="service-pagination" aria-label="服务列表分页">
              <span>共 {logic.totalServices} 项服务</span>
              <div><button type="button" className="client-icon-button" aria-label="上一页" disabled={logic.page <= 1} onClick={() => logic.setPage(logic.page - 1)}><ChevronLeft size={16} /></button><span>第 {logic.page} / {logic.pageCount} 页</span><button type="button" className="client-icon-button" aria-label="下一页" disabled={logic.page >= logic.pageCount} onClick={() => logic.setPage(logic.page + 1)}><ChevronRight size={16} /></button></div>
            </div>
          </>}
        </section>}

        {activeTab === 'reviews' && <section className="detail-list-section" aria-labelledby="reviews-title">
          <h2 id="reviews-title" className="sr-only">评价筛选</h2>
          <div className="review-filters" role="group" aria-label="评价筛选">
            <button type="button" aria-pressed={reviewFilter === 'all'} className={reviewFilter === 'all' ? 'is-active' : ''} onClick={() => setReviewFilter('all')}>全部</button>
            <button type="button" aria-pressed={reviewFilter === 'images'} className={reviewFilter === 'images' ? 'is-active' : ''} onClick={() => setReviewFilter('images')}>带图评价</button>
            <button type="button" aria-pressed={reviewFilter === 'latest'} className={reviewFilter === 'latest' ? 'is-active' : ''} onClick={() => setReviewFilter('latest')}>最新</button>
            <button type="button" aria-pressed={reviewFilter === 'good'} className={reviewFilter === 'good' ? 'is-active' : ''} onClick={() => setReviewFilter('good')}>好评（{goodReviewCount}）</button>
            <button type="button" aria-pressed={reviewFilter === 'middle'} className={reviewFilter === 'middle' ? 'is-active' : ''} onClick={() => setReviewFilter('middle')}>中评（{middleReviewCount}）</button>
            <button type="button" aria-pressed={reviewFilter === 'poor'} className={reviewFilter === 'poor' ? 'is-active' : ''} onClick={() => setReviewFilter('poor')}>差评（{poorReviewCount}）</button>
          </div>
          {visibleReviews.length ? <div className="review-list">{visibleReviews.map((review) => <article className="review-item" key={review.id}>
            <AvatarMark initials={review.initials} size="sm" />
            <div className="review-item__body">
              <div className="review-item__heading"><strong>{review.author}</strong><span className="rating-mark"><Star size={13} />{review.rating.toFixed(1)}</span><time className="client-muted" dateTime={review.date}>{review.date}</time></div>
              <p>{review.content}</p>
              {review.images?.length ? <div className="review-item__images" aria-label="评价图片">{review.images.map((image, index) => <img key={`${review.id}-${image}`} src={image} alt={`${review.author}的评价图片 ${index + 1}`} loading="lazy" />)}</div> : null}
            </div>
          </article>)}</div> : <div className="client-inline-empty"><p>暂无符合条件的评价</p><button type="button" className="client-button client-button--secondary" onClick={() => setReviewFilter('all')}>查看全部评价</button></div>}
        </section>}

        {activeTab === 'gifts' && <section className="detail-list-section" aria-label="礼物墙">
          <div className="gift-wall">{gifts.map((gift, index) => {
            const GiftIcon = giftIcons[index % giftIcons.length]
            return <article className="gift-wall__item" key={gift.id} aria-label={`${gift.name}，收到 ${gift.count} 个`}><span className="gift-wall__art" aria-hidden="true"><GiftIcon size={38} strokeWidth={1.5} /></span><h3>{gift.name}</h3><span className="gift-wall__count">×{gift.count}</span></article>
          })}</div>
        </section>}
      </div>
    </section>
    <footer className="companion-detail-page__actions" aria-label="陪玩操作">
      <button type="button" className={`client-button client-button--secondary${followed ? ' is-followed' : ''}`} aria-pressed={Boolean(followed)} onClick={onToggleFollow}><Star size={15} />{followed ? '已关注' : '关注'}</button>
      <button type="button" className="client-button client-button--primary" onClick={onChat}><MessageCircle size={15} />找TA开黑</button>
      <button type="button" className="client-button client-button--secondary" onClick={(event) => onGift?.(event.currentTarget)}><Gift size={15} />送礼</button>
    </footer>
  </div>
}


