/**
 * @name DEMO 陪玩平台主页
 */
import { useMemo, useState, type FormEvent } from 'react'
import { ArrowDownWideNarrow, BadgeCheck, Bell, ChevronDown, ChevronRight, CircleHelp, Crown, Gamepad2, Headphones, Heart, MessageCircle, Mic2, MoreHorizontal, Search, Send, ShieldCheck, SlidersHorizontal, Sparkles, Star, Swords, X, Zap } from 'lucide-react'
import { DEMOEmptyState, DEMOErrorState, DEMOLoadingState, type DEMOPageState } from '@/common/DEMOComponents'
import { usePrototypeState, type PrototypePreviewProps } from '@/prototypes/previewState'
import './style.css'

type Companion = {
  id: string
  name: string
  title: string
  games: string[]
  tags: string[]
  rating: string
  orders: string
  price: number
  online: boolean
  color: string
  initials: string
  level: string
}

const games = [
  { name: '英雄联盟', short: 'LOL', genre: 'MOBA', color: 'violet', icon: Swords, count: '2,418 位陪玩' },
  { name: '无畏契约', short: 'VAL', genre: 'FPS', color: 'coral', icon: Zap, count: '1,286 位陪玩' },
  { name: '永劫无间', short: 'NB', genre: '动作竞技', color: 'amber', icon: Swords, count: '864 位陪玩' },
  { name: '金铲铲之战', short: 'TFT', genre: '策略', color: 'blue', icon: Crown, count: '736 位陪玩' },
  { name: '王者荣耀', short: '王者', genre: 'MOBA', color: 'green', icon: ShieldCheck, count: '1,032 位陪玩' },
  { name: '更多游戏', short: '＋', genre: '探索全部', color: 'neutral', icon: MoreHorizontal, count: '发现新乐趣' },
]

const companions: Companion[] = [
  { id: 'mika', name: 'Mika', title: '温柔声线｜稳定上分搭子', games: ['英雄联盟', '金铲铲之战'], tags: ['声音好听', '耐心教学'], rating: '5.0', orders: '2,386 单', price: 28, online: true, color: 'rose', initials: 'M', level: '王者 860 点' },
  { id: 'north', name: '北屿', title: '峡谷野王｜节奏带飞', games: ['英雄联盟', '无畏契约'], tags: ['国服打野', '麦克风在线'], rating: '4.9', orders: '1,924 单', price: 36, online: true, color: 'blue', initials: '北', level: '宗师 920 点' },
  { id: 'sugar', name: '糖果汽水', title: '欢乐女声｜拒绝冷场', games: ['金铲铲之战', '王者荣耀'], tags: ['活泼开朗', '双人排位'], rating: '5.0', orders: '1,207 单', price: 22, online: false, color: 'peach', initials: '糖', level: '最强王者' },
  { id: 'ray', name: 'Ray.Z', title: 'FPS 突破手｜听声辨位', games: ['无畏契约', '永劫无间'], tags: ['准星天花板', '战术沟通'], rating: '4.9', orders: '986 单', price: 32, online: true, color: 'mint', initials: 'R', level: '神话 3 阶' },
]

type ChatMessage = { from: 'me' | 'other'; text: string; time: string }
const initialChats: Record<string, ChatMessage[]> = {
  mika: [{ from: 'other', text: '嗨～今天想玩哪款游戏呀？我刚好在线 ✨', time: '14:26' }, { from: 'me', text: '来两把峡谷，想练一下辅助', time: '14:27' }, { from: 'other', text: '好呀，我来补 AD，我们慢慢练～', time: '14:27' }],
  north: [{ from: 'other', text: '晚上好，需要我帮你看看阵容吗？', time: '13:42' }],
  sugar: [{ from: 'other', text: '今天上新啦，来一起快乐下棋！', time: '昨天' }],
  ray: [{ from: 'other', text: '麦克风测试～听得到吗？', time: '昨天' }],
}

const filterTabs = ['全部陪玩', '声音好听', '技术带飞', '欢乐开黑'] as const
type FilterTab = typeof filterTabs[number]

