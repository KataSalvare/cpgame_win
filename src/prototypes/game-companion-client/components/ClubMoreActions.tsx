import { useEffect, useRef, useState } from 'react'
import { FileCheck2, FileText, MoreHorizontal, Star } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import type { Club } from '../data/mockData'
import { AvatarMark } from './AvatarMark'

export type ClubInfoTab = 'intro' | 'pricing'

export function ClubMoreActions({ club, followed, onToggleFollow, onOpenInfo }: { club: Club; followed: boolean; onToggleFollow: () => void; onOpenInfo: (tab: ClubInfoTab) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<'qualification' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const outside = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [menuOpen])

  return <>
    <div className="club-more-actions" ref={menuRef}>
      <button type="button" className="client-icon-button" aria-label="俱乐部更多功能" title="更多功能" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={17} /></button>
      {menuOpen && <div className="companion-profile-card__menu" role="menu" aria-label="俱乐部更多功能">
        <button type="button" role="menuitem" onClick={() => { setDialog('qualification'); setMenuOpen(false) }}><FileCheck2 size={14} />营业资质</button>
        <button type="button" role="menuitem" onClick={() => { onOpenInfo('intro'); setMenuOpen(false) }}><FileText size={14} />简介</button>
        <button type="button" role="menuitem" onClick={() => { onToggleFollow(); setMenuOpen(false) }}><Star size={14} />{followed ? '取消关注' : '关注'}</button>
      </div>}
    </div>
    {dialog && <DialogPanel overlayId={`club-${dialog}-${club.id}`} title="营业资质" onClose={() => setDialog(null)} width={560}>
      <div className="club-qualification">
        <section className="club-qualification__identity"><AvatarMark initials={club.initials} size="lg" /><div><h3>{club.name}</h3><span className="rating-mark"><Star size={14} />{club.rating.toFixed(2)}</span></div><button type="button" className="client-button client-button--secondary" aria-pressed={followed} onClick={onToggleFollow}>{followed ? '已关注' : '关注'}</button></section>
        <section className="club-qualification__ratings" aria-label="俱乐部评分">{['服务态度', '游戏体验', '接单效率'].map((label) => <div key={label}><span>{label}</span><strong>4.9</strong><meter min="0" max="5" value="4.9" aria-label={`${label}4.9分`} /><span>高</span></div>)}</section>
        <div className="club-qualification__date"><span>开店时间</span><time dateTime="2026-10-12">2026.10.12</time></div>
        <section className="club-qualification__license"><h3>营业执照</h3><svg viewBox="0 0 760 440" role="img" aria-label={`${club.name}营业执照展示图`}>
          <rect x="4" y="4" width="752" height="432" rx="4" fill="var(--prototype-surface, #fff)" stroke="var(--prototype-border-strong, #d1d5db)" strokeWidth="6" />
          <rect x="18" y="18" width="724" height="404" fill="none" stroke="var(--prototype-border, #e5e7eb)" strokeWidth="2" />
          <g fill="var(--prototype-text-secondary, #374151)" fontFamily="serif"><text x="380" y="84" textAnchor="middle" fontSize="34" fontWeight="700" letterSpacing="10">营业执照</text><text x="380" y="114" textAnchor="middle" fontSize="14">（副本）</text><text x="52" y="177" fontSize="16">名称</text><text x="145" y="177" fontSize="18">{club.name}</text><text x="52" y="228" fontSize="16">类型</text><text x="52" y="279" fontSize="16">住所</text><text x="52" y="330" fontSize="16">经营范围</text><text x="508" y="362" fontSize="14">登记机关</text></g>
          <g stroke="var(--prototype-border, #e5e7eb)" strokeWidth="2"><path d="M145 229H420M145 280H680M145 331H450M145 350H450M145 369H450M580 363H688" /></g>
        </svg></section>
      </div>
    </DialogPanel>}
  </>
}

export function ClubInfoDialog({ club, initialTab, onClose }: { club: Club; initialTab: ClubInfoTab; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const content = activeTab === 'intro'
    ? { description: club.intro, label: '俱乐部活动展示图' }
    : { description: '俱乐部价目内容待补充。服务项目与实际价格请以陪玩资料为准。', label: '价目表展示图' }

  return <DialogPanel overlayId={`club-info-${club.id}`} title={club.name} onClose={onClose} width={720} className="club-info-dialog">
    <div className="club-info-tabs" role="tablist" aria-label="俱乐部资料">
      <button type="button" role="tab" id="club-info-tab-intro" aria-selected={activeTab === 'intro'} aria-controls="club-info-panel" onClick={() => setActiveTab('intro')}>后台配置TAB1</button>
      <button type="button" role="tab" id="club-info-tab-pricing" aria-selected={activeTab === 'pricing'} aria-controls="club-info-panel" onClick={() => setActiveTab('pricing')}>后台配置TAB2</button>
    </div>
    <section className="club-info-panel" id="club-info-panel" role="tabpanel" aria-labelledby={activeTab === 'intro' ? 'club-info-tab-intro' : 'club-info-tab-pricing'}>
      <p>{content.description}</p>
      <div className="club-info-art" role="img" aria-label={content.label}>
        <svg viewBox="0 0 720 360" aria-hidden="true" focusable="false">
          <rect x="0" y="0" width="720" height="360" fill="var(--prototype-canvas, #f3f4f6)" />
          <rect x="42" y="28" width="636" height="304" fill="var(--prototype-surface, #fff)" />
          <circle cx="485" cy="94" r="38" fill="var(--prototype-border-strong, #d1d5db)" />
          <path d="M60 220 225 100l190 118 112-62 133 64v112H60Z" fill="var(--prototype-border-strong, #d1d5db)" />
        </svg>
      </div>
    </section>
  </DialogPanel>
}
