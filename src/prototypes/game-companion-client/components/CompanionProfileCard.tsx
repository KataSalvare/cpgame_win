import { useEffect, useRef, useState } from 'react'
import { Flag, ImagePlus, MoreHorizontal, Pencil, Shield, Share2, Star, X } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import type { ProfileCardData } from './profileCardData'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'
import { VoiceMessageButton } from './VoiceMessageButton'
import { CompanionShareDialog } from './CompanionShareDialog'

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

const REPORT_TYPES = ['政治', '诈骗', '侮辱诽谤', '色情暴力', '侵权', '广告拉人', '其他原因']
const MAX_REPORT_IMAGES = 5
const MAX_REPORT_REASON_LENGTH = 500
type ReportImage = { id: string; name: string; url: string }

export function CompanionProfileCard({ profile, className = '', followed = false, blocked = false, onToggleFollow, onBlock, note = '', onSaveNote, onShare }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [blockConfirmationOpen, setBlockConfirmationOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState(note)
  const [reportType, setReportType] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reportImages, setReportImages] = useState<ReportImage[]>([])
  const [feedback, setFeedback] = useState('')
  const [localFollowed, setLocalFollowed] = useState(false)
  const [localBlocked, setLocalBlocked] = useState(false)
  const [localNote, setLocalNote] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const reportImageInputRef = useRef<HTMLInputElement>(null)
  const reportImageUrlsRef = useRef(new Set<string>())
  const isFollowed = onToggleFollow ? followed : localFollowed
  const isBlocked = onBlock ? blocked : localBlocked
  const visibleNote = onSaveNote ? note : localNote

  useEffect(() => () => {
    reportImageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    reportImageUrlsRef.current.clear()
  }, [])

  const clearReportImages = () => {
    reportImageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    reportImageUrlsRef.current.clear()
    setReportImages([])
  }

  const closeReportDialog = () => {
    setReportDialogOpen(false)
    clearReportImages()
  }

  const openReportDialog = () => {
    setReportType('')
    setReportReason('')
    clearReportImages()
    setReportDialogOpen(true)
    setMenuOpen(false)
  }

  const addReportImages = (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_REPORT_IMAGES - reportImages.length
    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith('image/')).slice(0, remaining)
    const nextImages = selectedFiles.map((file) => {
      const url = URL.createObjectURL(file)
      reportImageUrlsRef.current.add(url)
      return { id: `${file.name}-${url}`, name: file.name, url }
    })
    setReportImages((current) => [...current, ...nextImages])
  }

  const removeReportImage = (image: ReportImage) => {
    URL.revokeObjectURL(image.url)
    reportImageUrlsRef.current.delete(image.url)
    setReportImages((current) => current.filter((item) => item.id !== image.id))
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
    {reportDialogOpen && <DialogPanel overlayId={`companion-report-${profile.userId}`} title="举报用户" onClose={closeReportDialog} width={640} className="companion-report-dialog" footer={<><button type="button" className="client-button client-button--secondary" onClick={closeReportDialog}>取消</button><button type="button" className="client-button client-button--primary" disabled={!reportType || !reportReason.trim()} onClick={() => { setFeedback('举报已提交（仅演示）'); closeReportDialog() }}>提交举报</button></>}>
      <fieldset className="companion-report-types">
        <legend>选择举报类型</legend>
        <div className="companion-report-types__options" role="radiogroup" aria-label="选择举报类型">{REPORT_TYPES.map((type) => {
          const selected = reportType === type
          return <button key={type} type="button" role="radio" aria-checked={selected} className={selected ? 'is-selected' : ''} onClick={() => setReportType(type)}>{type}</button>
        })}</div>
      </fieldset>
      <label className="companion-report-description"><span>描述举报原因<strong>*</strong></span><textarea value={reportReason} maxLength={MAX_REPORT_REASON_LENGTH} onChange={(event) => setReportReason(event.target.value)} placeholder="请描述举报原因，帮助我们更好地为您解决问题" /><small>{reportReason.length}/{MAX_REPORT_REASON_LENGTH}</small></label>
      <section className="companion-report-upload" aria-labelledby={`companion-report-upload-title-${profile.userId}`}>
        <h3 id={`companion-report-upload-title-${profile.userId}`}>上传凭证</h3>
        <p>可上传图片佐证，最多可传 5 张图片</p>
        <div className="companion-report-upload__list">
          {reportImages.map((image) => <div key={image.id} className="companion-report-upload__image"><img src={image.url} alt={image.name} /><button type="button" aria-label={`移除${image.name}`} onClick={() => removeReportImage(image)}><X size={13} /></button></div>)}
          {reportImages.length < MAX_REPORT_IMAGES && <button type="button" className="companion-report-upload__add" onClick={() => reportImageInputRef.current?.click()}><ImagePlus size={19} /><span>上传图片</span></button>}
        </div>
        <input ref={reportImageInputRef} className="companion-report-upload__input" type="file" accept="image/*" multiple onChange={(event) => { addReportImages(event.target.files); event.target.value = '' }} aria-label="选择举报凭证图片" />
      </section>
    </DialogPanel>}
  </>
}