export default function DEMOGameCompanionHome(props: PrototypePreviewProps<DEMOPageState>) {
  const [pageState, setPageState] = usePrototypeState<DEMOPageState>('normal', props)
  const [activeGame, setActiveGame] = useState('全部游戏')
  const [activeTab, setActiveTab] = useState<FilterTab>('全部陪玩')
  const [sort, setSort] = useState('人气优先')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>(['sugar'])
  const [selected, setSelected] = useState('mika')
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState(initialChats)
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState('')

  const filteredCompanions = useMemo(() => {
    let result = companions.filter((companion) => {
      const matchesGame = activeGame === '全部游戏' || companion.games.includes(activeGame)
      const matchesTab = activeTab === '全部陪玩' || (activeTab === '声音好听' ? companion.tags.some((tag) => tag.includes('声音')) : activeTab === '技术带飞' ? companion.tags.some((tag) => ['国服打野', '准星天花板'].includes(tag)) : companion.tags.some((tag) => ['活泼开朗', '双人排位'].includes(tag)))
      const matchesOnline = !onlineOnly || companion.online
      const query = search.trim().toLowerCase()
      const matchesSearch = !query || `${companion.name} ${companion.title} ${companion.games.join(' ')}`.toLowerCase().includes(query)
      return matchesGame && matchesTab && matchesOnline && matchesSearch
    })
    if (sort === '价格从低到高') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === '好评优先') result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating))
    return result
  }, [activeGame, activeTab, onlineOnly, search, sort])

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    setMessages((current) => ({ ...current, [selected]: [...(current[selected] ?? []), { from: 'me', text, time: now }] }))
    setDraft('')
  }

  const openChat = (companionId: string) => { setSelected(companionId); setChatOpen(true) }
  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return <div className="game-home relative flex h-full min-h-0 w-full flex-col overflow-hidden">
    <header className="game-home__topbar flex h-[74px] shrink-0 items-center gap-8 border-b px-10">
      <button type="button" className="game-home__brand flex shrink-0 items-center gap-3" aria-label="返回陪玩首页" onClick={() => { setActiveGame('全部游戏'); setNotice('已回到陪玩首页') }}>
        <span className="game-home__brand-mark"><Gamepad2 size={23} strokeWidth={2.2} /></span>
        <span className="text-[20px] font-extrabold tracking-[-.045em]">开黑<span>搭子</span></span>
      </button>
      <nav className="flex h-full items-center gap-1" aria-label="主导航">
        {['找陪玩', '游戏大厅', '排行榜', '福利中心'].map((item, index) => <button type="button" key={item} onClick={() => setNotice(`${item}页面仅作原型入口`)} className={`game-home__nav-item ${index === 0 ? 'is-active' : ''}`}>{item}{index === 0 && <span className="game-home__nav-dot" />}</button>)}
      </nav>
      <label className="game-home__search ml-auto flex h-10 w-[274px] items-center gap-2 rounded-xl px-3.5"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索陪玩、游戏" aria-label="搜索陪玩或游戏" /></label>
      <div className="flex items-center gap-3">
        <button className="game-home__icon-button" aria-label="通知" type="button" onClick={() => setNotice('暂时没有新通知')}><Bell size={18} /><i /></button>
        <button className="game-home__wallet" type="button" onClick={() => setNotice('钱包余额仅作演示')}>¥ 128.00 <ChevronDown size={14} /></button>
        <button type="button" className="game-home__profile" aria-label="打开个人主页" onClick={() => setNotice('个人中心仅作原型入口')}>林<span>小鹿</span><ChevronDown size={13} /></button>
      </div>
    </header>

    <main className="game-home__scroll min-h-0 flex-1 overflow-y-auto">
      {pageState === 'loading' && <div className="p-12"><DEMOLoadingState /></div>}
      {pageState === 'empty' && <div className="p-12"><DEMOEmptyState title="暂时没有在线陪玩" description="换一个游戏或筛选条件试试，新的陪玩会持续加入。" action={<button className="game-home__primary-button" onClick={() => setPageState('normal')}>查看全部陪玩</button>} /></div>}
      {pageState === 'error' && <div className="p-12"><DEMOErrorState onRetry={() => setPageState('normal')} /></div>}
      {pageState === 'normal' && <div className="game-home__content mx-auto w-full max-w-[1650px] px-10 pb-10 pt-7">
        <section className="game-home__hero relative flex overflow-hidden rounded-[22px]" aria-label="精选推荐">
          <div className="game-home__hero-copy relative z-10 flex flex-col items-start justify-center">
            <div className="game-home__eyebrow"><Sparkles size={13} />本周开黑推荐 <span>WEEKLY PICK</span></div>
            <h1>今晚开黑，<br /><em>不再一个人。</em></h1>
            <p>高分搭子在线等你，找到合拍的队友，快乐加倍。</p>
            <button type="button" className="game-home__hero-cta" onClick={() => { setActiveGame('英雄联盟'); setNotice('已为你筛选英雄联盟陪玩') }}>现在去组队 <ChevronRight size={17} /></button>
            <div className="game-home__hero-social"><div className="game-home__avatar-stack"><span>小</span><span>M</span><span>北</span><span>＋</span></div><span><b>12,846</b> 位玩家正在寻找搭子</span></div>
          </div>
          <div className="game-home__hero-art" aria-hidden="true">
            <div className="game-home__hero-orbit game-home__hero-orbit--one" /><div className="game-home__hero-orbit game-home__hero-orbit--two" />
            <div className="game-home__hero-glyph game-home__hero-glyph--spark">✦</div><div className="game-home__hero-glyph game-home__hero-glyph--plus">＋</div>
            <div className="game-home__hero-player"><div className="game-home__player-hair" /><div className="game-home__player-face"><span /><i /><b /></div><div className="game-home__player-body"><Gamepad2 size={54} /></div><div className="game-home__player-headset" /></div>
            <div className="game-home__hero-float game-home__hero-float--rank"><Crown size={17} /><span><b>王牌陪玩</b><small>今日热度 TOP 1</small></span><strong>98.6</strong></div>
            <div className="game-home__hero-float game-home__hero-float--online"><span className="game-home__online-dot" /><span><b>正在组队</b><small>3,208 人在线</small></span></div>
            <div className="game-home__hero-caption">PLAY TOGETHER <span>✦</span></div>
          </div>
          <div className="game-home__hero-pagination"><i className="active" /><i /><i /></div>
        </section>

        <section className="game-home__games-section" aria-labelledby="games-title">
          <div className="game-home__section-heading"><div><span className="game-home__section-kicker">挑一款喜欢的</span><h2 id="games-title">热门游戏</h2></div><button type="button" className="game-home__text-link" onClick={() => { setActiveGame('全部游戏'); setNotice('已展示全部游戏') }}>全部游戏 <ChevronRight size={15} /></button></div>
          <div className="game-home__games-grid">{games.map((game) => <button type="button" key={game.name} className={`game-home__game-tile ${game.color} ${activeGame === game.name ? 'is-selected' : ''}`} aria-pressed={activeGame === game.name} onClick={() => setActiveGame(game.name === '更多游戏' ? '全部游戏' : activeGame === game.name ? '全部游戏' : game.name)}>
            <span className="game-home__game-icon"><game.icon size={22} strokeWidth={1.8} /></span><span className="game-home__game-title">{game.name}</span><span className="game-home__game-count">{game.count}</span><span className="game-home__game-arrow"><ChevronRight size={14} /></span><span className="game-home__game-code">{game.short}</span>
          </button>)}</div>
        </section>

        <section className="game-home__companions-section" aria-labelledby="companions-title">
          <div className="game-home__companions-top"><div className="game-home__section-heading"><div><span className="game-home__section-kicker">FIND YOUR DUO</span><h2 id="companions-title">发现你的开黑搭子 <span className="game-home__live-count"><i /> 4,286 位在线</span></h2></div><button type="button" className="game-home__text-link" onClick={() => setNotice('已展示全部陪玩')}>查看全部 <ChevronRight size={15} /></button></div>
          <div className="game-home__filter-row"><div className="game-home__filter-tabs" role="tablist" aria-label="陪玩类型">{filterTabs.map((tab) => <button role="tab" aria-selected={activeTab === tab} type="button" key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'is-active' : ''}>{tab}</button>)}</div><div className="game-home__filter-controls"><button type="button" onClick={() => setOnlineOnly(!onlineOnly)} className={`game-home__online-filter ${onlineOnly ? 'is-on' : ''}`} aria-pressed={onlineOnly}><i />只看在线</button><button type="button" className="game-home__filter-button" onClick={() => { setSearch(''); setActiveTab('全部陪玩'); setOnlineOnly(false); setActiveGame('全部游戏'); setSort('人气优先') }} title="清除所有筛选"><SlidersHorizontal size={14} />重置</button><label className="game-home__sort"><ArrowDownWideNarrow size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="排序"><option>人气优先</option><option>价格从低到高</option><option>好评优先</option></select><ChevronDown size={13} /></label></div></div>
          </div>
          {filteredCompanions.length ? <div className="game-home__companions-grid">{filteredCompanions.map((person) => <article className="game-home__companion-card" key={person.id}>
            <div className={`game-home__portrait ${person.color}`}><div className="game-home__portrait-halo" /><div className="game-home__portrait-face"><span className="game-home__portrait-hair" /><span className="game-home__portrait-eyes">••</span><span className="game-home__portrait-mouth" /></div><span className="game-home__portrait-initials">{person.initials}</span><span className={`game-home__status ${person.online ? 'online' : ''}`}>{person.online ? '在线' : '忙碌'}</span><button type="button" className={`game-home__favorite ${favorites.includes(person.id) ? 'is-favorite' : ''}`} aria-label={favorites.includes(person.id) ? '取消收藏' : '收藏陪玩'} aria-pressed={favorites.includes(person.id)} onClick={() => toggleFavorite(person.id)}><Heart size={17} fill={favorites.includes(person.id) ? 'currentColor' : 'none'} /></button><span className="game-home__portrait-level"><BadgeCheck size={12} />{person.level}</span></div>
            <div className="game-home__companion-info"><div className="game-home__companion-name"><h3>{person.name}</h3><span><Star size={13} fill="currentColor" />{person.rating}</span><small>{person.orders}</small></div><p className="game-home__companion-title">{person.title}</p><div className="game-home__companion-tags">{person.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="game-home__companion-bottom"><span><b>¥{person.price}</b> <small>/ 小时起</small></span><button type="button" onClick={() => openChat(person.id)}><MessageCircle size={14} />聊一聊</button></div></div>
          </article>)}</div> : <div className="game-home__no-results"><Search size={20} /><span>没有找到符合条件的陪玩，试试调整筛选条件。</span><button onClick={() => { setSearch(''); setActiveTab('全部陪玩'); setActiveGame('全部游戏'); setOnlineOnly(false) }}>清除筛选</button></div>}
        </section>
      </div>}
    </main>

    {notice && <div className="game-home__toast" role="status"><BadgeCheck size={16} />{notice}<button type="button" aria-label="关闭提示" onClick={() => setNotice('')}><X size={14} /></button></div>}
    <button type="button" className={`game-home__im-launcher ${chatOpen ? 'is-open' : ''}`} aria-label={chatOpen ? '收起聊天面板' : '打开聊天面板'} aria-expanded={chatOpen} onClick={() => setChatOpen(!chatOpen)}><MessageCircle size={21} /><span>消息</span><i>2</i></button>
    {chatOpen && <aside className="game-home__chat-panel" aria-label="IM 聊天面板" data-overlay>
      <div className="game-home__chat-head"><div><h2>消息</h2><p>你的开黑搭子都在这里</p></div><div className="flex gap-1"><button type="button" aria-label="帮助" onClick={() => setNotice('聊天内容为本地演示')}><CircleHelp size={17} /></button><button type="button" aria-label="收起聊天面板" onClick={() => setChatOpen(false)}><X size={18} /></button></div></div>
      <div className="game-home__chat-layout"><div className="game-home__chat-list"><label><Search size={14} /><input value={chatSearch} onChange={(event) => setChatSearch(event.target.value)} placeholder="搜索会话" aria-label="搜索会话" /></label>{companions.filter((person) => `${person.name} ${person.title}`.toLowerCase().includes(chatSearch.trim().toLowerCase())).map((person) => { const last = messages[person.id]?.at(-1); return <button type="button" key={person.id} onClick={() => setSelected(person.id)} className={selected === person.id ? 'is-selected' : ''}><span className={`game-home__chat-avatar ${person.color}`}>{person.initials}<i className={person.online ? 'online' : ''} /></span><span className="game-home__chat-preview"><b>{person.name}</b><small>{last?.text ?? '开始一段新对话'}</small></span><time>{last?.time}</time></button> })}</div>
        <div className="game-home__chat-conversation"><div className="game-home__chat-contact"><span className={`game-home__chat-avatar ${companions.find((item) => item.id === selected)?.color ?? 'rose'}`}>{companions.find((item) => item.id === selected)?.initials}<i className={companions.find((item) => item.id === selected)?.online ? 'online' : ''} /></span><span><b>{companions.find((item) => item.id === selected)?.name}</b><small>{companions.find((item) => item.id === selected)?.online ? '当前在线 · 回复很快' : '暂时忙碌 · 留言稍后回复'}</small></span><button aria-label="更多聊天操作" type="button" onClick={() => setNotice('更多聊天操作仅作演示')}><MoreHorizontal size={18} /></button></div>
          <div className="game-home__chat-messages"><div className="game-home__chat-date">今天 14:26</div>{(messages[selected] ?? []).map((message, index) => <div className={`game-home__message ${message.from === 'me' ? 'from-me' : ''}`} key={`${selected}-${index}`}><span>{message.text}</span><time>{message.time}</time></div>)}</div>
          <form className="game-home__chat-composer" onSubmit={sendMessage}><textarea aria-label="输入聊天消息" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder="输入消息，Enter 发送" rows={2} /><div><button type="button" aria-label="语音消息" onClick={() => setNotice('语音消息仅作演示')}><Mic2 size={17} /></button><button className="game-home__send" type="submit" aria-label="发送消息" disabled={!draft.trim()}><Send size={15} />发送</button></div></form>
        </div></div>
      <div className="game-home__chat-footer"><Headphones size={14} />官方客服在线 <span>·</span> 平均 1 分钟内回复</div>
    </aside>}
  </div>
}
