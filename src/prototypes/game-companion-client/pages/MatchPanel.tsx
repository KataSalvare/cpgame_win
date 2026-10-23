import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Headphones, Maximize2, Minimize2, Plus, Search, Swords, UserRound, UsersRound, X } from 'lucide-react'
import type { useMatchLogic } from '../hooks/useMatchLogic'
import { companions, games } from '../data/mockData'
import { AvatarMark } from '../components/AvatarMark'

type MatchLogic = ReturnType<typeof useMatchLogic>

type Props = {
  open: boolean
  matching: boolean
  logic: MatchLogic
  onMinimize: () => void
  onRestore: () => void
  onStartMatching: () => void
  onGoToVoiceRoom: () => void
  onCancel: () => void
  onChooseCompanions: (companionIds: string[]) => void
}

export function MatchPanel({ open, matching, logic, onMinimize, onRestore, onStartMatching, onGoToVoiceRoom, onCancel, onChooseCompanions }: Props) {
  const [dialog, setDialog] = useState<'price' | 'cancel' | null>(null)
  const [priceInput, setPriceInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [candidatesReady, setCandidatesReady] = useState(false)
  const [clubPickerOpen, setClubPickerOpen] = useState(false)
  const [clubSearch, setClubSearch] = useState('')
  const [canScrollGamesLeft, setCanScrollGamesLeft] = useState(false)
  const [canScrollGamesRight, setCanScrollGamesRight] = useState(true)
  const [miniPosition, setMiniPosition] = useState<{ left: number; top: number } | null>(null)
  const [miniDragging, setMiniDragging] = useState(false)
  const gameListRef = useRef<HTMLDivElement>(null)
  const clubPickerRef = useRef<HTMLDivElement>(null)
  const matchHostRef = useRef<HTMLDivElement>(null)
  const miniDragRef = useRef<{ pointerId: number; startX: number; startY: number; left: number; top: number; moved: boolean } | null>(null)
  const selectedGame = games.find((game) => game.id === logic.gameId)
  const club = logic.availableClubs.find((item) => item.id === logic.clubId)
  const filteredClubs = logic.availableClubs.filter((item) => item.name.toLocaleLowerCase().includes(clubSearch.trim().toLocaleLowerCase()))
  const expectedCount = logic.people === '双陪' ? 2 : 1
  const candidates = companions.filter((companion) => {
    if (companion.clubId !== logic.clubId || !companion.gameIds.includes(logic.gameId)) return false
    if (logic.gender !== '不限' && companion.gender !== logic.gender) return false
    return true
  })
  const hasCandidateList = candidatesReady && candidates.length > 0

  const startMiniDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const host = matchHostRef.current
    const card = event.currentTarget
    if (!host) return
    const hostRect = host.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const left = miniPosition?.left ?? cardRect.left - hostRect.left
    const top = miniPosition?.top ?? cardRect.top - hostRect.top
    miniDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left, top, moved: false }
    card.setPointerCapture(event.pointerId)
    setMiniPosition({ left, top })
    setMiniDragging(true)
  }

  const moveMiniCard = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = miniDragRef.current
    const host = matchHostRef.current
    if (!drag || drag.pointerId !== event.pointerId || !host) return
    const card = event.currentTarget
    const maxLeft = Math.max(0, host.clientWidth - card.offsetWidth)
    const maxTop = Math.max(0, host.clientHeight - card.offsetHeight)
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) drag.moved = true
    setMiniPosition({ left: Math.min(maxLeft, Math.max(0, drag.left + deltaX)), top: Math.min(maxTop, Math.max(0, drag.top + deltaY)) })
  }

  const finishMiniDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = miniDragRef.current
    if (drag?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setMiniDragging(false)
  }

  const activateMiniCard = () => {
    if (miniDragRef.current?.moved) {
      miniDragRef.current = null
      return
    }
    miniDragRef.current = null
    onRestore()
  }

  const handleMiniKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRestore()
    }
  }

  const toggleCandidate = (companionId: string) => setSelectedIds((current) => current.includes(companionId)
    ? current.filter((id) => id !== companionId)
    : current.length < expectedCount ? [...current, companionId] : current)

  const startMatching = () => {
    setCandidatesReady(false)
    setSelectedIds([])
    onStartMatching()
  }

  useEffect(() => {
    if (!matching) return
    const timeout = window.setTimeout(() => setCandidatesReady(true), 3000)
    return () => window.clearTimeout(timeout)
  }, [matching])

  const updateGameScrollButtons = () => {
    const list = gameListRef.current
    if (!list) return
    setCanScrollGamesLeft(list.scrollLeft > 1)
    setCanScrollGamesRight(list.scrollLeft + list.clientWidth < list.scrollWidth - 1)
  }

  useEffect(() => {
    const closePickerOutside = (event: PointerEvent) => {
      if (clubPickerRef.current && !clubPickerRef.current.contains(event.target as Node)) setClubPickerOpen(false)
    }
    document.addEventListener('pointerdown', closePickerOutside)
    return () => document.removeEventListener('pointerdown', closePickerOutside)
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(updateGameScrollButtons)
    return () => cancelAnimationFrame(frame)
  }, [open, matching])

  const showMiniCard = !open && matching

  return <div ref={matchHostRef} className={`match-panel-host${showMiniCard ? ' is-minimized' : !open ? ' is-hidden' : ''}`} aria-hidden={!open && !showMiniCard}>
    {showMiniCard && <div
      className={`match-mini-card${miniDragging ? ' is-dragging' : ''}${hasCandidateList ? ' is-ready' : ''}`}
      style={miniPosition ? { left: miniPosition.left, top: miniPosition.top, right: 'auto' } : undefined}
      role="button"
      tabIndex={0}
      aria-label={`${hasCandidateList ? '等待选人' : '匹配中'}，点击恢复匹配面板`}
      onPointerDown={startMiniDrag}
      onPointerMove={moveMiniCard}
      onPointerUp={finishMiniDrag}
      onPointerCancel={finishMiniDrag}
      onClick={activateMiniCard}
      onKeyDown={handleMiniKeyDown}
    >
      <span className="match-mini-card__icon"><Swords size={16} /></span>
      <span className="match-mini-card__content"><strong>{hasCandidateList ? '等待选人' : '匹配中'}</strong><small>{hasCandidateList ? `已匹配到 ${candidates.length} 位陪玩 · 已选 ${selectedIds.length}/${expectedCount}` : '正在为你寻找合适的陪玩'}</small></span>
      <Maximize2 className="match-mini-card__restore" size={15} aria-hidden="true" />
    </div>}
    {open && <section className="match-panel" aria-label={matching ? '匹配中' : '一键匹配'}>
      <header className="match-panel__header">
        <div className="match-panel__title-icon"><Swords size={18} /></div>
        <div className="match-panel__heading"><h2>{matching ? '匹配中' : '一键匹配'}</h2><p>{matching ? '正在为你寻找合适的陪玩' : '选择游戏和服务条件，快速找到陪玩'}</p></div>
        <button type="button" className="windows-icon-button" aria-label="最小化匹配面板" title="最小化" onClick={onMinimize}><Minimize2 size={16} /></button>
      </header>

      {matching ? <div className="match-panel__matching">
        <div className={`match-progress${candidatesReady ? ' match-progress--ready' : ''}`} role="status" aria-live="polite"><span className="match-progress__orbit"><span /><span /><span /></span><strong>{candidatesReady ? '已为你匹配到陪玩' : '正在匹配合适的陪玩'}</strong><small>{selectedGame?.name} · {club?.name} · {logic.people}</small></div>
        <div className="match-bid-card"><div><span>推荐单价</span><strong>{logic.recommendedUnitPrice.toLocaleString()} <small>钻石 / {logic.selectedService?.unit ?? '小时'}</small></strong></div><button type="button" className="client-button client-button--secondary" onClick={() => { setPriceInput(String(logic.addedPrice || '')); setDialog('price') }}><Plus size={15} />加价</button>{logic.addedPrice > 0 && <small className="match-bid-card__added">已加价 {logic.addedPrice} 钻石</small>}</div>
        {candidatesReady && <section className="match-found-list" aria-label="匹配到的陪玩">
          <header><strong><UsersRound size={15} />选择陪玩</strong><span>请选择 {expectedCount} 位</span></header>
          <div className="match-candidate-list">
            {candidates.map((companion) => <button type="button" key={companion.id} className={`match-candidate${selectedIds.includes(companion.id) ? ' is-selected' : ''}`} aria-pressed={selectedIds.includes(companion.id)} onClick={() => toggleCandidate(companion.id)}><AvatarMark initials={companion.initials} size="md" /><span className="match-candidate__info"><strong>{companion.name}<small>{companion.gender} · {companion.region}</small></strong><small>{companion.status} · {companion.tags.slice(0, 2).join(' · ')}</small></span><span className="match-candidate__check">{selectedIds.includes(companion.id) && <Check size={14} />}</span></button>)}
            {candidates.length === 0 && <div className="match-candidate-empty"><UserRound size={20} /><span>当前条件下没有可选陪玩</span></div>}
          </div>
        </section>}
        <div className="match-panel__matching-actions"><button type="button" className="client-button client-button--secondary" onClick={() => setDialog('cancel')}>取消匹配</button><button type="button" className="client-button client-button--primary" disabled={!candidatesReady || selectedIds.length !== expectedCount} onClick={() => onChooseCompanions(selectedIds)}>确认下单</button></div>
      </div> : <div className="match-panel__form">
        <section className="match-field match-field--wide" aria-label="选择游戏">
          <div className="match-game-heading"><span>游戏</span><div className="match-game-scroll-controls"><small>左右滑动浏览</small><button type="button" aria-label="向左滚动游戏列表" disabled={!canScrollGamesLeft} onClick={() => gameListRef.current?.scrollBy({ left: -180, behavior: 'smooth' })}><ChevronLeft size={14} /></button><button type="button" aria-label="向右滚动游戏列表" disabled={!canScrollGamesRight} onClick={() => gameListRef.current?.scrollBy({ left: 180, behavior: 'smooth' })}><ChevronRight size={14} /></button></div></div>
          <div className="match-game-list" ref={gameListRef} onScroll={updateGameScrollButtons} role="listbox" aria-label="游戏列表">
            {games.filter((game) => game.id !== 'all').map((game) => <button type="button" role="option" aria-selected={logic.gameId === game.id} key={game.id} className={`match-game-option${logic.gameId === game.id ? ' is-selected' : ''}`} onClick={() => { logic.chooseGame(game.id); setClubSearch(''); setClubPickerOpen(false) }}><span>{game.shortName}</span><strong>{game.name}</strong></button>)}
          </div>
        </section>
        <section className="match-field match-field--wide" aria-label="选择俱乐部" ref={clubPickerRef}>
          <span>俱乐部</span>
          <button type="button" className="match-club-trigger" aria-haspopup="listbox" aria-expanded={clubPickerOpen} onClick={() => { setClubPickerOpen((current) => !current); setClubSearch('') }}><span>{club?.name ?? '请选择俱乐部'}</span><ChevronDown size={14} /></button>
          {clubPickerOpen && <div className="match-club-dropdown">
            <label className="match-club-search"><Search size={14} /><input autoFocus type="search" value={clubSearch} onChange={(event) => setClubSearch(event.target.value)} placeholder="搜索俱乐部名称" aria-label="搜索俱乐部名称" /></label>
            <div className="match-club-list" role="listbox" aria-label="俱乐部列表">
              {filteredClubs.map((item) => <button type="button" role="option" aria-selected={logic.clubId === item.id} key={item.id} className={`match-club-option${logic.clubId === item.id ? ' is-selected' : ''}`} onClick={() => { logic.chooseClub(item.id); setClubPickerOpen(false); setClubSearch('') }}><strong>{item.name}</strong><small>{item.rating.toFixed(2)} 分 · {item.companionCount} 位陪玩</small></button>)}
              {filteredClubs.length === 0 && <p className="match-club-empty">没有找到相关俱乐部</p>}
            </div>
          </div>}
        </section>
        <div className="match-field"><span>是否试音</span><div className="match-choice-row" role="group" aria-label="是否试音">{(['否', '是'] as const).map((value) => <button type="button" key={value} className={`match-choice${logic.tryout === (value === '是') ? ' is-active' : ''}`} aria-pressed={logic.tryout === (value === '是')} onClick={() => logic.setTryout(value === '是')}>{value === '是' ? '试音' : '不试音'}</button>)}</div></div>
        <label className="match-field"><span>玩法</span><span className="match-select-wrap"><select value={logic.playName} onChange={(event) => logic.choosePlay(event.target.value)}>{logic.playOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={14} /></span></label>
        <label className="match-field"><span>等级</span><span className="match-select-wrap"><select value={logic.levelName} onChange={(event) => logic.chooseLevel(event.target.value)}>{logic.levelOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={14} /></span></label>
        <label className="match-field"><span>服务</span><span className="match-select-wrap"><select value={logic.selectedService?.id ?? ''} onChange={(event) => logic.setServiceId(event.target.value)}>{logic.serviceOptions.map((service) => <option key={`${service.gameId}-${service.playName}-${service.levelName}-${service.unit}-${service.price}`} value={service.id}>{service.price} 钻石 / {service.unit}</option>)}</select><ChevronDown size={14} /></span></label>
        <fieldset className="match-field match-field--fieldset"><legend>人数</legend><div className="match-choice-row">{(['单陪', '双陪'] as const).map((value) => <button type="button" key={value} className={`match-choice${logic.people === value ? ' is-active' : ''}`} aria-pressed={logic.people === value} onClick={() => logic.setPeople(value)}>{value}</button>)}</div></fieldset>
        <fieldset className="match-field match-field--fieldset"><legend>性别</legend><div className="match-choice-row">{(['不限', '男', '女'] as const).map((value) => <button type="button" key={value} className={`match-choice${logic.gender === value ? ' is-active' : ''}`} aria-pressed={logic.gender === value} onClick={() => logic.setGender(value)}>{value}</button>)}</div></fieldset>
        <label className="match-field"><span>数量</span><span className="match-select-wrap"><select value={logic.quantity} onChange={(event) => logic.setQuantity(Number(event.target.value))}>{[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} {logic.selectedService?.unit ?? '小时'}</option>)}</select><ChevronDown size={14} /></span></label>
        <label className="match-field match-field--remark"><span>备注</span><textarea value={logic.remark} onChange={(event) => logic.setRemark(event.target.value)} rows={2} placeholder="补充你的游戏偏好或需求" /></label>
        <div className="match-panel__price"><span>推荐单价</span><strong>{logic.recommendedUnitPrice.toLocaleString()} <small>钻石 / {logic.selectedService?.unit ?? '小时'}</small></strong><span className="match-panel__price-hint">{logic.people === '双陪' ? '双陪单价按两位陪玩计算' : `${logic.selectedService?.playName ?? '当前服务'} · ${logic.selectedService?.levelName ?? ''}`}</span></div>
        <button type="button" className="client-button client-button--primary match-panel__submit" disabled={!logic.selectedService || !club} onClick={() => logic.tryout ? onGoToVoiceRoom() : startMatching()}>{logic.tryout ? <><Headphones size={16} />前往语音房试音</> : <><Search size={16} />开始匹配</>}</button>
      </div>}

      {dialog === 'price' && <div className="match-dialog-scrim"><section className="match-dialog" role="dialog" aria-modal="true" aria-labelledby="match-price-title"><header><h3 id="match-price-title">加价</h3><button type="button" className="windows-icon-button" aria-label="关闭" onClick={() => setDialog(null)}><X size={15} /></button></header><p>提高本次匹配的单价。</p><label>加价金额（钻石）<input type="number" min="1" step="1" value={priceInput} onChange={(event) => setPriceInput(event.target.value)} placeholder="请输入金额" /></label><footer><button type="button" className="client-button client-button--secondary" onClick={() => setDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" disabled={!Number.isInteger(Number(priceInput)) || Number(priceInput) <= 0} onClick={() => { logic.setAddedPrice(Number(priceInput)); setDialog(null) }}>确认加价</button></footer></section></div>}
      {dialog === 'cancel' && <div className="match-dialog-scrim"><section className="match-dialog" role="dialog" aria-modal="true" aria-labelledby="match-cancel-title"><header><h3 id="match-cancel-title">取消匹配</h3><button type="button" className="windows-icon-button" aria-label="关闭" onClick={() => setDialog(null)}><X size={15} /></button></header><p>确定取消当前匹配并返回首页吗？</p><footer><button type="button" className="client-button client-button--secondary" onClick={() => setDialog(null)}>继续匹配</button><button type="button" className="client-button client-button--primary" onClick={() => { setDialog(null); onCancel() }}>确认取消</button></footer></section></div>}
    </section>}
  </div>
}
