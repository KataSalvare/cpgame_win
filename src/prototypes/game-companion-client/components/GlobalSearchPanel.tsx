import { useEffect, useMemo, useState } from 'react'
import { Clock3, Search, Trash2, UsersRound, X } from 'lucide-react'
import { AvatarMark } from './AvatarMark'
import { ClubCard } from './ClubCard'
import { UserNameWithLevel } from './UserNameWithLevel'
import { games, type Club } from '../data/mockData'
import type { VoiceRoom } from '../data/socialMockData'

export type GlobalSearchUser = {
  id: string
  name: string
  initials: string
  profileId: string
  kind: '玩家' | '陪玩'
  companionId?: string
  friendId?: string
}

type Props = {
  clubs: Club[]
  rooms: VoiceRoom[]
  users: GlobalSearchUser[]
  onClose: () => void
  onOpenClub: (clubId: string) => void
  onOpenRoom: (roomId: string) => void
  onOpenUser: (user: GlobalSearchUser) => void
}

type ResultTab = 'rooms' | 'clubs' | 'users'
type RoomSearchResult = { id: string; name: string; description: string; targetRoomId: string }
const HISTORY_KEY = 'game-companion-global-search-history'
const clubPublicId = (id: string) => id.replace(/^club-(\d+)$/i, 'C-$1')
const tabItems: { id: ResultTab; label: string }[] = [
  { id: 'rooms', label: '语音房' },
  { id: 'clubs', label: '俱乐部' },
  { id: 'users', label: '用户' },
]

