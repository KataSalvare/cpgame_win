import { ChevronRight } from 'lucide-react'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'

function ServiceSwitch({ label, checked, disabled = false, onToggle }: { label: string; checked: boolean; disabled?: boolean; onToggle: () => void }) {
  return <button type="button" role="switch" aria-label={label} aria-checked={checked} disabled={disabled} className="workbench-service-switch" onClick={onToggle}><span /></button>
}

export function WorkbenchServicesPanel({ logic: w }: { logic: WorkbenchLogic }) {
  const game = w.serviceGroups.find(g => g.id === w.selectedServiceGameId) ?? w.serviceGroups[0]
  if (!game) return <section className="client-card account-empty-inline"><strong>暂无可管理的服务</strong></section>
  return <section className="client-card workbench-services-panel" aria-label="接单服务管理">
    <nav className="workbench-services-games prototype-content-scroll" aria-label="选择服务游戏">
      {w.serviceGroups.map(g => <button type="button" key={g.id} className={g.id === game.id ? 'is-active' : ''} aria-current={g.id === game.id ? 'true' : undefined} onClick={() => w.setSelectedServiceGameId(g.id)}>{g.name}</button>)}
    </nav>
    <div key={game.id} className="workbench-services-content prototype-content-scroll" role="region" aria-label={`${game.name}接单服务`} tabIndex={0}>
      {game.plays.map(play => <section className="workbench-service-play" key={play.name}>
        <h3>{play.name}</h3>
        {play.levels.map(level => {
          const levelEnabled = w.enabledLevelKeys.includes(level.key)
          const expanded = levelEnabled && w.expandedLevelKeys.includes(level.key)
          const optionsId = `service-options-${level.services[0].id}`
          return <section className="workbench-service-level" key={level.key} aria-label={`${play.name} · ${level.name}`}>
            <header><h4><button type="button" className="workbench-level-disclosure" aria-label={`${level.name}服务`} aria-expanded={expanded} aria-controls={expanded ? optionsId : undefined} disabled={!levelEnabled} onClick={() => w.toggleLevelExpanded(level.key)}><ChevronRight size={16} /><span>{level.name}</span></button></h4><div className="workbench-service-level-toggle"><span>接单</span><ServiceSwitch label={`${game.name} ${play.name} ${level.name}接单`} checked={levelEnabled} onToggle={() => w.toggleLevel(level.key)} /></div></header>
            <div id={optionsId} className="workbench-service-options" hidden={!expanded}>
              {level.services.map(service => <div className="workbench-service-option" key={service.id}><span>{service.name}</span><span className="workbench-service-option-price">{service.price} 钻石 / {service.unit}</span><ServiceSwitch label={`${game.name} ${play.name} ${level.name} ${service.name}接单`} checked={w.serviceSelections.includes(service.id)} disabled={!levelEnabled} onToggle={() => w.toggleService(service.id)} /></div>)}
            </div>
          </section>
        })}
      </section>)}
    </div>
  </section>
}
