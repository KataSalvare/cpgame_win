import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { BadgeCheck, Bell, Building2, Check, ChevronLeft, ChevronRight, Coins, Copy, FileBadge2, Footprints, Gift, History, ImagePlus, LockKeyhole, LogOut, Megaphone, MessageCircle, Monitor, PackageCheck, Pencil, Settings2, Shield, ShieldCheck, Star, UserRound, UsersRound, Volume2, WalletCards, X } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import { AvatarMark } from '../components/AvatarMark'
import { PageStatePanel } from '../components/PageStatePanel'
import { clubs, games } from '../data/mockData'
import { type ClientOrder, type PlayerProfile } from '../data/accountMockData'
import { profileFootprints, profileRoomVisits, profileVisitors, receivedGiftRecords } from '../data/personalCenterMockData'
import { type BlockedProfile, type NotificationPreferences } from '../data/personalSettingsMockData'

type PageState = 'normal' | 'loading' | 'empty' | 'error'
type CenterSection = 'profile' | 'clubs' | 'onboarding' | 'visits' | 'gifts'
type VisitTab = 'footprints' | 'visitors' | 'rooms'
type ApplicationKind = 'companion' | 'club'

type PersonalCenterProps = {
  pageState: PageState
  onRetry: () => void
  profile: PlayerProfile
  onSaveProfile: (profile: PlayerProfile) => void
  orders: ClientOrder[]
  diamondBalance: number
  beanBalance: number
  onOpenWallet: () => void
  onOpenOrders: () => void
  onOpenClub: (clubId: string) => void
  boundPhone: string
  onSaveBoundPhone: (phone: string) => void
  endedDeviceIds: string[]
  onEndDevice: (deviceId: string) => void
  notifications: NotificationPreferences
  onUpdateNotifications: (preferences: NotificationPreferences) => void
  blockedProfiles: BlockedProfile[]
  onUnblockProfile: (profileId: string) => void
  onLogout: () => void
}

const sectionItems: { id: CenterSection; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: '个人资料', icon: UserRound },
  { id: 'clubs', label: '我的俱乐部', icon: Building2 },
  { id: 'onboarding', label: '入驻中心', icon: FileBadge2 },
  { id: 'visits', label: '访问记录', icon: Footprints },
  { id: 'gifts', label: '我的礼物', icon: Gift },
]

