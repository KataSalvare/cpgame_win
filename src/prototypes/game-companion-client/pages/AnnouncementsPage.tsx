import { useMemo, useState } from 'react'
import { Bell, CalendarDays } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import { PageStatePanel } from '../components/PageStatePanel'
import type { Announcement, AnnouncementCategory } from '../data/announcementMockData'

type Props = {
  kind: 'platform' | 'club'
  clubName?: string
  announcements: Announcement[]
  categories: AnnouncementCategory[]
  pageState: 'normal' | 'loading' | 'empty' | 'error'
  readIds: string[]
  onRead: (id: string) => void
  onRetry: () => void
  onBack?: () => void
}

export function AnnouncementsPage({ kind, clubName, announcements, categories, pageState, readIds, onRead, onRetry, onBack }: Props) {
  const [activeCategory, setActiveCategory] = useState<AnnouncementCategory | '全部'>('全部')
  const [selected, setSelected] = useState<Announcement | null>(null)
  const title = kind === 'platform' ? '平台公告' : '俱乐部公告'
  const visibleAnnouncements = useMemo(() => {
    const filtered = activeCategory === '全部' ? announcements : announcements.filter((item) => item.category === activeCategory)
    return [...filtered].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [activeCategory, announcements])

  if (pageState !== 'normal') return <div className="client-content announcement-state"><PageStatePanel state={pageState} title={pageState === 'empty' ? '暂无公告' : '公告暂不可用'} description={pageState === 'error' ? '公告暂时无法加载，请重试。' : pageState === 'loading' ? '正在加载公告…' : '当前分类下暂时没有公告。'} actionLabel={pageState === 'error' ? '重新加载' : '查看全部'} onAction={pageState === 'error' ? onRetry : () => setActiveCategory('全部')} /></div>

  return <div className="client-content announcement-page">
    {onBack && <button type="button" className="client-back-link" onClick={onBack}>返回俱乐部</button>}
    <header className="client-page-heading"><div><span className="client-eyebrow">{kind === 'platform' ? '平台消息' : clubName}</span><h1>{title}</h1></div><span className="client-heading-mark"><Bell size={15} />{announcements.length} 条公告</span></header>
    <section className="announcement-card client-card" aria-label={`${title}列表`}>
      <div className="announcement-filters" role="tablist" aria-label="公告分类">
        {(['全部', ...categories] as const).map((category) => <button key={category} type="button" role="tab" aria-selected={activeCategory === category} className={`announcement-filter${activeCategory === category ? ' is-active' : ''}`} onClick={() => setActiveCategory(category)}>{category}</button>)}
      </div>
      {visibleAnnouncements.length ? <ul className="announcement-list">
        {visibleAnnouncements.map((announcement) => {
          const isRead = readIds.includes(announcement.id)
          return <li key={announcement.id}>
            <button type="button" className={`announcement-row${isRead ? '' : ' is-unread'}${announcement.coverImage ? ' has-cover' : ''}`} onClick={() => { onRead(announcement.id); setSelected(announcement) }}>
              <span className="announcement-row__status" aria-label={isRead ? '已读' : '未读'}>{!isRead && <i />}</span>
              {announcement.coverImage && <img className="announcement-row__cover" src={announcement.coverImage} alt={announcement.coverAlt ?? ''} />}
              <span className="announcement-row__main"><span className="announcement-row__copy"><span className="announcement-row__title-line"><span className={`announcement-category announcement-category--${announcement.category === '紧急通知' || announcement.category === '处罚通知' ? 'important' : 'default'}`}>{announcement.category}</span><strong>{announcement.title}</strong></span><span className="announcement-row__summary">{announcement.summary}</span></span></span>
              <time className="announcement-row__time" dateTime={announcement.publishedAt.replace(' ', 'T')}><CalendarDays size={14} />{announcement.publishedAt}</time>
            </button>
          </li>
        })}
      </ul> : <div className="announcement-empty"><Bell size={24} /><strong>暂无{activeCategory}公告</strong><span>选择其他分类查看公告</span></div>}
    </section>
    {selected && <DialogPanel overlayId={`${kind}-announcement-detail`} title={selected.title} description={`${selected.category} · ${selected.publishedAt}`} onClose={() => setSelected(null)} width={620} footer={<button type="button" className="client-button client-button--primary" onClick={() => setSelected(null)}>关闭</button>}>
      {selected.coverImage && <img className="announcement-detail__cover" src={selected.coverImage} alt={selected.coverAlt ?? ''} />}
      <article className="announcement-detail">{selected.content.map((paragraph, index) => <p key={`${selected.id}-${index}`}>{paragraph}</p>)}</article>
    </DialogPanel>}
  </div>
}
