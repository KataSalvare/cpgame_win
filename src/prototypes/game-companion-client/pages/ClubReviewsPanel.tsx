import { useState } from 'react'
import { Star } from 'lucide-react'
import { clubReviews } from '../data/mockData'
import { AvatarMark } from '../components/AvatarMark'

type ReviewFilter = 'all' | 'images' | 'latest' | 'good' | 'middle' | 'poor'

export function ClubReviewsPanel() {
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const goodCount = clubReviews.filter((review) => review.rating >= 4).length
  const middleCount = clubReviews.filter((review) => review.rating >= 3 && review.rating < 4).length
  const poorCount = clubReviews.filter((review) => review.rating < 3).length
  const visibleReviews = (filter === 'images' ? clubReviews.filter((review) => review.images?.length)
    : filter === 'good' ? clubReviews.filter((review) => review.rating >= 4)
      : filter === 'middle' ? clubReviews.filter((review) => review.rating >= 3 && review.rating < 4)
        : filter === 'poor' ? clubReviews.filter((review) => review.rating < 3) : clubReviews)
    .slice()
    .sort((a, b) => filter === 'latest' ? b.date.localeCompare(a.date) : 0)

  const filters: { id: ReviewFilter; label: string }[] = [
    { id: 'all', label: '全部' }, { id: 'images', label: '带图评价' }, { id: 'latest', label: '最新' },
    { id: 'good', label: `好评（${goodCount}）` }, { id: 'middle', label: `中评（${middleCount}）` }, { id: 'poor', label: `差评（${poorCount}）` },
  ]

  return <section className="detail-list-section club-reviews-panel" aria-label="俱乐部评价">
    <div className="review-filters" role="group" aria-label="评价筛选">
      {filters.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} className={filter === item.id ? 'is-active' : ''} onClick={() => setFilter(item.id)}>{item.label}</button>)}
    </div>
    {visibleReviews.length ? <div className="review-list">{visibleReviews.map((review) => <article className="review-item" key={review.id}>
      <AvatarMark initials={review.initials} size="sm" />
      <div className="review-item__body">
        <div className="review-item__heading"><strong>{review.author}</strong><span className="rating-mark"><Star size={13} />{review.rating.toFixed(1)}</span><time className="client-muted" dateTime={review.date}>{review.date}</time></div>
        <p>{review.content}</p>
        {review.images?.length ? <div className="review-item__images" aria-label="评价图片">{review.images.map((image, index) => <img key={`${review.id}-${image}`} src={image} alt={`${review.author}的评价图片 ${index + 1}`} loading="lazy" />)}</div> : null}
      </div>
    </article>)}</div> : <div className="client-inline-empty"><p>暂无符合条件的评价</p><button type="button" className="client-button client-button--secondary" onClick={() => setFilter('all')}>查看全部评价</button></div>}
  </section>
}
