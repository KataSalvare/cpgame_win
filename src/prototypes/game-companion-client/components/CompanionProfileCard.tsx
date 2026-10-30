import { useEffect, useRef, useState } from 'react'
import { Flag, MoreHorizontal, Pencil, Shield, Share2, Star } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import type { ProfileCardData } from './profileCardData'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'
import { VoiceMessageButton } from './VoiceMessageButton'
import { CompanionShareDialog } from './CompanionShareDialog'
import { UserReportDialog } from './UserReportDialog'

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
}

export function CompanionProfileCard({ profile, className = '', followed = false, blocked = false, onToggleFollow, onBlock, note = '', onSaveNote, onShare }: Props) {
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
  const isFollowed = onToggleFollow ? followed : localFollowed
  const isBlocked = onBlock ? blocked : localBlocked
  const visibleNote = onSaveNote ? note : localNote

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
    if (onToggleFollow) onToggleFollow()
    else setLocalFollowed((value) => !value)
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

  return <>
    <section className={`client-card companion-profile-card${className ? ` ${className}` : ''}`}>
      <AvatarMark initials={profile.initials} size="lg" />
      <div className="companion-profile-card__body">
        <div className="companion-profile-card__name"><h1><UserNameWithLevel name={profile.name} identityId={profile.userId} /></h1><span className={`client-status${profile.status === '接单中' ? ' is-available' : ''}`}>{profile.status}</span></div>
        <div className="companion-profile-card__facts"><span aria-label={`${profile.gender}，${profile.age}岁`}><span aria-hidden="true">{profile.gender === '男' ? '♂' : profile.gender === '女' ? '♀' : profile.gender}{profile.age}</span></span><span>ID：{profile.userId}</span><span className="rating-mark"><Star size={14} />{profile.rating.toFixed(2)}</span>{profile.realNameVerified && <span className="client-badge">已实名</span>}</div>
        {profile.friendCount !== undefined && profile.followingCount !== undefined && profile.followerCount !== undefined && <div className="companion-profile-card__stats" aria-label="社交数据"><span><strong>{profile.friendCount}</strong>朋友</span><span><strong>{profile.followingCount}</strong>关注</span><span><strong>{profile.followerCount}</strong>粉丝</span></div>}
        {profile.club && <div className="companion-profile-card__club" aria-label={`所属俱乐部：${profile.club.name}`}><AvatarMark initials={profile.club.initials} size="sm" /><span>{profile.club.name}</span></div>}
        <div className="client-tag-row">{profile.tags.map((tag) => <span className="client-tag" key={tag}>{tag}</span>)}</div>
        <p>{profile.intro}</p>
        {visibleNote && <div className="companion-profile-card__note"><Pencil size={12} /><span>{visibleNote}</span></div>}
        {profile.voiceMessage && <VoiceMessageButton message={profile.voiceMessage} label="语音介绍" />}
      </div>
      <div className="companion-profile-card__more" ref={menuRef}>
        <button type="button" className="client-icon-button" aria-label="更多功能" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={17} /></button>
        {menuOpen && <div className="companion-profile-card__menu" role="menu" aria-label={`${profile.name}更多功能`}>
          {onShare && <button type="button" role="menuitem" onClick={() => { setShareOpen(true); setMenuOpen(false) }}><Share2 size={14} />分享</button>}
          <button type="button" role="menuitem" onClick={openNote}><Pencil size={14} />备注</button>
          <button type="button" role="menuitem" aria-pressed={isFollowed} onClick={toggleFollow}><Star size={14} />{isFollowed ? '已关注' : '关注'}</button>
          <button type="button" role="menuitem" className="is-danger" disabled={isBlocked} onClick={() => { setBlockConfirmationOpen(true); setMenuOpen(false) }}><Shield size={14} />{isBlocked ? '已拉黑' : '拉黑'}</button>
          <button type="button" role="menuitem" onClick={openReportDialog}><Flag size={14} />举报</button>
        </div>}
      </div>
    </section>
    {feedback && <p className="companion-profile-card__feedback" role="status">{feedback}</p>}
    {blockConfirmationOpen && <DialogPanel overlayId={`companion-block-${profile.userId}`} title="确认拉黑" description={`确定拉黑「${profile.name}」吗？`} onClose={() => setBlockConfirmationOpen(false)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setBlockConfirmationOpen(false)}>取消</button><button type="button" className="client-button client-button--primary" onClick={confirmBlock}>确认拉黑</button></>}><p className="social-dialog-copy">确认后，该陪玩会标记为已拉黑。</p></DialogPanel>}
    {shareOpen && onShare && <CompanionShareDialog profile={profile} onShare={onShare} onClose={() => setShareOpen(false)} />}
    {noteDialogOpen && <DialogPanel overlayId={`companion-note-${profile.userId}`} title="设置备注" onClose={() => setNoteDialogOpen(false)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setNoteDialogOpen(false)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { if (onSaveNote) onSaveNote(noteDraft.trim()); else setLocalNote(noteDraft.trim()); setNoteDialogOpen(false) }}>保存备注</button></>}><label className="companion-note-field"><span>备注</span><input autoFocus maxLength={20} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="输入备注名称" /></label></DialogPanel>}
    {reportDialogOpen && <UserReportDialog overlayId={`companion-report-${profile.userId}`} onClose={() => setReportDialogOpen(false)} onSubmit={() => { setFeedback('举报已提交（仅演示）'); setReportDialogOpen(false) }} />}
  </>
}
