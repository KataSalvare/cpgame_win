import { useMemo } from 'react'
import { Gamepad2 } from 'lucide-react'
import { clubTags, games } from '../data/mockData'
import { useHomeLogic } from '../hooks/useHomeLogic'
import { ClubCard } from '../components/ClubCard'
import { PageStatePanel } from '../components/PageStatePanel'
import { PromotionBanner } from '../components/PromotionBanner'

type Props = {
  pageState: 'normal' | 'loading' | 'empty' | 'error'
  onOpenClub: (clubId: string) => void
  onBrowseClub: () => void
  onRetry: () => void
}

export function HomePage({ pageState, onOpenClub, onBrowseClub, onRetry }: Props) {
  const logic = useHomeLogic()
  const gameMap = useMemo(() => new Map(games.map((game) => [game.id, game])), [])

  if (pageState !== 'normal') {
    return <div className="client-content client-content--narrow-state">
      <PageStatePanel
        state={pageState}
        title="暂时没有俱乐部内容"
        description={pageState === 'error' ? '内容加载遇到问题，请重试。' : '当前筛选条件下暂时没有可展示的内容。'}
        actionLabel={pageState === 'error' ? '重新加载' : '恢复默认筛选'}
        onAction={pageState === 'error' ? onRetry : logic.resetFilters}
      />
    </div>
  }

  return <div className="client-content home-page">
    <div className="client-page-heading">
      <div><span className="client-eyebrow">发现游戏伙伴</span><h1>发现</h1><p>浏览游戏与俱乐部，找到合拍的队友。</p></div>
      <span className="client-heading-mark"><Gamepad2 size={18} /> 玩家端</span>
    </div>

    <PromotionBanner />

    <section className="home-games" aria-labelledby="home-games-title">
      <div className="client-section-heading"><div><span className="client-eyebrow">按游戏浏览</span><h2 id="home-games-title">选择游戏</h2></div><span className="client-muted">单选游戏，组合筛选俱乐部</span></div>
      <div className="home-game-list" role="group" aria-label="游戏筛选">
        {games.map((game) => <button key={game.id} type="button" className={`game-choice${logic.gameId === game.id ? ' is-active' : ''}`} aria-pressed={logic.gameId === game.id} onClick={() => logic.setGameId(game.id)}>
          <span className="game-choice__mark">{game.shortName}</span><span>{game.name}</span>
        </button>)}
      </div>
    </section>

    <section className="home-clubs" aria-labelledby="home-clubs-title">
      <div className="client-section-heading"><div><span className="client-eyebrow">俱乐部探索</span><h2 id="home-clubs-title">俱乐部</h2></div><span className="client-count">{logic.visibleClubs.length} 个俱乐部</span></div>
      <div className="club-scope-row" role="group" aria-label="俱乐部范围筛选">
        <button type="button" className={`client-filter-pill${logic.scope === 'featured' ? ' is-active' : ''}`} aria-pressed={logic.scope === 'featured'} onClick={() => logic.setScope('featured')}>推荐俱乐部</button>
        <button type="button" className={`client-filter-pill${logic.scope === 'followed' ? ' is-active' : ''}`} aria-pressed={logic.scope === 'followed'} onClick={() => logic.setScope('followed')}>我关注的俱乐部</button>
        <span className="club-scope-row__divider" />
        <span className="client-muted club-scope-row__label">俱乐部标签</span>
        {clubTags.map((tag) => <button key={tag} type="button" className={`client-filter-pill${logic.scope === 'tag' && logic.tag === tag ? ' is-active' : ''}`} aria-pressed={logic.scope === 'tag' && logic.tag === tag} onClick={() => logic.setTagScope(tag)}>{tag}</button>)}
      </div>

      {logic.visibleClubs.length > 0 ? <div className="client-card-grid client-card-grid--clubs">
        {logic.visibleClubs.map((club) => <ClubCard key={club.id} club={club} gamesById={gameMap} onOpen={() => onOpenClub(club.id)} onBrowse={onBrowseClub} />)}
      </div> : <div className="client-inline-empty"><p>没有符合条件的俱乐部</p><button type="button" className="client-button client-button--secondary" onClick={logic.resetFilters}>恢复默认筛选</button></div>}
    </section>
  </div>
}