export function PersonalCenterPage({ pageState, onRetry, profile, onSaveProfile, orders, diamondBalance, beanBalance, onOpenWallet, onOpenOrders, onOpenClub, boundPhone, onSaveBoundPhone, endedDeviceIds, onEndDevice, notifications, onUpdateNotifications, blockedProfiles, onUnblockProfile, onLogout }: PersonalCenterProps) {
  const [section, setSection] = useState<CenterSection>('profile')
  const [visitTab, setVisitTab] = useState<VisitTab>('footprints')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState(profile)
  const [feedback, setFeedback] = useState('')
  const [joinedClubId, setJoinedClubId] = useState<string | null>('club-001')
  const [choosingClub, setChoosingClub] = useState(false)
  const [confirmExitClubId, setConfirmExitClubId] = useState<string | null>(null)
  const [applicationKind, setApplicationKind] = useState<ApplicationKind | null>(null)
  const [applicationName, setApplicationName] = useState('')
  const [applicationGame, setApplicationGame] = useState(games[1]?.id ?? '')
  const [applicationIntro, setApplicationIntro] = useState('')
  const [applicationSubmitted, setApplicationSubmitted] = useState<Record<ApplicationKind, boolean>>({ companion: false, club: false })
  const [activeSetting, setActiveSetting] = useState<'security' | 'notifications' | 'blacklist' | 'logout' | null>(null)

  const joinedClub = useMemo(() => clubs.find((club) => club.id === joinedClubId) ?? null, [joinedClubId])

  const closeProfileEditor = () => {
    setEditingProfile(false)
    setProfileDraft(profile)
  }

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nickname = profileDraft.nickname.trim()
    if (!nickname) return
    onSaveProfile({ ...profileDraft, nickname, initials: nickname.slice(0, 2) })
    setFeedback('资料已更新（仅保存在本次原型会话）')
    setEditingProfile(false)
  }

  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!applicationKind || !applicationName.trim() || !applicationIntro.trim()) return
    setApplicationSubmitted((current) => ({ ...current, [applicationKind]: true }))
    setApplicationKind(null)
    setFeedback('申请已提交（仅演示）')
  }

  if (pageState !== 'normal') return <div className="client-content account-page"><PageStatePanel state={pageState} title={pageState === 'empty' ? '暂时没有内容' : '页面暂不可用'} description={pageState === 'error' ? '加载遇到问题，请重试。' : '当前没有可展示的内容。'} actionLabel={pageState === 'error' ? '重新加载' : '返回个人中心'} onAction={onRetry} /></div>

  return <div className="client-content account-page personal-center-page">
    <header className="client-page-heading account-page-heading"><div><span className="client-eyebrow">玩家中心</span><h1>个人中心</h1></div></header>
    <nav className="personal-center-tabs" role="tablist" aria-label="个人中心模块">
      {sectionItems.map(({ id, label, icon: Icon }) => <button type="button" role="tab" key={id} className={`personal-center-tab${section === id ? ' is-active' : ''}`} aria-selected={section === id} onClick={() => { setSection(id); setFeedback('') }}><Icon size={16} /><span>{label}</span></button>)}
    </nav>
    <main className="personal-center-content" aria-live="polite">
        {section === 'profile' && <ProfileOverview profile={profile} onEdit={() => { setProfileDraft(profile); setEditingProfile(true) }} orders={orders} diamondBalance={diamondBalance} beanBalance={beanBalance} onOpenWallet={onOpenWallet} onOpenOrders={onOpenOrders} feedback={feedback} onFeedback={setFeedback} onOpenSetting={setActiveSetting} />}
        {section === 'clubs' && <section className="personal-module">
          <ModuleHeading title="我的俱乐部" />
          {joinedClub ? <article className="client-card personal-club-card"><AvatarMark initials={joinedClub.initials} size="md" /><div className="personal-club-card__body"><div className="personal-card-title"><h3>{joinedClub.name}</h3><span className="personal-status"><Check size={12} />已加入</span></div><p>{joinedClub.intro}</p><div className="personal-card-meta"><span><Star size={13} />{joinedClub.rating.toFixed(2)}</span><span><UsersRound size={13} />{joinedClub.companionCount} 位成员</span><span>{joinedClub.tags.slice(0, 2).join(' · ')}</span></div></div><div className="personal-club-card__actions"><button type="button" className="client-button client-button--secondary" onClick={() => onOpenClub(joinedClub.id)}>查看详情</button><button type="button" className="client-button client-button--secondary" onClick={() => setConfirmExitClubId(joinedClub.id)}>退出俱乐部</button></div></article> : <EmptyPanel icon={<Building2 size={22} />} title="还没有加入俱乐部" action="加入俱乐部" actionClassName="client-button--primary" onAction={() => setChoosingClub(true)} />}
          {feedback && <FeedbackMessage>{feedback}</FeedbackMessage>}
        </section>}
        {section === 'onboarding' && <section className="personal-module">
          <ModuleHeading title="入驻中心" description="选择申请身份，开始填写资料。" />
          <div className="onboarding-card-grid">
            <OnboardingCard icon={<UserRound size={20} />} title="陪玩入驻" description="提交个人资料与擅长游戏，申请成为平台陪玩。" submitted={applicationSubmitted.companion} onApply={() => { setApplicationKind('companion'); setApplicationName(profile.nickname); setApplicationIntro('') }} />
            <OnboardingCard icon={<Building2 size={20} />} title="俱乐部入驻" description="提交俱乐部资料，申请在平台展示和招募成员。" submitted={applicationSubmitted.club} onApply={() => { setApplicationKind('club'); setApplicationName(''); setApplicationIntro('') }} />
          </div>
          <p className="personal-demo-note">申请流程仅用于原型演示，不会提交到平台。</p>
          {feedback && <FeedbackMessage>{feedback}</FeedbackMessage>}
        </section>}
        {section === 'visits' && <section className="personal-module">
          <ModuleHeading title="访问记录" />
          <div className="personal-record-tabs" role="tablist" aria-label="访问记录类型">{([{ id: 'footprints', label: '足迹', count: profileFootprints.length }, { id: 'visitors', label: '访客', count: profileVisitors.length }, { id: 'rooms', label: '进房记录', count: profileRoomVisits.length }] as const).map((tab) => <button type="button" role="tab" aria-selected={visitTab === tab.id} className={visitTab === tab.id ? 'is-active' : ''} key={tab.id} onClick={() => setVisitTab(tab.id)}>{tab.label}<span>{tab.count}</span></button>)}</div>
          <VisitList tab={visitTab} />
        </section>}
        {section === 'gifts' && <section className="personal-module">
          <ModuleHeading title="我的礼物" count={`${receivedGiftRecords.reduce((sum, gift) => sum + gift.count, 0)} 件`} />
          <div className="personal-gift-list">{receivedGiftRecords.map((record) => <article className="client-card personal-gift-card" key={record.id}><AvatarMark initials={record.initials} size="sm" /><div className="personal-gift-card__sender"><strong>{record.sender}</strong><small>{record.game} · {record.time}</small></div><span className="personal-gift-token">{record.giftInitials}</span><div className="personal-gift-card__info"><strong>{record.giftName}</strong><small>收到 × {record.count}</small></div></article>)}</div>
        </section>}
    </main>

    {confirmExitClubId && <DialogPanel overlayId="leave-club-dialog" title="退出俱乐部" description={`退出「${clubs.find((club) => club.id === confirmExitClubId)?.name ?? ''}」后即可加入其他俱乐部。`} onClose={() => setConfirmExitClubId(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setConfirmExitClubId(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { setJoinedClubId(null); setFeedback('已退出俱乐部'); setConfirmExitClubId(null) }}>确认退出</button></>}><p className="social-dialog-copy">本次演示会立即更新俱乐部状态。</p></DialogPanel>}
    {choosingClub && <DialogPanel overlayId="choose-club-dialog" title="加入俱乐部" description="选择一个俱乐部加入。" onClose={() => setChoosingClub(false)} width={620} footer={<button type="button" className="client-button client-button--secondary" onClick={() => setChoosingClub(false)}>关闭</button>}><div className="personal-club-picker">{clubs.map((club) => <article className="client-card personal-club-card" key={club.id}><AvatarMark initials={club.initials} size="md" /><div className="personal-club-card__body"><div className="personal-card-title"><h3>{club.name}</h3></div><p>{club.intro}</p><div className="personal-card-meta"><span><Star size={13} />{club.rating.toFixed(2)}</span><span><UsersRound size={13} />{club.companionCount} 位成员</span><span>{club.tags.slice(0, 2).join(' · ')}</span></div></div><div className="personal-club-card__actions"><button type="button" className="client-button client-button--primary" onClick={() => { setJoinedClubId(club.id); setChoosingClub(false); setFeedback(`已加入「${club.name}」`) }}>加入</button></div></article>)}</div></DialogPanel>}
    {editingProfile && <DialogPanel overlayId="edit-player-profile-dialog" title="编辑个人资料" onClose={closeProfileEditor} width={560} footer={<><button type="button" className="client-button client-button--secondary" onClick={closeProfileEditor}>取消</button><button type="submit" form="edit-player-profile" className="client-button client-button--primary" disabled={!profileDraft.nickname.trim()}>保存资料</button></>}>
      <form id="edit-player-profile" className="personal-profile-form" onSubmit={submitProfile}>
        <div className="personal-avatar-editor"><ProfileAvatar profile={profileDraft} size="lg" /><label className="client-button client-button--secondary personal-upload-button"><ImagePlus size={15} />更换头像<input type="file" accept="image/*" aria-label="上传头像图片" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProfileDraft((current) => ({ ...current, avatarDataUrl: String(reader.result) })); reader.readAsDataURL(file) }} /></label></div>
        <label className="personal-field">昵称<input required maxLength={20} value={profileDraft.nickname} onChange={(event) => setProfileDraft((current) => ({ ...current, nickname: event.target.value }))} /></label>
        <label className="personal-field">生日<input type="date" value={profileDraft.birthday} onChange={(event) => setProfileDraft((current) => ({ ...current, birthday: event.target.value }))} /></label>
        <label className="personal-field personal-field--full">签名<textarea rows={3} value={profileDraft.signature} onChange={(event) => setProfileDraft((current) => ({ ...current, signature: event.target.value }))} placeholder="写一句介绍自己" /></label>
        <section className="personal-life-photo-editor personal-field--full" aria-label="编辑生活照"><div className="personal-life-photo-editor__heading"><strong>生活照</strong><label className="client-button client-button--secondary personal-upload-button"><ImagePlus size={14} />添加照片<input type="file" accept="image/*" multiple aria-label="添加生活照，可多选" onChange={(event) => { const files = Array.from(event.currentTarget.files ?? []); event.currentTarget.value = ''; void Promise.all(files.map(readImageFile)).then((images) => setProfileDraft((current) => ({ ...current, lifePhotoDataUrls: [...current.lifePhotoDataUrls, ...images] }))).catch(() => setFeedback('部分生活照无法读取，请重新选择')) }} /></label></div><div className="personal-life-photo-grid">{profileDraft.lifePhotoDataUrls.map((image, index) => <div className="personal-life-photo" key={`${index}-${image.slice(-24)}`}><img src={image} alt={`生活照 ${index + 1}`} /><button type="button" aria-label={`移除第 ${index + 1} 张生活照`} onClick={() => setProfileDraft((current) => ({ ...current, lifePhotoDataUrls: current.lifePhotoDataUrls.filter((_, photoIndex) => photoIndex !== index) }))}><X size={13} /></button></div>)}</div><small>可一次选择多张，图片只在当前原型会话中预览</small></section>
      </form>
    </DialogPanel>}
    {applicationKind && <DialogPanel overlayId="onboarding-application-dialog" title={applicationKind === 'companion' ? '陪玩入驻申请' : '俱乐部入驻申请'} description="填写基础资料并提交演示申请。" onClose={() => setApplicationKind(null)} width={560} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setApplicationKind(null)}>取消</button><button type="submit" form="onboarding-application" className="client-button client-button--primary" disabled={!applicationName.trim() || !applicationIntro.trim()}>提交申请</button></>}>
      <form id="onboarding-application" className="personal-profile-form" onSubmit={submitApplication}>
        <label className="personal-field">{applicationKind === 'companion' ? '申请昵称' : '俱乐部名称'}<input required maxLength={30} value={applicationName} onChange={(event) => setApplicationName(event.target.value)} /></label>
        <label className="personal-field">擅长游戏<select value={applicationGame} onChange={(event) => setApplicationGame(event.target.value)}>{games.filter((game) => game.id !== 'all').map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select></label>
        <label className="personal-field personal-field--full">{applicationKind === 'companion' ? '个人介绍' : '俱乐部介绍'}<textarea required maxLength={200} rows={4} value={applicationIntro} onChange={(event) => setApplicationIntro(event.target.value)} placeholder="填写介绍" /></label>
        <p className="personal-demo-note personal-field--full">申请状态仅在当前原型会话中展示，不代表正式审核结果。</p>
      </form>
    </DialogPanel>}
    {activeSetting === 'security' && <AccountSecurityDialog phone={boundPhone} onSavePhone={onSaveBoundPhone} endedDeviceIds={endedDeviceIds} onEndDevice={onEndDevice} onClose={() => setActiveSetting(null)} />}
    {activeSetting === 'notifications' && <NotificationSettingsDialog preferences={notifications} onChange={onUpdateNotifications} onClose={() => setActiveSetting(null)} />}
    {activeSetting === 'blacklist' && <BlacklistDialog profiles={blockedProfiles} onRemove={onUnblockProfile} onClose={() => setActiveSetting(null)} />}
    {activeSetting === 'logout' && <DialogPanel overlayId="logout-confirmation-dialog" title="退出登录" description="确认退出当前账号并返回登录页？" onClose={() => setActiveSetting(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setActiveSetting(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={onLogout}>确认退出</button></>}><p className="social-dialog-copy">退出后将返回登录页面。本次原型不会清除或提交真实账号数据。</p></DialogPanel>}
  </div>
}

function ProfileOverview({ profile, onEdit, orders, diamondBalance, beanBalance, onOpenWallet, onOpenOrders, feedback, onFeedback, onOpenSetting }: {
  profile: PlayerProfile
  onEdit: () => void
  orders: ClientOrder[]
  diamondBalance: number
  beanBalance: number
  onOpenWallet: () => void
  onOpenOrders: () => void
  feedback: string
  onFeedback: (feedback: string) => void
  onOpenSetting: (setting: 'security' | 'notifications' | 'blacklist' | 'logout') => void
}) {
  const [playerIdCopied, setPlayerIdCopied] = useState(false)
  const [lifePhotoIndex, setLifePhotoIndex] = useState(0)
  const lifePhotoCount = profile.lifePhotoDataUrls.length
  const visibleLifePhotoIndex = lifePhotoCount ? lifePhotoIndex % lifePhotoCount : 0
  useEffect(() => {
    if (lifePhotoCount < 2) return
    const timer = window.setInterval(() => setLifePhotoIndex((index) => (index % lifePhotoCount + 1) % lifePhotoCount), 3000)
    return () => window.clearInterval(timer)
  }, [lifePhotoCount])
  const pendingOrderCount = orders.filter((order) => order.status === '待接单' || order.status === '待服务').length
  const activeOrderCount = orders.filter((order) => order.status === '服务中').length
  const settings = [
    { id: 'security', label: '账号安全', icon: LockKeyhole },
    { id: 'notifications', label: '通知设置', icon: Settings2 },
    { id: 'blacklist', label: '黑名单', icon: ShieldCheck },
    { id: 'logout', label: '退出登录', icon: LogOut },
  ]
  return <section className="personal-module personal-profile-module">
    <ModuleHeading title="个人资料" action={<button type="button" className="client-button client-button--secondary" onClick={onEdit}><Pencil size={14} />编辑资料</button>} />
    <section className="client-card account-profile-card personal-profile-card"><ProfileAvatar profile={profile} size="lg" /><div className="account-profile-card__identity"><h2>{profile.nickname}</h2><span>{profile.gender} · {calculateAge(profile.birthday)} 岁 · 生日 {profile.birthday || '未设置'}</span><div className="personal-user-id"><span>用户 ID：{profile.userId}</span><button type="button" onClick={() => { void (async () => { try { if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(profile.userId); setPlayerIdCopied(true) } catch { setPlayerIdCopied(false); onFeedback('复制失败，请重试。') } })() }} aria-label={`复制用户 ID ${profile.userId}`}>{playerIdCopied ? <><Check size={13} />已复制</> : <><Copy size={13} />复制</>}</button></div><p className="personal-profile-signature">{profile.signature || '暂无签名'}</p></div><div className="account-social-stats"><Metric label="朋友" value={profile.friends} /><Metric label="关注" value={profile.following} /><Metric label="粉丝" value={profile.followers} /></div></section>
    <div className="personal-account-overview">
      <section className="client-card personal-life-photos"><header><h3>生活照</h3><div className="personal-life-photo-controls"><span>{lifePhotoCount ? `${visibleLifePhotoIndex + 1} / ${lifePhotoCount}` : '0 张'}</span><button type="button" aria-label="上一张生活照" disabled={lifePhotoCount < 2} onClick={() => setLifePhotoIndex((visibleLifePhotoIndex - 1 + lifePhotoCount) % lifePhotoCount)}><ChevronLeft size={15} /></button><button type="button" aria-label="下一张生活照" disabled={lifePhotoCount < 2} onClick={() => setLifePhotoIndex((visibleLifePhotoIndex + 1) % lifePhotoCount)}><ChevronRight size={15} /></button></div></header>{lifePhotoCount ? <div className="personal-life-photo-stage"><img src={profile.lifePhotoDataUrls[visibleLifePhotoIndex]} alt={`生活照 ${visibleLifePhotoIndex + 1}`} /></div> : <p>暂无生活照</p>}</section>
      <div className="personal-summary-stack">
        <section className="client-card personal-summary-card"><div className="client-section-heading"><div><span className="client-eyebrow">账户资产</span><h2>钱包</h2></div><button type="button" className="client-text-button" onClick={onOpenWallet}>钱包总览 <ChevronRight size={15} /></button></div><div className="personal-summary-values"><BalanceMini icon={<Coins size={16} />} label="钻石" value={diamondBalance} /><BalanceMini icon={<WalletCards size={16} />} label="糖豆" value={beanBalance} /></div></section>
        <section className="client-card personal-summary-card"><div className="client-section-heading"><div><span className="client-eyebrow">服务订单</span><h2>订单</h2></div><button type="button" className="client-text-button" onClick={onOpenOrders}>全部订单 <ChevronRight size={15} /></button></div><div className="personal-order-stats"><button type="button" onClick={onOpenOrders}><span>全部订单</span><strong>{orders.length}</strong></button><button type="button" onClick={onOpenOrders}><span>待处理</span><strong>{pendingOrderCount}</strong></button><button type="button" onClick={onOpenOrders}><span>服务中</span><strong>{activeOrderCount}</strong></button></div></section>
      </div>
    </div>
    <section className="client-card account-settings-card"><div className="client-section-heading"><div><span className="client-eyebrow">账户偏好</span><h2>常用设置</h2></div><UserRound size={18} className="client-muted" /></div><div className="account-settings-list">{settings.map((item) => <button type="button" key={item.id} onClick={() => onOpenSetting(item.id as 'security' | 'notifications' | 'blacklist' | 'logout')}><item.icon size={17} /><span>{item.label}</span><ChevronRight size={16} /></button>)}</div>{feedback && <FeedbackMessage>{feedback}<button type="button" onClick={() => onFeedback('')} aria-label="关闭提示"><X size={14} /></button></FeedbackMessage>}</section>
  </section>
}

const mockDevices = [
  { id: 'device-current', name: 'Windows 客户端', detail: '本设备 · 当前登录', current: true },
  { id: 'device-laptop', name: 'Windows 笔记本', detail: '最近登录：今天 09:42', current: false },
  { id: 'device-phone', name: 'Android 设备', detail: '最近登录：10 月 26 日', current: false },
]

function maskPhone(phone: string) {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

function AccountSecurityDialog({ phone, onSavePhone, endedDeviceIds, onEndDevice, onClose }: {
  phone: string
  onSavePhone: (phone: string) => void
  endedDeviceIds: string[]
  onEndDevice: (deviceId: string) => void
  onClose: () => void
}) {
  const [changingPhone, setChangingPhone] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [code, setCode] = useState('')
  const [pendingDeviceId, setPendingDeviceId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const changePhone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!/^1\d{10}$/.test(newPhone)) { setError('请输入正确的 11 位手机号。'); return }
    if (!/^\d{6}$/.test(code)) { setError('请输入 6 位数字验证码。'); return }
    onSavePhone(newPhone)
    setNewPhone('')
    setCode('')
    setChangingPhone(false)
    setFeedback('手机号已更新')
  }
  const pendingDevice = mockDevices.find((device) => device.id === pendingDeviceId)
  return <DialogPanel overlayId="account-security-dialog" title="账号安全" description="管理绑定手机号和登录设备。" onClose={onClose} width={600} footer={pendingDevice ? <><button type="button" className="client-button client-button--secondary" onClick={() => setPendingDeviceId(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { onEndDevice(pendingDevice.id); setPendingDeviceId(null); setFeedback('已结束该设备的登录') }}>确认结束登录</button></> : <button type="button" className="client-button client-button--secondary" onClick={onClose}>完成</button>}>
    {pendingDevice ? <div className="personal-setting-confirm"><Monitor size={22} /><div><strong>结束「{pendingDevice.name}」的登录？</strong><p>该设备将退出当前账号。此操作仅更新本次原型中的设备状态。</p></div></div> : <div className="personal-setting-content">
      <section className="personal-setting-section"><header><div><span className="client-eyebrow">绑定手机</span><strong>{maskPhone(phone)}</strong></div><button type="button" className="client-button client-button--secondary" onClick={() => { setChangingPhone((value) => !value); setError('') }}>{changingPhone ? '取消更换' : '更换手机号'}</button></header>
        {changingPhone && <form className="personal-phone-form" onSubmit={changePhone}><label className="personal-setting-field" htmlFor="personal-new-phone">新手机号<input id="personal-new-phone" type="tel" inputMode="numeric" maxLength={11} placeholder="请输入 11 位手机号" value={newPhone} onChange={(event) => setNewPhone(event.target.value.replace(/\D/g, ''))} /></label><div className="personal-setting-field"><label htmlFor="personal-phone-code">验证码</label><div className="personal-code-field"><input id="personal-phone-code" inputMode="numeric" maxLength={6} placeholder="输入验证码" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} /><button type="submit" className="client-button client-button--primary">验证并更换</button></div></div><small>请输入 6 位数字验证码（本地演示）</small>{error && <p className="personal-setting-error" role="alert">{error}</p>}</form>}
      </section>
      <section className="personal-setting-section"><header><div><span className="client-eyebrow">登录设备</span><strong>{mockDevices.filter((device) => !endedDeviceIds.includes(device.id)).length} 台设备</strong></div></header><div className="personal-device-list">{mockDevices.filter((device) => !endedDeviceIds.includes(device.id)).map((device) => <article key={device.id}><span className="personal-device-icon"><Monitor size={17} /></span><div><strong>{device.name}{device.current && <small>当前设备</small>}</strong><span>{device.detail}</span></div>{device.current ? <span className="personal-device-current">当前使用</span> : <button type="button" className="client-button client-button--secondary" onClick={() => setPendingDeviceId(device.id)}>结束登录</button>}</article>)}{mockDevices.every((device) => endedDeviceIds.includes(device.id)) && <p className="personal-setting-empty">暂无其他登录设备</p>}</div></section>
      {feedback && <FeedbackMessage>{feedback}</FeedbackMessage>}
    </div>}
  </DialogPanel>
}

const notificationOptions: { key: keyof NotificationPreferences; label: string; description: string; icon: typeof Bell }[] = [
  { key: 'desktopReminder', label: '桌面提醒', description: '在客户端外显示新消息提醒', icon: Monitor },
  { key: 'sound', label: '声音提醒', description: '播放消息与状态变化提示音', icon: Volume2 },
  { key: 'privateMessages', label: '私聊消息', description: '好友发来的私聊消息', icon: MessageCircle },
  { key: 'groupMessages', label: '群聊消息', description: '群聊中的新消息', icon: UsersRound },
  { key: 'orderUpdates', label: '订单更新', description: '订单状态和服务进度变化', icon: PackageCheck },
  { key: 'announcements', label: '平台公告', description: '平台活动与规则更新', icon: Megaphone },
]

function NotificationSettingsDialog({ preferences, onChange, onClose }: { preferences: NotificationPreferences; onChange: (preferences: NotificationPreferences) => void; onClose: () => void }) {
  return <DialogPanel overlayId="notification-settings-dialog" title="通知设置" description="选择希望接收的提醒。" onClose={onClose} width={560} footer={<button type="button" className="client-button client-button--secondary" onClick={onClose}>完成</button>}>
    <div className="personal-notification-list">{notificationOptions.map(({ key, label, description, icon: Icon }) => <div className="personal-notification-row" key={key}><span className="personal-device-icon"><Icon size={17} /></span><div><strong>{label}</strong><small>{description}</small></div><button type="button" role="switch" aria-checked={preferences[key]} aria-label={label} className={`personal-toggle${preferences[key] ? ' is-on' : ''}`} onClick={() => onChange({ ...preferences, [key]: !preferences[key] })}><span /></button></div>)}</div>
  </DialogPanel>
}

function BlacklistDialog({ profiles, onRemove, onClose }: { profiles: BlockedProfile[]; onRemove: (profileId: string) => void; onClose: () => void }) {
  const [removedId, setRemovedId] = useState<string | null>(null)
  const visibleProfiles = profiles.filter((profile) => profile.id !== removedId)
  return <DialogPanel overlayId="profile-blacklist-dialog" title="黑名单" description="移除后可重新查看资料并发起私聊，历史消息会保留。" onClose={onClose} width={560} footer={<button type="button" className="client-button client-button--secondary" onClick={onClose}>完成</button>}>
    {visibleProfiles.length ? <div className="personal-blacklist-list">{visibleProfiles.map((profile) => <article key={profile.id}><AvatarMark initials={profile.initials} size="sm" /><div><strong>{profile.name}</strong><small>{profile.kind} · ID：{profile.profileId}</small></div><button type="button" className="client-button client-button--secondary" onClick={() => { onRemove(profile.id); setRemovedId(profile.id) }}>移除</button></article>)}</div> : <div className="personal-blacklist-empty"><Shield size={24} /><strong>黑名单为空</strong><span>被拉黑的玩家和陪玩会显示在这里</span></div>}
  </DialogPanel>
}

function ProfileAvatar({ profile, size }: { profile: PlayerProfile; size: 'sm' | 'md' | 'lg' }) {
  if (profile.avatarDataUrl) return <span className={`client-avatar client-avatar--${size} personal-avatar-image`}><img src={profile.avatarDataUrl} alt="" /></span>
  return <AvatarMark initials={profile.initials} size={size} />
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('图片读取失败'))
    reader.onerror = () => reject(reader.error ?? new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

function calculateAge(birthday: string) {
  if (!birthday) return '—'
  const birthDate = new Date(`${birthday}T00:00:00`)
  if (Number.isNaN(birthDate.getTime())) return '—'
  const today = new Date()
  const hasBirthdayPassed = today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  return today.getFullYear() - birthDate.getFullYear() - (hasBirthdayPassed ? 0 : 1)
}

function ModuleHeading({ title, description, count, action }: { title: string; description?: string; count?: string; action?: ReactNode }) {
  return <header className="personal-module-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><div className="personal-module-heading__actions">{count && <span className="client-eyebrow">{count}</span>}{action}</div></header>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="account-metric"><strong>{value}</strong><span>{label}</span></div>
}

function BalanceMini({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="account-balance-mini"><span>{icon}{label}</span><strong>{value.toLocaleString()}</strong></div>
}

function OnboardingCard({ icon, title, description, submitted, onApply }: { icon: ReactNode; title: string; description: string; submitted: boolean; onApply: () => void }) {
  return <article className="client-card onboarding-card"><span className="onboarding-card__icon">{icon}</span><div><div className="personal-card-title"><h3>{title}</h3>{submitted && <span className="personal-status"><BadgeCheck size={13} />已提交</span>}</div><p>{description}</p></div><button type="button" className="client-button client-button--primary" onClick={onApply}>{submitted ? '再次申请' : '开始申请'}<ChevronRight size={15} /></button></article>
}

function VisitList({ tab }: { tab: VisitTab }) {
  const records = tab === 'footprints' ? profileFootprints : tab === 'visitors' ? profileVisitors : profileRoomVisits
  const emptyText = tab === 'visitors' ? '还没有访客记录' : tab === 'rooms' ? '还没有进房记录' : '还没有浏览足迹'
  return records.length ? <div className="personal-visit-list">{records.map((record) => <article className="client-card personal-visit-row" key={record.id}><AvatarMark initials={record.initials} size="sm" /><div className="personal-visit-row__main"><strong>{record.name}</strong><small>{record.detail}</small></div><time>{record.time}</time>{tab === 'rooms' && <span className="personal-record-kind"><UsersRound size={13} />语音房</span>}</article>)}</div> : <EmptyPanel icon={<History size={22} />} title={emptyText} />
}

function EmptyPanel({ icon, title, action, actionClassName = 'client-button--secondary', onAction }: { icon: ReactNode; title: string; action?: string; actionClassName?: string; onAction?: () => void }) {
  return <div className="personal-empty-state"><span>{icon}</span><strong>{title}</strong>{action && onAction && <button type="button" className={`client-button ${actionClassName}`} onClick={onAction}>{action}</button>}</div>
}

function FeedbackMessage({ children }: { children: ReactNode }) {
  return <p className="account-inline-feedback" role="status">{children}</p>
}

