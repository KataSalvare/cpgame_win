import { GenderAgeBadge } from './GenderAgeBadge'
import { demoImageKind } from './demoImage'
import { useRemovalConfirmation } from './RemovalConfirmation'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Flag, MoreHorizontal, Pencil, Shield, Share2, Star, X } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import { ConfirmationDialog } from '@/prototypes/game-companion-client/components/ConfirmationDialog'
import type { ProfileCardData } from './profileCardData'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'
import { CompanionShareDialog } from './CompanionShareDialog'
import { UserReportDialog } from './UserReportDialog'
import { ImageLightbox } from './ImageLightbox'
import { CopyableProfileId } from './CopyableProfileId'

type Props = {
  onShare?: (friendIds: string[]) => void
  profile: ProfileCardData
  onChat?: () => void
  className?: string
  followed?: boolean
  blocked?: boolean
  onToggleFollow?: () => void
  onBlock?: () => void
  note?: string
  onSaveNote?: (note: string) => void
  immersive?: boolean
  onClose?: () => void
}

export function CompanionProfileCard({ profile, className = '', followed = false, blocked = false, onToggleFollow, onBlock, note = '', onSaveNote, onShare, immersive = false, onClose }: Props) {
  const { requestRemoval, dialog: removalDialog } = useRemovalConfirmation()
  const [lifePhotoIndex, setLifePhotoIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [blockConfirmationOpen, setBlockConfirmationOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState(note)
  const [feedback, setFeedback] = useState('')
  const [localFollowed, setLocalFollowed] = useState(false)
  const [localBlocked, setLocalBlocked] = useState(false)
  const [localNote, setLocalNote] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const photoStripRef = useRef<HTMLDivElement>(null)
  const isFollowed = onToggleFollow ? followed : localFollowed
  const isBlocked = onBlock ? blocked : localBlocked
  const visibleNote = onSaveNote ? note : localNote
  const lifePhotos = profile.lifePhotos?.slice(0, 9) ?? []
  const visibleLifePhotoIndex = lifePhotos.length ? lifePhotoIndex % lifePhotos.length : 0

  useEffect(() => {
    if (immersive || lifePhotos.length < 2) return
    const timer = window.setInterval(() => setLifePhotoIndex((index) => (index + 1) % lifePhotos.length), 5000)
    return () => window.clearInterval(timer)
  }, [immersive, lifePhotos.length, profile.userId])

  const openReportDialog = () => {
    setReportDialogOpen(true)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const toggleFollow = () => {
    const apply = () => { if (onToggleFollow) onToggleFollow(); else setLocalFollowed((value) => !value) }
    if (isFollowed) requestRemoval('取消关注', profile.name, apply)
    else apply()
    setMenuOpen(false)
  }
  const openNote = () => {
    setNoteDraft(visibleNote)
    setNoteDialogOpen(true)
    setMenuOpen(false)
  }
  const confirmBlock = () => {
    if (onBlock) onBlock()
    else setLocalBlocked(true)
    setBlockConfirmationOpen(false)
    setMenuOpen(false)
  }

  const moreMenu = <div className="companion-profile-card__more" ref={menuRef}>
    <button type="button" className="client-icon-button" aria-label="更多功能" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={17} /></button>
    {menuOpen && <div className="companion-profile-card__menu" role="menu" aria-label={`${profile.name}更多功能`}>
      {onShare && <button type="button" role="menuitem" onClick={() => { setShareOpen(true); setMenuOpen(false) }}><Share2 size={14} />分享</button>}
      <button type="button" role="menuitem" onClick={openNote}><Pencil size={14} />备注</button>
      <button type="button" role="menuitem" aria-pressed={isFollowed} onClick={toggleFollow}><Star size={14} />{isFollowed ? '已关注' : '关注'}</button>
      <button type="button" role="menuitem" className="is-danger" disabled={isBlocked} onClick={() => { setBlockConfirmationOpen(true); setMenuOpen(false) }}><Shield size={14} />{isBlocked ? '已拉黑' : '拉黑'}</button>
      <button type="button" role="menuitem" onClick={openReportDialog}><Flag size={14} />举报</button>
    </div>}
  </div>

  return <>
    {immersive && <header className="companion-profile-toolbar">
      <h2 className="companion-profile-toolbar__title">个人主页</h2>
      <div className="companion-profile-card__toolbar-actions">{moreMenu}{onClose && <button type="button" className="windows-icon-button" aria-label="关闭用户详情" onClick={onClose}><X size={17} /></button>}</div>
    </header>}
    <section className={`client-card companion-profile-card${immersive ? ' companion-profile-card--immersive' : ''}${className ? ` ${className}` : ''}`} data-profile-id={profile.userId}>
      <AvatarMark initials={profile.initials} size={immersive ? 'xl' : 'lg'} />
      <div className="companion-profile-card__body">
        <div className="companion-profile-card__name"><h1><UserNameWithLevel name={profile.name} identityId={profile.userId} /></h1><span className="client-status" data-person-status={profile.status}>{profile.status}</span></div>
        <div className="companion-profile-card__facts"><GenderAgeBadge gender={profile.gender} age={profile.age} /><CopyableProfileId value={profile.userId} entityLabel="用户" /><span className="rating-mark"><Star size={14} />{profile.rating.toFixed(2)}</span>{profile.realNameVerified && <span className="client-badge">已实名</span>}</div>
        {profile.friendCount !== undefined && profile.followingCount !== undefined && profile.followerCount !== undefined && <div className="companion-profile-card__stats" aria-label="社交数据"><span><strong>{profile.friendCount}</strong>朋友</span><span><strong>{profile.followingCount}</strong>关注</span><span><strong>{profile.followerCount}</strong>粉丝</span></div>}
        <p>{profile.intro}</p>
        <div className="client-tag-row">{profile.tags.map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
        {profile.club && <div className="companion-profile-card__club" data-club-id={profile.club.id} aria-label={`所属俱乐部：${profile.club.name}`}><AvatarMark initials={profile.club.initials} size="sm" /><span>{profile.club.name}</span></div>}
        {visibleNote && <div className="companion-profile-card__note"><Pencil size={12} /><span>{visibleNote}</span></div>}
      </div>
      {!immersive && moreMenu}
    </section>
    {lifePhotos.length > 0 && <ImageLightbox overlayId={`companion-life-photos-${profile.userId}`} images={lifePhotos} label={`${profile.name}的生活照`}>{(openImage) => <div className="client-card companion-life-photos" aria-label={`${profile.name}的生活照`}>
      <div className="companion-life-photos__stage" tabIndex={0} aria-label="生活照轮播，使用左右方向键切换" onKeyDown={(event) => {
        if (lifePhotos.length < 2) return
        if (event.key === 'ArrowLeft') { event.preventDefault(); setLifePhotoIndex((index) => (index - 1 + lifePhotos.length) % lifePhotos.length) }
        if (event.key === 'ArrowRight') { event.preventDefault(); setLifePhotoIndex((index) => (index + 1) % lifePhotos.length) }
      }}>
        <button type="button" className="companion-life-photos__image-button" aria-label="查看生活照大图" onClick={() => openImage(visibleLifePhotoIndex)}><img data-demo-image={demoImageKind(lifePhotos[visibleLifePhotoIndex])} src={lifePhotos[visibleLifePhotoIndex]} alt={`${profile.name}的生活照 ${visibleLifePhotoIndex + 1}`} /></button>
        <button type="button" className="companion-life-photos__previous" aria-label="上一张生活照" disabled={lifePhotos.length < 2} onClick={() => setLifePhotoIndex((index) => (index - 1 + lifePhotos.length) % lifePhotos.length)}><ChevronLeft size={18} /></button>
        <button type="button" className="companion-life-photos__next" aria-label="下一张生活照" disabled={lifePhotos.length < 2} onClick={() => setLifePhotoIndex((index) => (index + 1) % lifePhotos.length)}><ChevronRight size={18} /></button>
      </div>
      <div className="companion-life-photos__gallery"><button type="button" className="companion-life-photos__gallery-arrow is-previous" aria-label="上一张生活照" onClick={() => { const next = (visibleLifePhotoIndex - 1 + lifePhotos.length) % lifePhotos.length; setLifePhotoIndex(next); photoStripRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }) }}><ChevronLeft size={18} /></button><div ref={photoStripRef} className="companion-life-photos__strip" role="group" aria-label="生活照">
        {lifePhotos.map((photo, index) => <button type="button" key={`${index}-${photo.slice(-24)}`} className={index === visibleLifePhotoIndex ? 'is-selected' : ''} aria-label={`查看生活照 ${index + 1}`} onClick={() => { setLifePhotoIndex(index); openImage(index) }}><img data-demo-image={demoImageKind(photo)} src={photo} alt="" /></button>)}
      </div><button type="button" className="companion-life-photos__gallery-arrow is-next" aria-label="下一张生活照" onClick={() => { const next = (visibleLifePhotoIndex + 1) % lifePhotos.length; setLifePhotoIndex(next); photoStripRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }) }}><ChevronRight size={18} /></button></div>
    </div>}</ImageLightbox>}
    {feedback && <p className="companion-profile-card__feedback" role="status">{feedback}</p>}
    {removalDialog}
    {blockConfirmationOpen && <ConfirmationDialog overlayId={`companion-block-${profile.userId}`} title="拉黑用户" message={`确定拉黑「${profile.name}」吗？`} confirmLabel="确认拉黑" onCancel={() => setBlockConfirmationOpen(false)} onConfirm={confirmBlock} />}
    {shareOpen && onShare && <CompanionShareDialog profile={profile} onShare={onShare} onClose={() => setShareOpen(false)} />}
    {noteDialogOpen && <DialogPanel overlayId={`companion-note-${profile.userId}`} title="设置备注" onClose={() => setNoteDialogOpen(false)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setNoteDialogOpen(false)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { if (onSaveNote) onSaveNote(noteDraft.trim()); else setLocalNote(noteDraft.trim()); setNoteDialogOpen(false) }}>保存备注</button></>}><label className="companion-note-field"><span>备注</span><input autoFocus maxLength={20} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="输入备注名称" /></label></DialogPanel>}
    {reportDialogOpen && <UserReportDialog overlayId={`companion-report-${profile.userId}`} onClose={() => setReportDialogOpen(false)} onSubmit={() => { setFeedback('举报已提交（仅演示）'); setReportDialogOpen(false) }} />}
  </>
}
