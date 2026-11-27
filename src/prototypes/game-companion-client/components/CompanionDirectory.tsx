import { CategoryTabs } from '@/themes/grayscale-prototype/components/CategoryTabs'
import { companions, regions, type Companion } from '../data/mockData'
import { useCompanionDirectoryLogic } from '../hooks/useClubDetailLogic'
import { CompanionCard } from './CompanionCard'
import { PageStatePanel } from './PageStatePanel'
import { GameFilter } from './GameFilter'
import { ChevronDown, RotateCcw, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type PageState = 'normal' | 'loading' | 'empty' | 'error'

type Props = {
  clubId?: string
  pageState: PageState
  onRetry: () => void
  onOpenCompanion: (companionId: string) => void
  onChatWithCompanion: (companionId: string) => void
  searchable?: boolean
  showTalentCategoryFilter?: boolean
  companionSource?: Companion[]
}

const ages = ['全部年龄', '18-25岁', '26-30岁', '31-35岁', '36-40岁', '40岁以上']
const sortLabels: Record<string, string> = {
  recommended: '综合排序',
  'price-asc': '价格从低到高',
  'price-desc': '价格从高到低',
  'orders-asc': '单数从低到高',
  'orders-desc': '单数从高到低',
  'rating-desc': '好评从高到低',
  'rating-asc': '好评从低到高',
}

const talentCategories = [
  { id: 'all', label: '全部' },
  { id: 'popular', label: '人气陪玩' },
  { id: 'star', label: '明星大神' },
] as const

export function CompanionDirectory({ clubId, pageState, onRetry, onOpenCompanion, onChatWithCompanion, searchable = false, showTalentCategoryFilter = false, companionSource = companions }: Props) {
  const logic = useCompanionDirectoryLogic(clubId, companionSource)
  const [talentCategory, setTalentCategory] = useState<(typeof talentCategories)[number]['id']>('all')
  const visibleCompanions = showTalentCategoryFilter && talentCategory !== 'all'
    ? logic.visibleCompanions.filter(person => person.talentCategories?.includes(talentCategory))
    : logic.visibleCompanions
  const resetFilters = () => { logic.resetFilters(); setTalentCategory('all') }

  if (pageState !== 'normal') {
    return <PageStatePanel
      state={pageState}
      title={pageState === 'empty' ? '暂时没有陪玩' : '陪玩列表暂不可用'}
      description={pageState === 'error' ? '陪玩列表暂时无法加载，请重试。' : '当前筛选条件下没有陪玩，清除筛选后再看看。'}
      actionLabel={pageState === 'error' ? '重新加载' : '清除筛选'}
      onAction={pageState === 'error' ? onRetry : resetFilters}
    />
  }

  return <section className="club-members-section" aria-label="陪玩列表">
    <div className={`companion-directory-filters${showTalentCategoryFilter ? ' companion-directory-filters--talents' : ''}`}>
    {showTalentCategoryFilter && <CategoryTabs label="陪玩分类筛选" items={talentCategories} value={talentCategory} onChange={setTalentCategory} className="talent-category-filter" />}
    <div className="club-game-filter"><GameFilter gameId={logic.gameId} onSelect={logic.setGameId} /></div>
    <div className={`club-filter-panel${searchable ? ' club-filter-panel--with-search' : ''}`}>
      {searchable && <label className="companion-directory-search"><Search size={15} aria-hidden="true" /><input type="search" value={logic.searchQuery} onChange={(event) => logic.setSearchQuery(event.target.value)} placeholder="搜索陪玩名称或 ID" aria-label="搜索陪玩名称或 ID" />{logic.searchQuery && <button type="button" className="windows-icon-button" aria-label="清空陪玩搜索" onClick={() => logic.setSearchQuery('')}><X size={14} /></button>}</label>}
      <FilterSelect label="排序" value={logic.sort} onChange={(value) => logic.setSort(value as typeof logic.sort)} options={Object.entries(sortLabels).map(([value, label]) => ({ value, label }))} />
      <FilterSelect label="在线状态" value={logic.onlineStatus} onChange={logic.setOnlineStatus} options={['全部在线状态', '在线', '离线'].map((value) => ({ value, label: value }))} />
      <FilterSelect label="接单状态" value={logic.status} onChange={logic.setStatus} options={['全部接单状态', '接单中', '服务中', '暂不接单'].map((value) => ({ value, label: value }))} />
      <FilterSelect label="性别" value={logic.gender} onChange={logic.setGender} options={['全部性别', '女', '男'].map((value) => ({ value, label: value }))} />
      <FilterSelect label="年龄" value={logic.age} onChange={logic.setAge} options={ages.map((value) => ({ value, label: value }))} />
      <FilterSelect label="地区" value={logic.region} onChange={logic.setRegion} options={['全部地区', ...regions].map((value) => ({ value, label: value }))} />
      <button type="button" className="client-button client-button--secondary companion-directory-reset" onClick={resetFilters} aria-label="重置陪玩搜索和筛选"><RotateCcw size={14} />重置</button>
    </div>
    </div>

    {visibleCompanions.length > 0 ? <div className="client-card-grid client-card-grid--companions">
      {visibleCompanions.map((person) => <CompanionCard
        key={person.id}
        companion={person}
        onOpen={() => onOpenCompanion(person.id)}
        onChat={() => onChatWithCompanion(person.id)}
      />)}
    </div> : <div className="client-inline-empty"><p>没有符合筛选条件的陪玩</p><button type="button" className="client-button client-button--secondary" onClick={resetFilters}>清除筛选</button></div>}
  </section>
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  return <div className="directory-select" ref={rootRef} onKeyDown={(event) => {
    if (event.key === 'Escape' && open) { setOpen(false); buttonRef.current?.focus() }
  }}>
    <button ref={buttonRef} type="button" className="directory-select__trigger" aria-label={`${label}：${options.find(option => option.value === value)?.label ?? value}`} aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen(!open)}>
      <span>{options.find(option => option.value === value)?.label ?? value}</span><ChevronDown size={16} aria-hidden="true" />
    </button>
    {open && <div className="directory-select__menu" role="listbox" aria-label={label}>
      {options.map(option => <button type="button" role="option" aria-selected={option.value === value} className={`directory-select__option${option.value === value ? ' is-selected' : ''}`} key={option.value} onClick={() => { onChange(option.value); setOpen(false); buttonRef.current?.focus() }}>{option.label}</button>)}
    </div>}
  </div>
}