function readHistory(): string[] {
  try {
    const value = window.localStorage.getItem(HISTORY_KEY)
    const parsed: unknown = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function GlobalSearchPanel({ clubs, rooms, users, onClose, onOpenClub, onOpenRoom, onOpenUser }: Props) {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState(readHistory)
  const [activeTab, setActiveTab] = useState<ResultTab>('rooms')
  const gamesById = useMemo(() => new Map(games.map((game) => [game.id, game])), [])
  const normalizedQuery = query.trim().toLocaleLowerCase()

  const results = useMemo(() => {
    const includes = (value: string) => value.toLocaleLowerCase().includes(normalizedQuery)
    return {
      rooms: [
        ...rooms.filter((room) => includes(room.name)).map((room): RoomSearchResult => ({
          id: room.id,
          name: room.name,
          description: `语音分组 · ${room.channels.length} 个房间`,
          targetRoomId: room.id,
        })),
        ...(normalizedQuery === '11' ? [{
          id: 'search-room-11',
          name: '房间A',
          description: '北境战术俱乐部 · 4/8 人 · ID：VR-0011',
          targetRoomId: 'room-ranked',
        }] : []),
      ],
      clubs: clubs.filter((club) => includes(club.name) || includes(club.id) || includes(clubPublicId(club.id))),
      users: users.filter((user) => includes(user.name) || includes(user.profileId) || includes(user.id)),
    }
  }, [clubs, normalizedQuery, rooms, users])
  const counts = { rooms: results.rooms.length, clubs: results.clubs.length, users: results.users.length }
  const totalResults = counts.rooms + counts.clubs + counts.users
  const recommendedClubs = clubs.filter((club) => club.featured).slice(0, 3)

  const selectFirstMatchingTab = (value: string) => {
    const term = value.trim().toLocaleLowerCase()
    if (!term) { setActiveTab('rooms'); return }
    if (term === '11' || rooms.some((room) => room.name.toLocaleLowerCase().includes(term))) setActiveTab('rooms')
    else if (clubs.some((club) => club.name.toLocaleLowerCase().includes(term) || club.id.toLocaleLowerCase().includes(term) || clubPublicId(club.id).toLocaleLowerCase().includes(term))) setActiveTab('clubs')
    else setActiveTab('users')
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      // Search remains usable when browser storage is unavailable.
    }
  }, [history])

  const rememberQuery = () => {
    const value = query.trim()
    if (value) {
      setHistory((current) => [value, ...current.filter((item) => item !== value)].slice(0, 8))
      try {
        const current = readHistory()
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify([value, ...current.filter((item) => item !== value)].slice(0, 8)))
      } catch {
        // Search remains usable when browser storage is unavailable.
      }
    }
  }

  const openResult = (action: () => void) => {
    rememberQuery()
    onClose()
    action()
  }

  return <div className="global-search-overlay" data-overlay="game-companion-global-search" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="global-search-panel" role="dialog" aria-modal="true" aria-label="全局搜索" onMouseDown={(event) => event.stopPropagation()}>
      <form className="global-search-input" onSubmit={(event) => { event.preventDefault(); rememberQuery() }}>
        <Search size={18} aria-hidden="true" />
        <input autoFocus type="search" value={query} onChange={(event) => { setQuery(event.target.value); selectFirstMatchingTab(event.target.value) }} placeholder="搜索语音房、俱乐部或用户昵称 / ID" aria-label="搜索语音房、俱乐部或用户" />
        {query && <button type="button" className="windows-icon-button" aria-label="清空搜索内容" onClick={() => { setQuery(''); selectFirstMatchingTab('') }}><X size={16} /></button>}
        <button type="button" className="global-search-escape" onClick={onClose}>Esc</button>
      </form>

      {!normalizedQuery ? <div className="global-search-content">
        <section className="global-search-section">
          <div className="global-search-section__heading"><h2><Clock3 size={15} />历史搜索</h2>{history.length > 0 && <button type="button" className="global-search-text-button" onClick={() => setHistory([])}><Trash2 size={14} />清空</button>}</div>
          {history.length ? <div className="global-search-chips">{history.map((item) => <button type="button" key={item} onClick={() => { setQuery(item); selectFirstMatchingTab(item) }}>{item}</button>)}</div> : <p className="global-search-muted">暂无搜索记录</p>}
        </section>
        <RecommendedClubs clubs={recommendedClubs} gamesById={gamesById} onSelect={(clubId) => openResult(() => onOpenClub(clubId))} />
      </div> : <>
        <nav className="global-search-tabs" aria-label="搜索结果分类">{tabItems.map((tab) => <button type="button" key={tab.id} className={activeTab === tab.id ? 'is-active' : ''} aria-pressed={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}<span>{counts[tab.id]}</span></button>)}</nav>
        <div className="global-search-content global-search-content--results">
          {totalResults === 0 ? <>
            <div className="global-search-empty"><Search size={20} /><strong>没有找到相关内容</strong><span>试试俱乐部名称、俱乐部 ID、用户昵称或用户 ID</span></div>
            <RecommendedClubs clubs={recommendedClubs} gamesById={gamesById} onSelect={(clubId) => openResult(() => onOpenClub(clubId))} />
          </> : activeTab === 'rooms' ? counts.rooms ? results.rooms.map((room) => <button type="button" className="global-search-result" key={room.id} onClick={() => openResult(() => onOpenRoom(room.targetRoomId))}><span className="global-search-result__icon"><UsersRound size={17} /></span><span className="global-search-result__text"><strong>{room.name}</strong><small>{room.description}</small></span><span className="global-search-result__kind">语音房</span></button>) : <CategoryEmpty label="语音房" />
            : activeTab === 'clubs' ? counts.clubs ? results.clubs.map((club) => <button type="button" className="global-search-result" key={club.id} onClick={() => openResult(() => onOpenClub(club.id))}><AvatarMark initials={club.initials} size="md" /><span className="global-search-result__text"><strong>{club.name}</strong><small>ID：{clubPublicId(club.id)} · {club.companionCount} 位陪玩</small></span><span className="global-search-result__kind">俱乐部</span></button>) : <CategoryEmpty label="俱乐部" />
              : counts.users ? results.users.map((user) => <button type="button" className="global-search-result" key={user.id} onClick={() => openResult(() => onOpenUser(user))}><AvatarMark initials={user.initials} size="md" /><span className="global-search-result__text"><strong><UserNameWithLevel name={user.name} identityId={user.profileId} /></strong><small>ID：{user.profileId}</small></span><span className="global-search-result__kind">{user.kind}</span></button>) : <CategoryEmpty label="用户" />}
        </div>
      </>}
    </section>
  </div>
}

function CategoryEmpty({ label }: { label: string }) {
  return <div className="global-search-category-empty">没有找到相关{label}</div>
}

function RecommendedClubs({ clubs, gamesById, onSelect }: { clubs: Club[]; gamesById: Map<string, (typeof games)[number]>; onSelect: (clubId: string) => void }) {
  return <section className="global-search-section global-search-recommendations">
    <div className="global-search-section__heading"><h2>推荐俱乐部</h2></div>
    <div className="global-search-club-list">{clubs.map((club) => <ClubCard key={club.id} club={club} gamesById={gamesById} onOpen={() => onSelect(club.id)} onBrowse={() => {}} onSelfOrder={() => {}} showActions={false} />)}</div>
  </section>
}
