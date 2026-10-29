import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, Coins, MessageCircle, Search, X } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import { clubs, companions, games, servicesByCompanion } from '../data/mockData'
import type { OnboardingSubmission } from '../data/onboardingApplicationMockData'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'

const sourceServices = Object.values(servicesByCompanion).flat().filter((s, index, all) => all.findIndex(item => item.gameId === s.gameId && item.playName === s.playName && item.levelName === s.levelName && item.unit === s.unit) === index)
const services = games.filter(g => g.id !== 'all').flatMap(g => { const available = sourceServices.filter(s => s.gameId === g.id); return available.length ? available : sourceServices.slice(0, 8).map((s, i) => ({ ...s, id: `assessment-${g.id}-${i}`, gameId: g.id })) })
const fee = 500
const draftKey = 'companion-assessment-recharge-draft'
type Draft = { clubId: string; gameId: string; serviceId: string; examinerId: string }
function readDraft(): Draft | null {
  try { const value = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null') as Draft | null; return value && clubs.some(c => c.id === value.clubId) && games.some(g => g.id === value.gameId) ? value : null } catch { return null }
}
export function CompanionOnboarding({ balance, onBack, onChat, onRecharge, onPay, onSubmitted }: { balance: number; onBack: () => void; onChat: (id: string) => void; onRecharge: () => void; onPay: (club: string, game: string) => boolean; onSubmitted: (submission: OnboardingSubmission) => void }) {
  const [draft, setDraft] = useState<Draft | null>(readDraft)
  const [stage, setStage] = useState<'list' | 'assessment'>(() => readDraft() ? 'assessment' : 'list')
  const [dialog, setDialog] = useState<'rules' | 'notice' | 'warning' | 'payment' | 'recharge' | 'success' | null>(null)
  const [rulesClubId, setRulesClubId] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [picker, setPicker] = useState(false)
  const [play, setPlay] = useState('')
  const [level, setLevel] = useState('')
  const [error, setError] = useState('')
  const [clubSearch, setClubSearch] = useState('')
  const recruitingClubs = clubs.slice(0, 4).map((item, index) => ({ item, index })).filter(({ item }) => item.name.toLocaleLowerCase().includes(clubSearch.trim().toLocaleLowerCase()))
  const club = clubs.find(c => c.id === draft?.clubId)
  const game = games.find(g => g.id === draft?.gameId)
  const service = services.find(s => s.id === draft?.serviceId)
  const options = services.filter(s => s.gameId === draft?.gameId)
  const examiners = companions.filter(c => c.clubId === draft?.clubId)
  const plays = [...new Set(options.map(s => s.playName))]
  const levels = [...new Set(options.filter(s => s.playName === play).map(s => s.levelName))]
  const update = (values: Partial<Draft>) => setDraft(current => current ? { ...current, ...values } : current)
  const reset = () => { sessionStorage.removeItem(draftKey); setStage('list'); setDraft(null); setDialog(null); setPicker(false); setError('') }
  const back = () => { reset(); onBack() }
  return <section className="personal-module companion-onboarding">
    <header className="client-section-heading"><h2>{stage === 'list' ? '俱乐部招聘' : '选择考核内容'}</h2><button type="button" className="client-button client-button--secondary" onClick={stage === 'list' ? back : reset}>返回</button></header>
    {stage === 'list' ? <><label className="personal-club-search recruitment-search"><Search size={16} /><input type="search" aria-label="搜索招聘俱乐部名称" placeholder="搜索俱乐部名称" value={clubSearch} onChange={event => setClubSearch(event.target.value)} />{clubSearch && <button type="button" aria-label="清空招聘俱乐部搜索" onClick={() => setClubSearch('')}><X size={15} /></button>}</label><div className="recruitment-list" aria-live="polite">{recruitingClubs.map(({ item, index }) => <article className="client-card recruitment-card" key={item.id}>
      <header><AvatarMark initials={item.initials} size="md" /><div><h3>{item.name}</h3><span>招聘 {item.gameIds.reduce((total, _, i) => total + 20 + index * 8 + i * 12, 0)} 人</span></div><button type="button" className="client-button client-button--secondary" onClick={() => { setRulesClubId(item.id); setDialog('rules') }}>查看店规<ChevronRight size={14} /></button></header>
      <div className="recruitment-games">{item.gameIds.map((id, i) => { const g = games.find(g => g.id === id)!; return <button type="button" key={id} onClick={() => { setDraft({ clubId: item.id, gameId: id, serviceId: '', examinerId: '' }); setAgreed(false); setDialog('notice') }}>
        <span className="recruitment-game-icon" role="img" aria-label={`${g.name}游戏图`}>{g.shortName}</span>
        <span className="recruitment-game-copy"><strong>{g.name}</strong><small>招聘 {20 + index * 8 + i * 12} 人</small></span></button> })}</div>
    </article>)}{!recruitingClubs.length && <div className="client-card personal-setting-empty">未找到匹配的俱乐部</div>}</div></> : <>
      <section className="client-card assessment-content"><dl><div><dt>申请俱乐部</dt><dd>{club?.name}</dd></div><div><dt>申请游戏</dt><dd>{game?.name}</dd></div></dl>
      <label>考核服务</label><div className="checkout-service-picker assessment-service-picker"><button type="button" className="checkout-service-picker__trigger" aria-expanded={picker} onClick={() => { setPlay(service?.playName ?? plays[0] ?? ''); setLevel(service?.levelName ?? options[0]?.levelName ?? ''); setPicker(!picker) }}>{service ? `${service.playName} / ${service.levelName} / 按${service.unit}服务` : '选择玩法 / 等级 / 服务'}<ChevronDown size={16} /></button>
      {picker && <div className="checkout-service-picker__panel"><div className="checkout-cascader assessment-cascader">
        <div className="checkout-cascader__column" role="listbox" aria-label="玩法">{plays.map(p => <button type="button" role="option" aria-selected={play === p} key={p} className={`checkout-cascader__option${play === p ? ' is-selected' : ''}`} onClick={() => { setPlay(p); setLevel(options.find(s => s.playName === p)?.levelName ?? '') }}>{p}<ChevronRight size={14} /></button>)}</div>
        <div className="checkout-cascader__column" role="listbox" aria-label="等级">{levels.map(l => <button type="button" role="option" aria-selected={level === l} key={l} className={`checkout-cascader__option${level === l ? ' is-selected' : ''}`} onClick={() => setLevel(l)}>{l}<ChevronRight size={14} /></button>)}</div>
        <div className="checkout-cascader__column" role="listbox" aria-label="服务">{options.filter(s => s.playName === play && s.levelName === level).map(s => <button type="button" role="option" aria-selected={draft?.serviceId === s.id} key={s.id} className="checkout-cascader__option" onClick={() => { update({ serviceId: s.id }); setPicker(false); setError('') }}>按{s.unit}服务</button>)}</div>
      </div></div>}</div>
      <h3>选择考官</h3><div className="assessment-examiners">{examiners.map(person => <article key={person.id} className={draft?.examinerId === person.id ? 'is-selected' : ''}><AvatarMark initials={person.initials} size="md" /><strong><UserNameWithLevel name={person.name} identityId={person.id} /></strong><button type="button" className="client-button client-button--secondary" onClick={() => onChat(person.id)}><MessageCircle size={14} />聊一聊</button><button type="button" className="client-button client-button--secondary" aria-pressed={draft?.examinerId === person.id} onClick={() => { update({ examinerId: person.id }); setError('') }}>{draft?.examinerId === person.id ? <><Check size={14} />已选择</> : '选择考官'}</button></article>)}</div>
      </section><footer className="client-card assessment-payment"><span>考核费用 <strong>500 钻石</strong></span><span>钱包余额 {balance.toLocaleString()} 钻石</span><button type="button" className="client-button client-button--primary" disabled={!service || !draft?.examinerId} onClick={() => { setError(''); setDialog(balance >= fee ? 'payment' : 'recharge') }}><Coins size={16} />确认支付</button></footer>{error && <p role="alert">{error}</p>}
    </>}
    {dialog && <DialogPanel overlayId="companion-assessment-dialog" title={{ rules: '俱乐部店规', notice: '考试须知', warning: '提示', payment: '确认支付', recharge: '钻石余额不足', success: '支付成功' }[dialog]} width={dialog === 'rules' || dialog === 'notice' ? 680 : 480} onClose={() => dialog === 'success' ? back() : setDialog(null)} footer={dialog === 'notice' ? <><button type="button" className="client-button client-button--secondary" onClick={() => setDialog(null)}>返回</button><button type="button" className="client-button client-button--primary" disabled={!agreed} onClick={() => setDialog('warning')}>我已了解</button></> : dialog === 'warning' ? <button type="button" className="client-button client-button--primary" onClick={() => { setStage('assessment'); setDialog(null) }}>确认</button> : dialog === 'payment' || dialog === 'recharge' ? <><button type="button" className="client-button client-button--secondary" onClick={() => setDialog(null)}>稍后再说</button><button type="button" className="client-button client-button--primary" onClick={() => { if (dialog === 'recharge') { if (draft) sessionStorage.setItem(draftKey, JSON.stringify(draft)); setDialog(null); onRecharge(); return } if (club && game && service && draft?.examinerId && onPay(club.name, game.name)) { onSubmitted({ kind: '陪玩入驻', summary: `${club.name} · ${game.name}`, status: '待考核', content: [{ label: '申请俱乐部', value: club.name }, { label: '申请游戏', value: game.name }, { label: '考核服务', value: `${service.playName} / ${service.levelName} / 按${service.unit}服务` }, { label: '考官', value: companions.find(c => c.id === draft.examinerId)?.name ?? '' }, { label: '考核费用', value: '500 钻石（已支付）' }] }); sessionStorage.removeItem(draftKey); setDialog('success') } else { setDialog('recharge') } }}>{dialog === 'payment' ? '确认支付' : '去充值'}</button></> : <button type="button" className="client-button client-button--primary" onClick={dialog === 'success' ? back : () => setDialog(null)}>完成</button>}>
      {dialog === 'rules' ? <article className="assessment-richtext"><h2>{clubs.find(c => c.id === rulesClubId)?.name}店规</h2><h3>一、服务规范</h3><p>尊重玩家与同事，准时响应，文明沟通。服务前确认游戏、玩法和服务内容，服务过程中保持良好的沟通与配合。</p><h3>二、接单与售后</h3><p>通过平台接单并按约定提供服务，不得私下收款。遇到争议请保留相关记录并联系俱乐部客服处理。</p><h3>三、考核与管理</h3><p>报名考核前请仔细阅读考试须知，确认时间和项目。通过考核后，按俱乐部公布的管理规范开展服务。</p></article> : dialog === 'notice' ? <><article className="assessment-richtext"><h2>{club?.name} · {game?.name}考核服务须知</h2><p>考员您好，请仔细阅读以下考核服务须知。</p><h3>一、费用说明</h3><p>本次考核费用为 500 钻石，支付前请确认申请俱乐部、游戏、服务项目及考官。请按实际需要充值，不要过量充值。</p><h3>二、考核要求</h3><p>请使用本人账号参加考核，提前准备游戏与语音设备，按约定时间联系所选考官。考核包含技能表现、沟通能力与服务规范。</p><h3>三、报名与结果</h3><p>付款后请与考官确认考核安排。退款、改期及考核结果以俱乐部公布的规则为准，请在支付前向俱乐部确认。</p></article><label className="personal-closure-check"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />我已阅读并同意《考试须知》</label></> : dialog === 'warning' ? <p>入驻俱乐部涉及的押金金额、缴纳方式、退还条件及扣罚规则等，由您与所属俱乐部自行约定，请务必提前向俱乐部确认。由此产生的争议、损失或纠纷，由您与俱乐部协商解决，平台不承担相关责任。</p> : dialog === 'payment' ? <p>您已与考官取得联系，确认当前可以随时开始考试并支付500钻石吗？</p> : dialog === 'recharge' ? <p>当前钻石余额为 {balance.toLocaleString()} 钻石，本次应付 500 钻石，还差 <strong>{Math.max(0, fee - balance)} 钻石</strong>。前往充值？</p> : <p>已支付 500 钻石考核费用，请联系所选考官确认考核安排。</p>}
    </DialogPanel>}
  </section>
}
