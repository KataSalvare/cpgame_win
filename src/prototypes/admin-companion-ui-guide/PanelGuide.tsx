import { useState } from 'react'
import { GlassPanelSpecs } from './GlassSpecs'
import { MatchButtonSpecs } from './MatchButtonSpecs'
import { CircleStop, Headphones, Maximize2, Pause, Play, Swords } from 'lucide-react'
import { ProfileQuickPanel } from '@/prototypes/game-companion-client/components/ProfileQuickPanel'
import { AvatarMark } from '@/prototypes/game-companion-client/components/AvatarMark'
import { MatchPanel } from '@/prototypes/game-companion-client/pages/MatchPanel'
import { useMatchLogic } from '@/prototypes/game-companion-client/hooks/useMatchLogic'
import { playerProfile } from '@/prototypes/game-companion-client/data/accountMockData'
import '@/prototypes/game-companion-client/style.css'
import '@/prototypes/game-companion-client/high-fidelity.css'
import './panel-guide.css'

const noop = () => {}
function RecordingSample({paused = false}: {paused?: boolean}) {
 const [isPaused,setPaused] = useState(paused)
 return <div className="screen-recording-float"><span className={`screen-recording-float__indicator${isPaused ? ' is-paused' : ''}`} /><div className="screen-recording-float__info"><strong>{isPaused ? '已暂停' : '录制中'}</strong><time>00:01:28</time></div><button type="button" className="screen-recording-float__button" aria-label={isPaused ? '继续录制' : '暂停录制'} onClick={() => setPaused(!isPaused)}>{isPaused ? <Play size={16}/> : <Pause size={16}/>}</button><button type="button" className="screen-recording-float__button screen-recording-float__button--end" aria-label="结束录制"><CircleStop size={17}/></button></div>
}
export function PanelGuide() {
 const logic = useMatchLogic()
 const [profileVersion, setProfileVersion] = useState(0)
 return <div className="companion-guide panel-guide" data-prototype-palette="high-fidelity"><header className="guide-header"><div><span>黄黑陪玩平台 / UI 说明</span><h1>浮层面板</h1></div><div className="guide-header-meta">Windows 客户端 · 1920 × 1080</div></header><main className="guide-content"><div className="guide-section-title"><h2>主要面板</h2><span>按客户端实际尺寸展示</span></div><div className="panel-guide-main game-companion-client"><section className="panel-guide-card"><h2>个人中心快捷面板</h2><p>宽 340 px · 内边距 20 px · 圆角 24 px · 半透明渐变 / 背景模糊 20 px</p><div className="panel-guide-profile"><ProfileQuickPanel key={profileVersion} initialOpen onDismiss={() => setProfileVersion(value => value + 1)} profile={playerProfile} diamondBalance={12800} beanBalance={3680} onNavigate={noop}><AvatarMark initials={playerProfile.initials} size="md" isDemoUser /></ProfileQuickPanel></div></section><section className="panel-guide-card"><h2>一键匹配面板</h2><p>宽 560 px · 圆角 22 px · 深色渐变标题 · 白色内容区 · 高度随内容与画布限制</p><div className="panel-guide-match"><MatchPanel open matching={false} logic={logic} onMinimize={noop} onRestore={noop} onCandidatesAvailable={noop} onStartMatching={noop} onGoToVoiceRoom={noop} onCancel={noop} onChooseCompanions={noop} onContactCompanion={noop}/></div></section><section className="panel-guide-card"><h2>录屏悬浮面板</h2><p>宽 280 px · 圆角 16 px · 内边距 10 × 12 px · 渐变玻璃 / 模糊 20 px</p><div className="panel-guide-floats"><div><span>录制中</span><RecordingSample /></div><div><span>已暂停</span><RecordingSample paused /></div></div><h2>其他悬浮面板</h2><p>匹配缩小态 320 × 至少 72 px，圆角 18 px；语音房缩小态沿用玻璃表面。</p><div className="panel-guide-floats"><div><span>匹配中</span><div className="match-mini-card"><span className="match-mini-card__icon"><Swords size={16}/></span><span className="match-mini-card__content"><strong>匹配中</strong></span><Maximize2 className="match-mini-card__restore" size={15}/></div></div><div><span>语音房最小化</span><button type="button" className="voice-minimized-float"><Headphones size={17}/><span>语音聊天中</span><small>点击返回语音房</small><span className="voice-minimized-float__wave"><i/><i/><i/><i/></span></button></div></div></section></div><MatchButtonSpecs /><GlassPanelSpecs /></main></div>
}
