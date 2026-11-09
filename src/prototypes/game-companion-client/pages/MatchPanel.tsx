import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Check, ChevronDown, ChevronRight, Headphones, Mars, Maximize2, Minimize2, Plus, Search, Swords, UserRound, UsersRound, Venus, X } from 'lucide-react'
import type { useMatchLogic } from '../hooks/useMatchLogic'
import { registerOverlayReveal } from '@/lib/overlayReveal'
import { companions, games } from '../data/mockData'
import { quickMatchCompanions } from '../data/quickMatchMockData'
import { AvatarMark } from '../components/AvatarMark'
import { UserNameWithLevel } from '../components/UserNameWithLevel'
import { GameFilter } from '../components/GameFilter'
import noticeImageOne from '../assets/profile-life-photo-city.svg'
import noticeImageTwo from '../assets/profile-life-photo-cafe.svg'
import noticeImageThree from '../assets/profile-life-photo-window.svg'

type MatchLogic = ReturnType<typeof useMatchLogic>
type NoticeTab = 'tab1' | 'tab2' | 'tab3'

const matchNoticePreferenceKey = 'game-companion-client:skip-match-notice'

function shouldSkipMatchNotice() {
  try { return window.sessionStorage.getItem(matchNoticePreferenceKey) === 'true' } catch { return false }
}

type Props = {
  open: boolean
  matching: boolean
  logic: MatchLogic
  onMinimize: () => void
  onRestore: () => void
  onCandidatesAvailable: (available: boolean) => void
  onStartMatching: () => void
  onGoToVoiceRoom: () => void
  onCancel: () => void
  onChooseCompanions: (companionIds: string[]) => void
}

