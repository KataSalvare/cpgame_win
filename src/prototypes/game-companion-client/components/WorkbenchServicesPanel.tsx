import { useState } from 'react'
import { ChevronRight, Plus, X } from 'lucide-react'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import { games } from '../data/mockData'

function ServiceSwitch({ label, checked, disabled = false, onToggle }: { label: string; checked: boolean; disabled?: boolean; onToggle: () => void }) {
  return <button type="button" role="switch" aria-label={label} aria-checked={checked} disabled={disabled} className="workbench-service-switch" onClick={onToggle}><span /></button>
}

export function WorkbenchServicesPanel({ logic: w }: { logic: WorkbenchLogic }) {
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [applicationGameId, setApplicationGameId] = useState('')
  const [applicationPlay, setApplicationPlay] = useState('')
  const [applicationLevel, setApplicationLevel] = useState('')
  const [applicationServiceId, setApplicationServiceId] = useState('')
  const applicationGames = [...new Set(w.serviceApplicationOptions.map(service => service.gameId))].map(id => games.find(item => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
  const gameOptions = w.serviceApplicationOptions.filter(service => service.gameId === applicationGameId)
  const plays = [...new Set(gameOptions.map(service => service.playName))]
  const levelOptions = gameOptions.filter(service => service.playName === applicationPlay)
  const levels = [...new Set(levelOptions.map(service => service.levelName))]
  const availableServices = levelOptions.filter(service => service.levelName === applicationLevel)
  const openApplication = () => {
    const firstGame = applicationGames[0]?.id ?? ''
    setApplicationGameId(firstGame)
    setApplicationPlay('')
    setApplicationLevel('')
    setApplicationServiceId('')
    setApplicationOpen(true)
  }
  const chooseService = (id: string) => {
    const option = w.serviceApplicationOptions.find(service => service.id === id)
    if (!option) return
    setApplicationServiceId(id)
    setApplicationPlay(option.playName)
    setApplicationLevel(option.levelName)
  }
  const game = w.serviceGroups.find(g => g.id === w.selectedServiceGameId) ?? w.serviceGroups[0]
  if (!game) return <section className="client-card account-empty-inline"><strong>暂无可管理的服务</strong><button type="button" className="client-button client-button--primary" onClick={openApplication}><Plus size={16} />申请服务</button></section>
  return <section className="client-card workbench-services-panel" aria-label="接单服务管理">
    <header className="workbench-services-heading"><button type="button" className="client-button client-button--secondary" onClick={openApplication}><Plus size={16} />申请服务</button></header>
    <nav className="workbench-services-games prototype-content-scroll" aria-label="选择服务游戏">
      {w.serviceGroups.map(g => <button type="button" key={g.id} className={g.id === game.id ? 'is-active' : ''} aria-current={g.id === game.id ? 'true' : undefined} onClick={() => w.setSelectedServiceGameId(g.id)}>{g.name}</button>)}
    </nav>
    <div key={game.id} className="workbench-services-content prototype-content-scroll" role="region" aria-label={`${game.name}接单服务`} tabIndex={0}>
      {game.plays.map(play => <section className="workbench-service-play" key={play.name}>
        <h3>{play.name}</h3>
        {play.levels.map(level => {
          const levelEnabled = w.enabledLevelKeys.includes(level.key)
          const hasPending = level.services.some(service => service.applicationStatus === '待审核')
          const expanded = w.expandedLevelKeys.includes(level.key)
          const optionsId = `service-options-${level.services[0].id}`
          return <section className="workbench-service-level" key={level.key} aria-label={`${play.name} · ${level.name}`}>
            <header><h4><button type="button" className="workbench-level-disclosure" aria-label={`${level.name}服务`} aria-expanded={expanded} aria-controls={expanded ? optionsId : undefined} disabled={!levelEnabled && !hasPending} onClick={() => w.toggleLevelExpanded(level.key)}><ChevronRight size={16} /><span>{level.name}</span></button></h4><div className="workbench-service-level-toggle"><span>接单</span><ServiceSwitch label={`${game.name} ${play.name} ${level.name}接单`} checked={levelEnabled} disabled={!level.services.some(service => !service.applicationStatus)} onToggle={() => w.toggleLevel(level.key)} /></div></header>
            <div id={optionsId} className="workbench-service-options" hidden={!expanded}>
              {level.services.map(service => <div className={`workbench-service-option${service.applicationStatus ? ' is-pending' : ''}`} key={service.id}><span>{service.name}</span><span className="workbench-service-option-price">{service.price} 钻石 / {service.unit}</span>{service.applicationStatus ? <span className="workbench-service-pending">{service.applicationStatus}</span> : <ServiceSwitch label={`${game.name} ${play.name} ${level.name} ${service.name}接单`} checked={w.serviceSelections.includes(service.id)} disabled={!levelEnabled} onToggle={() => w.toggleService(service.id)} />}</div>)}
            </div>
          </section>
        })}
      </section>)}
    </div>
    {applicationOpen && <div className="workbench-overlay" data-overlay="workbench-service-application" onClick={event => { if (event.target === event.currentTarget) setApplicationOpen(false) }}><section className="client-card workbench-dialog workbench-service-application-dialog" role="dialog" aria-modal="true" aria-labelledby="workbench-service-application-title"><header><h2 id="workbench-service-application-title">申请服务</h2><button type="button" className="workbench-dialog-close" aria-label="关闭" onClick={() => setApplicationOpen(false)}><X size={20} /></button></header><p>选择你要申请的游戏服务，提交后等待后台审核。</p><div className="workbench-service-cascade" aria-label="选择游戏、玩法、等级和服务">
      <section><h3>游戏</h3>{applicationGames.map(item => <button type="button" className={applicationGameId === item.id ? 'is-selected' : ''} key={item.id} onClick={() => { setApplicationGameId(item.id); setApplicationPlay(''); setApplicationLevel(''); setApplicationServiceId('') }}>{item.name}<ChevronRight size={14} /></button>)}</section>
      <section><h3>玩法</h3>{plays.map(name => <button type="button" className={applicationPlay === name ? 'is-selected' : ''} key={name} onClick={() => { setApplicationPlay(name); setApplicationLevel(''); setApplicationServiceId('') }}>{name}<ChevronRight size={14} /></button>)}</section>
      <section><h3>等级</h3>{levels.map(name => <button type="button" className={applicationLevel === name ? 'is-selected' : ''} key={name} onClick={() => { setApplicationLevel(name); setApplicationServiceId('') }}>{name}<ChevronRight size={14} /></button>)}</section>
      <section><h3>服务</h3>{availableServices.map(option => <button type="button" className={applicationServiceId === option.id ? 'is-selected' : ''} key={option.id} onClick={() => chooseService(option.id)}>{option.name}</button>)}</section>
    </div><footer><button type="button" className="client-button client-button--secondary" onClick={() => setApplicationOpen(false)}>取消</button><button type="button" className="client-button client-button--primary" disabled={!applicationServiceId} onClick={() => { if (w.applyService(applicationServiceId)) setApplicationOpen(false) }}>提交申请</button></footer></section></div>}
  </section>
}