export function MatchPanel({ open, matching, logic, onMinimize, onRestore, onCandidatesAvailable, onStartMatching, onGoToVoiceRoom, onCancel, onChooseCompanions }: Props) {
  const [dialog, setDialog] = useState<'price' | 'cancel' | 'notice' | null>(null)
  const [noticeTab, setNoticeTab] = useState<NoticeTab>('tab1')
  const [dontRemind, setDontRemind] = useState(false)
  const [skipNotice, setSkipNotice] = useState(shouldSkipMatchNotice)
  const [priceInput, setPriceInput] = useState('')
  const [quantityInput, setQuantityInput] = useState(String(logic.quantity))
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [candidatesReady, setCandidatesReady] = useState(false)
  const [clubPickerOpen, setClubPickerOpen] = useState(false)
  const [servicePickerOpen, setServicePickerOpen] = useState(false)
  const [clubSearch, setClubSearch] = useState('')
  const [miniPosition, setMiniPosition] = useState<{ left: number; top: number } | null>(null)
  const [miniDragging, setMiniDragging] = useState(false)
  const [matchPanelPosition, setMatchPanelPosition] = useState<{ left: number; top: number } | null>(null)
  const [matchPanelDragging, setMatchPanelDragging] = useState(false)
  const clubPickerRef = useRef<HTMLDivElement>(null)
  const servicePickerRef = useRef<HTMLDivElement>(null)
  const matchHostRef = useRef<HTMLDivElement>(null)
  const miniDragRef = useRef<{ pointerId: number; startX: number; startY: number; left: number; top: number; moved: boolean } | null>(null)
  const matchPanelDragRef = useRef<{ pointerId: number; startX: number; startY: number; left: number; top: number; scaleX: number; scaleY: number } | null>(null)
  const selectedGame = games.find((game) => game.id === logic.gameId)
  const club = logic.availableClubs.find((item) => item.id === logic.clubId)
  const filteredClubs = logic.availableClubs.filter((item) => item.name.toLocaleLowerCase().includes(clubSearch.trim().toLocaleLowerCase()))
  const expectedCount = logic.peopleCount
  const validQuantity = /^\d+$/.test(quantityInput) && Number(quantityInput) >= 1
  const candidates = [...companions, ...quickMatchCompanions].filter((companion) => {
    if (companion.clubId !== logic.clubId || !companion.gameIds.includes(logic.gameId)) return false
    if (logic.gender !== '不限' && companion.gender !== logic.gender) return false
    return true
  })
  const hasCandidateList = matching && candidatesReady && candidates.length > 0

  useEffect(() => { onCandidatesAvailable(hasCandidateList) }, [hasCandidateList, onCandidatesAvailable])

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

  const startMatchPanelDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return
    const host = matchHostRef.current
    const panel = event.currentTarget.parentElement
    if (!host || !panel) return
    const hostRect = host.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const left = matchPanelPosition?.left ?? panelRect.left - hostRect.left
    const top = matchPanelPosition?.top ?? panelRect.top - hostRect.top
    matchPanelDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left,
      top,
      scaleX: hostRect.width / host.clientWidth || 1,
      scaleY: hostRect.height / host.clientHeight || 1,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setMatchPanelPosition({ left, top })
    setMatchPanelDragging(true)
  }

  const moveMatchPanel = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = matchPanelDragRef.current
    const host = matchHostRef.current
    const panel = event.currentTarget.parentElement
    if (!drag || drag.pointerId !== event.pointerId || !host || !panel) return
    const maxLeft = Math.max(0, host.clientWidth - panel.offsetWidth)
    const maxTop = Math.max(0, host.clientHeight - panel.offsetHeight)
    setMatchPanelPosition({
      left: Math.min(maxLeft, Math.max(0, drag.left + (event.clientX - drag.startX) / drag.scaleX)),
      top: Math.min(maxTop, Math.max(0, drag.top + (event.clientY - drag.startY) / drag.scaleY)),
    })
  }

  const finishMatchPanelDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (matchPanelDragRef.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    matchPanelDragRef.current = null
    setMatchPanelDragging(false)
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

  const stepQuantity = (delta: number) => {
    const nextQuantity = Math.max(1, logic.quantity + delta)
    logic.setQuantity(nextQuantity)
    setQuantityInput(String(nextQuantity))
  }

  const startMatching = () => {
    setCandidatesReady(false)
    setSelectedIds([])
    onStartMatching()
  }

  const beginMatching = () => {
    if (skipNotice) {
      startMatching()
      return
    }
    setNoticeTab('tab1')
    setDontRemind(false)
    setDialog('notice')
  }

  const agreeAndContinue = () => {
    if (dontRemind) {
      try { window.sessionStorage.setItem(matchNoticePreferenceKey, 'true') } catch { /* Keep the preference for this page session. */ }
      setSkipNotice(true)
    }
    setDialog(null)
    startMatching()
  }

  useEffect(() => {
    if (!matching) return
    const timeout = window.setTimeout(() => setCandidatesReady(true), 3000)
    return () => window.clearTimeout(timeout)
  }, [matching])

  useEffect(() => {
    if (!clubPickerOpen) return
    const closePickerOutside = (event: PointerEvent) => {
      if (clubPickerRef.current && !clubPickerRef.current.contains(event.target as Node)) setClubPickerOpen(false)
    }
    document.addEventListener('pointerdown', closePickerOutside)
    return () => document.removeEventListener('pointerdown', closePickerOutside)
  }, [clubPickerOpen])

  useEffect(() => {
    if (!servicePickerOpen) return
    const closePickerOutside = (event: PointerEvent) => {
      if (servicePickerRef.current && !servicePickerRef.current.contains(event.target as Node)) setServicePickerOpen(false)
    }
    document.addEventListener('pointerdown', closePickerOutside)
    return () => document.removeEventListener('pointerdown', closePickerOutside)
  }, [servicePickerOpen])

  // 批注定位：注册浮层各状态的展开方式，供工具层从「标注说明」点击时恢复
  useEffect(() => {
    const restoreToMatching = () => {
      onRestore()
      onStartMatching()
      setCandidatesReady(true)
    }
    const unregister = [
      registerOverlayReveal('quick-match-matching', restoreToMatching, { hints: ['match-panel__matching'] }),
      registerOverlayReveal('quick-match-notice', () => {
        onRestore()
        setDialog('notice')
      }, { hints: ['match-notice', 'match-dialog--notice'] }),
      registerOverlayReveal('quick-match-price', () => {
        restoreToMatching()
        setDialog('price')
      }, { hints: ['match-price'] }),
      registerOverlayReveal('quick-match-cancel', () => {
        restoreToMatching()
        setDialog('cancel')
      }, { hints: ['match-cancel'] }),
    ]
    return () => unregister.forEach((unregisterOne) => unregisterOne())
  }, [onRestore, onStartMatching])

  const showMiniCard = !open && matching

  return <div ref={matchHostRef} data-reveal-overlay={matching ? 'quick-match-matching' : 'quick-match'} className={`match-panel-host${showMiniCard ? ' is-minimized' : !open ? ' is-hidden' : ''}`} aria-hidden={!open && !showMiniCard}>
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
      <span className="match-mini-card__content"><strong>{hasCandidateList ? '等待选人' : '匹配中'}</strong>{hasCandidateList && <small>已匹配 {candidates.length} 位</small>}</span>
      <Maximize2 className="match-mini-card__restore" size={15} aria-hidden="true" />
    </div>}
    {open && <section className={`match-panel${matchPanelDragging ? ' is-dragging' : ''}`} style={matchPanelPosition ? { left: matchPanelPosition.left, top: matchPanelPosition.top, right: 'auto' } : undefined} aria-label={matching ? '匹配中' : '一键匹配'}>
      <header className="match-panel__header is-draggable" onPointerDown={startMatchPanelDrag} onPointerMove={moveMatchPanel} onPointerUp={finishMatchPanelDrag} onPointerCancel={finishMatchPanelDrag}>
        <div className="match-panel__title-icon"><Swords size={18} /></div>
        <div className="match-panel__heading"><h2>{matching ? '匹配中' : '一键匹配'}</h2></div>
        <button type="button" className="windows-icon-button" aria-label="最小化匹配面板" title="最小化" onClick={onMinimize}><Minimize2 size={16} /></button>
      </header>

      {matching ? <div className="match-panel__matching">
        <div className={`match-progress${candidatesReady ? ' match-progress--ready' : ''}`} role="status" aria-live="polite"><span className="match-progress__orbit"><span /><span /><span /></span><strong>{candidatesReady ? '已为你匹配到陪玩' : '正在匹配合适的陪玩'}</strong><small>{selectedGame?.name} · {club?.name} · {logic.people}</small></div>
        <div className="match-bid-card"><div><span>推荐单价</span><strong>{logic.recommendedUnitPriceLabel} <small>金豆 / {logic.selectedService?.unit ?? '小时'}</small></strong></div><button type="button" className="client-button client-button--secondary" onClick={() => { setPriceInput(String(logic.addedPrice || '')); setDialog('price') }}><Plus size={15} />加价</button>{logic.addedPrice > 0 && <small className="match-bid-card__added">已加价 {logic.addedPrice} 金豆</small>}</div>
        {candidatesReady && <section className="match-found-list" aria-label="匹配到的陪玩">
          <header><strong><UsersRound size={15} />选择陪玩</strong><span>已选 {selectedIds.length}/{expectedCount}</span></header>
          <div className="match-candidate-list">
            {candidates.map((companion) => <button type="button" key={companion.id} className={`match-candidate${selectedIds.includes(companion.id) ? ' is-selected' : ''}`} aria-pressed={selectedIds.includes(companion.id)} onClick={() => toggleCandidate(companion.id)}><AvatarMark initials={companion.initials} size="md" /><span className="match-candidate__info"><strong><UserNameWithLevel name={companion.name} identityId={companion.id} /><small className="match-candidate__demographics" aria-label={`性别${companion.gender}，${companion.age}岁`}>{companion.gender === '女' ? <Venus size={12} aria-hidden="true" /> : <Mars size={12} aria-hidden="true" />}{companion.age}</small></strong><small>{companion.status} · {companion.tags.slice(0, 2).join(' · ')}</small></span><span className="match-candidate__check">{selectedIds.includes(companion.id) && <Check size={14} />}</span></button>)}
            {candidates.length === 0 && <div className="match-candidate-empty"><UserRound size={20} /><span>当前条件下没有可选陪玩</span></div>}
          </div>
        </section>}
        <div className="match-panel__matching-actions"><button type="button" className="client-button client-button--secondary" onClick={() => setDialog('cancel')}>取消匹配</button><button type="button" className="client-button client-button--primary" disabled={!candidatesReady || selectedIds.length !== expectedCount} onClick={() => onChooseCompanions(selectedIds)}>确认下单</button></div>
      </div> : <div className="match-panel__form">
        <section className="match-field match-field--wide" aria-label="选择游戏">
          <GameFilter gameId={logic.gameId} includeAll={false} label="匹配游戏筛选" onSelect={(gameId) => { logic.chooseGame(gameId); setClubSearch(''); setClubPickerOpen(false); setServicePickerOpen(false) }} />
        </section>
        <section className="match-field match-field--wide" aria-label="选择俱乐部" ref={clubPickerRef} onKeyDown={(event) => { if (event.key === 'Escape') setClubPickerOpen(false) }}>
          <span>俱乐部</span>
          <div className="match-club-browser">
            <div className="match-club-strip" role="group" aria-label="匹配俱乐部">
              {logic.availableClubs.map((item) => <button type="button" key={item.id} className={`match-club-strip__option${logic.clubId === item.id ? ' is-selected' : ''}`} aria-pressed={logic.clubId === item.id} onClick={() => logic.chooseClub(item.id)}><AvatarMark initials={item.initials} size="sm" /><span>{item.name}</span></button>)}
            </div>
            <button type="button" className={`match-club-expand${clubPickerOpen ? ' is-open' : ''}`} aria-label={clubPickerOpen ? '收起全部俱乐部' : '展开全部俱乐部'} aria-expanded={clubPickerOpen} aria-controls="match-club-popover" onClick={() => { setClubPickerOpen((open) => !open); setClubSearch('') }}><ChevronDown size={17} aria-hidden="true" /></button>
            {clubPickerOpen && <div id="match-club-popover" className="match-club-popover" role="group" aria-label="全部俱乐部">
              <label className="match-club-search"><Search size={14} /><input autoFocus type="search" value={clubSearch} onChange={(event) => setClubSearch(event.target.value)} placeholder="搜索俱乐部名称" aria-label="搜索俱乐部名称" /></label>
              <div className="match-club-list" role="listbox" aria-label="俱乐部列表">
                {filteredClubs.map((item) => <button type="button" role="option" aria-selected={logic.clubId === item.id} key={item.id} className={`match-club-option${logic.clubId === item.id ? ' is-selected' : ''}`} onClick={() => { logic.chooseClub(item.id); setClubPickerOpen(false); setClubSearch(''); setServicePickerOpen(false) }}><AvatarMark initials={item.initials} size="md" /><strong>{item.name}</strong></button>)}
                {filteredClubs.length === 0 && <p className="match-club-empty">没有找到相关俱乐部</p>}
              </div>
            </div>}
          </div>
        </section>
        <div className="match-field"><span>是否试音</span><div className="match-choice-row" role="group" aria-label="是否试音">{(['否', '是'] as const).map((value) => <button type="button" key={value} className={`match-choice${logic.tryout === (value === '是') ? ' is-active' : ''}`} aria-pressed={logic.tryout === (value === '是')} onClick={() => logic.setTryout(value === '是')}>{value === '是' ? '试音' : '不试音'}</button>)}</div></div>
        <section className="match-field match-field--wide match-service-field" aria-label="选择服务" ref={servicePickerRef} onKeyDown={(event) => { if (event.key === 'Escape') setServicePickerOpen(false) }}>
          <span>选择服务</span>
          <button type="button" className="match-service-trigger" aria-haspopup="dialog" aria-expanded={servicePickerOpen} onClick={() => setServicePickerOpen((open) => !open)}><span>{logic.selectedService ? `${logic.playName} · ${logic.levelName} · ${logic.selectedService.unit}服务 · ${logic.selectedService.price} 金豆` : '请选择您想要下单的服务'}</span><ChevronDown size={14} /></button>
          {servicePickerOpen && <div className="match-service-cascade" role="dialog" aria-label="玩法、等级和服务级联选择">
            <section className="match-service-cascade__column" role="listbox" aria-label="玩法">
              {logic.playOptions.map((option) => <button type="button" role="option" aria-selected={logic.playName === option} key={option} className={`match-service-cascade__option${logic.playName === option ? ' is-selected' : ''}`} onClick={() => logic.choosePlay(option)}><span>{option}</span><ChevronRight size={13} /></button>)}
            </section>
            <section className="match-service-cascade__column" role="listbox" aria-label="等级">
              {logic.levelOptions.length ? logic.levelOptions.map((option) => <button type="button" role="option" aria-selected={logic.levelName === option} key={option} className={`match-service-cascade__option${logic.levelName === option ? ' is-selected' : ''}`} onClick={() => logic.chooseLevel(option)}><span>{option}</span><ChevronRight size={13} /></button>) : <p className="match-service-cascade__empty">选择玩法</p>}
            </section>
            <section className="match-service-cascade__column" role="listbox" aria-label="服务">
              {logic.serviceOptions.length ? logic.serviceOptions.map((service) => <button type="button" role="option" aria-selected={logic.selectedService?.id === service.id} key={service.id} className={`match-service-cascade__option${logic.selectedService?.id === service.id ? ' is-selected' : ''}`} onClick={() => { logic.setServiceId(service.id); setServicePickerOpen(false) }}><span>{service.unit}服务 · {service.price} 金豆</span></button>) : <p className="match-service-cascade__empty">选择等级</p>}
            </section>
          </div>}
        </section>
        <fieldset className="match-field match-field--fieldset match-field--gender"><legend>性别</legend><div className="match-choice-row match-choice-row--match-width">{(['不限', '男', '女'] as const).map((value) => <button type="button" key={value} className={`match-choice${logic.gender === value ? ' is-active' : ''}`} aria-pressed={logic.gender === value} onClick={() => logic.setGender(value)}>{value}</button>)}</div></fieldset>
        <fieldset className="match-field match-field--fieldset match-field--people"><legend>人数</legend><div className="match-choice-row match-choice-row--match-width">{(['单陪', '双陪', '选项数量后台配置'] as const).map((value) => <button type="button" key={value} className={`match-choice${logic.people === value ? ' is-active' : ''}`} aria-pressed={logic.people === value} onClick={() => logic.setPeople(value)}>{value}</button>)}</div></fieldset>
        <label className="match-field"><span>数量</span><span className="match-quantity-field"><span className="match-quantity-control"><button type="button" aria-label="减少数量" disabled={logic.quantity <= 1} onClick={() => stepQuantity(-1)}>−</button><input type="number" min="1" step="1" inputMode="numeric" aria-label={`数量，${logic.selectedService?.unit ?? '小时'}`} aria-invalid={!validQuantity} value={quantityInput} onChange={(event) => { const value = event.target.value; setQuantityInput(value); if (/^\d+$/.test(value) && Number(value) >= 1) logic.setQuantity(Number(value)) }} onBlur={() => { if (!validQuantity) setQuantityInput(String(logic.quantity)) }} /><button type="button" aria-label="增加数量" onClick={() => stepQuantity(1)}>+</button></span><span className="match-quantity-unit">{logic.selectedService?.unit ?? '小时'}</span></span>{!validQuantity && <small className="match-quantity-error" role="alert">请输入大于 0 的整数</small>}</label>
        <label className="match-field match-field--remark"><span>备注</span><textarea value={logic.remark} onChange={(event) => logic.setRemark(event.target.value)} rows={2} placeholder="补充你的游戏偏好或需求" /></label>
        <div className="match-panel__price"><span>推荐单价</span><strong>{logic.recommendedUnitPriceLabel} <small>金豆 / {logic.selectedService?.unit ?? '小时'}</small></strong>{logic.peopleCount > 1 && <span className="match-panel__price-hint">{logic.people} ×{logic.peopleCount}</span>}</div>
        <button type="button" className="client-button client-button--primary match-panel__submit" disabled={!logic.playName || !logic.levelName || !logic.selectedService || !club || !validQuantity} onClick={() => logic.tryout ? onGoToVoiceRoom() : beginMatching()}>{logic.tryout ? <><Headphones size={16} />前往语音房试音</> : <><Search size={16} />开始匹配</>}</button>
      </div>}

      {dialog === 'notice' && <div className="match-dialog-scrim" data-reveal-overlay="quick-match-notice"><section className="match-dialog match-dialog--notice" role="dialog" aria-modal="true" aria-labelledby="match-notice-title">
        <header><div><h3 id="match-notice-title">下单须知</h3></div><button type="button" className="windows-icon-button" aria-label="关闭下单须知" onClick={() => setDialog(null)}><X size={15} /></button></header>
        <div className="match-notice-tabs" role="tablist" aria-label="下单须知内容">
          {([{ id: 'tab1', label: '后台配置TAB1' }, { id: 'tab2', label: '后台配置TAB2' }, { id: 'tab3', label: '后台配置TAB3' }] as const).map((tab) => <button type="button" role="tab" id={`match-notice-tab-${tab.id}`} aria-selected={noticeTab === tab.id} aria-controls="match-notice-panel" tabIndex={noticeTab === tab.id ? 0 : -1} key={tab.id} onClick={() => setNoticeTab(tab.id)}>{tab.label}</button>)}
        </div>
        <div className="match-notice-panel" id="match-notice-panel" role="tabpanel" aria-labelledby={`match-notice-tab-${noticeTab}`}>
          <figure className="match-notice-content"><img src={{ tab1: noticeImageOne, tab2: noticeImageTwo, tab3: noticeImageThree }[noticeTab]} alt="" /><figcaption>{({ tab1: '在熟悉的风景里，发现日常中的小小灵感。', tab2: '给热爱的事情留一点时间，让每一刻都轻松自在。', tab3: '换个角度看世界，也许会遇见新的惊喜。' })[noticeTab]}</figcaption></figure>
        </div>
        <footer className="match-notice-footer"><label className="match-notice-remember"><input type="checkbox" checked={dontRemind} onChange={(event) => setDontRemind(event.target.checked)} />不再提醒</label><button type="button" className="client-button client-button--primary" onClick={agreeAndContinue}>同意并继续</button></footer>
      </section></div>}
      {dialog === 'price' && <div className="match-dialog-scrim" data-reveal-overlay="quick-match-price"><section className="match-dialog" role="dialog" aria-modal="true" aria-labelledby="match-price-title"><header><h3 id="match-price-title">加价</h3><button type="button" className="windows-icon-button" aria-label="关闭" onClick={() => setDialog(null)}><X size={15} /></button></header><p>提高本次匹配的单价。</p><label>加价金额（金豆）<input type="number" min="1" step="1" value={priceInput} onChange={(event) => setPriceInput(event.target.value)} placeholder="请输入金额" /></label><footer><button type="button" className="client-button client-button--secondary" onClick={() => setDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" disabled={!Number.isInteger(Number(priceInput)) || Number(priceInput) <= 0} onClick={() => { logic.setAddedPrice(Number(priceInput)); setDialog(null) }}>确认加价</button></footer></section></div>}
      {dialog === 'cancel' && <div className="match-dialog-scrim" data-reveal-overlay="quick-match-cancel"><section className="match-dialog" role="dialog" aria-modal="true" aria-labelledby="match-cancel-title"><header><h3 id="match-cancel-title">取消匹配</h3><button type="button" className="windows-icon-button" aria-label="关闭" onClick={() => setDialog(null)}><X size={15} /></button></header><p>确定取消当前匹配并返回首页吗？</p><footer><button type="button" className="client-button client-button--secondary" onClick={() => setDialog(null)}>继续匹配</button><button type="button" className="client-button client-button--primary" onClick={() => { setDialog(null); onCancel() }}>确认取消</button></footer></section></div>}
    </section>}
  </div>
}
