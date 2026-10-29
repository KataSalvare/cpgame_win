/**
 * @name 游戏陪玩平台客户端
 * 玩家端 Windows 客户端原型，包含发现、下单、个人中心、钱包和订单页面。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Building2, Gamepad2, Headphones, History, LayoutDashboard, MessageCircle, Search, Sparkles, Swords, UserRound, WalletCards } from 'lucide-react'
import { DialogPanel, RightDrawer, WindowsClientFrame, WindowsSidebar, WindowsTitleBar } from '@/components/WindowsClient'
import { usePrototypeState, type PrototypePreviewProps } from '@/prototypes/previewState'
import { playerProfile, type PlayerProfile } from './data/accountMockData'
import { useAccountLogic } from './hooks/useAccountLogic'
import { BeanExchangePanel, BeanWithdrawPanel, CheckoutPage, OrderDetailPanel, OrdersPage, PersonalCenterPage, WalletLedgerPanel, WalletPage } from './pages/AccountPages'
import { CompanionDetailPage } from './pages/CompanionDetailPage'
import { ClubDetailPage } from './pages/ClubDetailPage'
import { TalentsPage } from './pages/TalentsPage'
import { HomePage } from './pages/HomePage'
import { AvatarMark } from './components/AvatarMark'
import { ProfileQuickPanel } from './components/ProfileQuickPanel'
import { GiftPanel, type GiftRecipient } from './components/GiftPanel'
import { ClubSupportChatPanel, MessagesPage, VoiceRoomsPage } from './pages/SocialPages'
import { useSocialLogic } from './hooks/useSocialLogic'
import { useClientNavigation, type ClientPage } from './useClientNavigation'
import { clubs, companions, servicesByCompanion, type Companion } from './data/mockData'
import { CouponsPage, PremiumCardDetailPage, PremiumCardsPage, RechargePage } from './pages/StorePages'
import { premiumCards } from './data/storeMockData'
import { ClubGroupsPanel } from './pages/ClubGroupsPanel'
import { MatchPanel } from './pages/MatchPanel'
import { useMatchLogic } from './hooks/useMatchLogic'
import { GlobalSearchPanel, type GlobalSearchUser } from './components/GlobalSearchPanel'
import { UserNameWithLevel } from './components/UserNameWithLevel'
import { currentSocialUser, initialVoiceCallNotifications, socialFriends, type VoiceCallNotification } from './data/socialMockData'
import { LoginPage } from './pages/LoginPage'
import { IdentityVerificationFlow } from './pages/IdentityVerificationFlow'
import { AnnouncementsPage } from './pages/AnnouncementsPage'
import { PlatformSupportDialog } from './components/PlatformSupportDialog'
import { companionToProfileCard } from './components/profileCardData'
import { CompanionProfileCard } from './components/CompanionProfileCard'
import type { ProfileCardData } from './components/profileCardData'
import { initialNotificationPreferences, type BlockedProfile, type NotificationPreferences } from './data/personalSettingsMockData'
import { clubAnnouncementCategories, clubAnnouncements, platformAnnouncementCategories, platformAnnouncements } from './data/announcementMockData'
import { WorkbenchNotifications } from './components/WorkbenchNotifications'
import { WorkbenchOrderActionDialog } from './components/WorkbenchOrderActionDialog'
import { WorkbenchOrderDetailPanel } from './components/WorkbenchOrderDetailPanel'
import { WorkbenchPage } from './pages/WorkbenchPage'
import { useWorkbenchLogic } from './hooks/useWorkbenchLogic'
import clubAdminDashboardReference from './assets/club-admin-dashboard-reference.png'
import './workbench.css'
import './style.css'

type ClientPageState = 'normal' | 'loading' | 'empty' | 'error'

export default function GameCompanionClient(props: PrototypePreviewProps<ClientPageState>) {
  const navigate = useNavigate()
  const [pageState, setPageState] = usePrototypeState<ClientPageState>('normal', props)
  const [profile, setProfile] = useState<PlayerProfile>(playerProfile)
  const [boundPhone, setBoundPhone] = useState('13800138600')
  const [endedDeviceIds, setEndedDeviceIds] = useState<string[]>([])
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(initialNotificationPreferences)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedPremiumCardId, setSelectedPremiumCardId] = useState<string | null>(null)
  const [matchPanelOpen, setMatchPanelOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [selectedSearchUser, setSelectedSearchUser] = useState<GlobalSearchUser | null>(null)
  const [platformSupportOpen, setPlatformSupportOpen] = useState(false)
  const [clubSupportChatOpen, setClubSupportChatOpen] = useState(false)
  const [companionChatOpen, setCompanionChatOpen] = useState(false)
  const [chatCompanionId, setChatCompanionId] = useState<string | null>(null)
  const [clubAdminPreviewOpen, setClubAdminPreviewOpen] = useState(false)
  const closePlatformSupport = useCallback(() => setPlatformSupportOpen(false), [])
  const [isMatching, setIsMatching] = useState(false)
  const [checkoutRechargeOpen, setCheckoutRechargeOpen] = useState(false)
  const [rechargeReturnLabel, setRechargeReturnLabel] = useState('返回钱包')
  const [checkoutRechargePromptDismissed, setCheckoutRechargePromptDismissed] = useState(false)
  const [giftPanelOpen, setGiftPanelOpen] = useState(false)
  const [giftRecipients, setGiftRecipients] = useState<GiftRecipient[]>([])
  const [fixedGiftRecipient, setFixedGiftRecipient] = useState<GiftRecipient | undefined>()
  const [giftAnchor, setGiftAnchor] = useState<HTMLButtonElement | null>(null)
  const [giftPanelKey, setGiftPanelKey] = useState(0)
  const [beanExchangeOpen, setBeanExchangeOpen] = useState(false)
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([])
  const [rechargeMenuState, setRechargeMenuState] = useState({ entryView: props.entryView, open: props.entryView === 'wallet-recharge' })
  if (rechargeMenuState.entryView !== props.entryView) setRechargeMenuState({ entryView: props.entryView, open: props.entryView === 'wallet-recharge' })
  const rechargeMenuOpen = rechargeMenuState.open
  const navigation = useClientNavigation(props.entryView)
  const voiceReturnPage = useRef<ClientPage>(navigation.page === 'voice-room' ? (window.sessionStorage.getItem('voice-room-return-page') as ClientPage | null) ?? 'home' : navigation.page)
  const [voiceRoomMinimized, setVoiceRoomMinimized] = useState(() => window.sessionStorage.getItem('voice-room-minimized') === 'true')
  useEffect(() => {
    if (navigation.page !== 'voice-room' && !voiceRoomMinimized) {
      voiceReturnPage.current = navigation.page
      window.sessionStorage.setItem('voice-room-return-page', navigation.page)
    }
  }, [navigation.page, voiceRoomMinimized])
  const leaveVoiceRoomPage = () => {
    setVoiceRoomMinimized(false)
    window.sessionStorage.removeItem('voice-room-minimized')
    navigation.goToPage(voiceReturnPage.current)
  }
  const minimizeVoiceRoom = () => {
    setVoiceRoomMinimized(true)
    window.sessionStorage.setItem('voice-room-minimized', 'true')
    navigation.goToPage(voiceReturnPage.current)
  }
  const account = useAccountLogic()
  const workbench = useWorkbenchLogic()
  const [noticesOpen, setNoticesOpen] = useState(false)
  const [voiceCallNotifications, setVoiceCallNotifications] = useState<VoiceCallNotification[]>(initialVoiceCallNotifications)
  const [voiceCallDialogOpen, setVoiceCallDialogOpen] = useState(false)
  const [selectedVoiceCallId, setSelectedVoiceCallId] = useState(initialVoiceCallNotifications[0]?.id ?? '')
  const social = useSocialLogic()
  const chatCompanion = companions.find((item) => item.id === chatCompanionId)
  const companionChatConversation = social.selectedConversation?.kind === 'direct' && chatCompanion
    ? { ...social.selectedConversation, title: chatCompanion.name, initials: chatCompanion.initials }
    : null
  const openGiftPanel = (recipients: GiftRecipient[], fixedRecipient?: GiftRecipient, anchor?: HTMLButtonElement) => {
    setGiftPanelKey((key) => key + 1)
    setGiftRecipients(recipients)
    setFixedGiftRecipient(fixedRecipient)
    setGiftAnchor(anchor ?? null)
    setGiftPanelOpen(true)
  }
  const openClubSupportChat = () => {
    social.markConversationRead('direct-club-support')
    setClubSupportChatOpen(true)
  }
  const openVoiceCallNotification = () => {
    if (!voiceCallNotifications.length) return
    if (!voiceCallNotifications.some((notification) => notification.id === selectedVoiceCallId)) setSelectedVoiceCallId(voiceCallNotifications[0].id)
    setVoiceCallDialogOpen(true)
  }
  const enterVoiceCallRoom = (notificationId: string) => {
    const notification = voiceCallNotifications.find((item) => item.id === notificationId)
    if (!notification) return
    social.selectVoiceSubchannel(notification.roomId, notification.channelId)
    setVoiceCallNotifications((items) => items.filter((item) => item.id !== notificationId))
    setVoiceCallDialogOpen(false)
    setNoticesOpen(false)
    navigation.goToPage('voice-room')
  }
  const acceptRoomInvitation = (invitation: (typeof social.voiceInvitations)[number]) => {
    if (!social.acceptVoiceInvitation(invitation)) return
    setNoticesOpen(false)
    navigation.goToPage('voice-room')
  }
  const blockedProfiles = useMemo<BlockedProfile[]>(() => social.blockedProfileIds.map((id) => {
    const companion = companions.find((item) => item.id === id)
    if (companion) {
      const card = companionToProfileCard(companion)
      return { id, name: card.name, initials: card.initials, profileId: card.userId, kind: '陪玩' }
    }
    const friend = socialFriends.find((item) => item.id === id || item.profileId === id)
    return { id, name: friend?.name ?? '未知用户', initials: friend?.initials ?? '用', profileId: friend?.profileId ?? id, kind: friend?.companionId ? '陪玩' : '玩家' }
  }), [social.blockedProfileIds])
  const match = useMatchLogic()
  const selectedOrder = account.orders.find((order) => order.id === selectedOrderId) ?? null
  const orderService = account.findOrderService(navigation.companionId, navigation.serviceId)
  const selectedPremiumCard = premiumCards.find((card) => card.id === selectedPremiumCardId && account.ownedPremiumCardIds.includes(card.id)) ?? null
  const showPremiumCardDetail = Boolean(selectedPremiumCard && (navigation.panel === 'club-cards' || navigation.panel === 'my-cards'))
  const pendingNotificationCount = workbench.pending + voiceCallNotifications.length + social.voiceInvitations.length
  const premiumCardsDrawer = navigation.panel === 'club-cards' || navigation.panel === 'my-cards'
    ? <RightDrawer mode="inline" title={showPremiumCardDetail ? '尊享卡明细' : navigation.panel === 'club-cards' ? `${navigation.club.name} · 尊享卡` : '我的尊享卡'} description={showPremiumCardDetail ? selectedPremiumCard?.name : undefined} onClose={() => { setSelectedPremiumCardId(null); navigation.closePanel() }} className="game-companion-drawer" width="100%">{showPremiumCardDetail && selectedPremiumCard ? <PremiumCardDetailPage transactions={account.premiumCardTransactions.filter((entry) => entry.cardId === selectedPremiumCard.id)} onBack={() => setSelectedPremiumCardId(null)} /> : <PremiumCardsPage pageState={pageState} onRetry={() => setPageState('normal')} clubId={navigation.clubId} ownedOnly={navigation.panel === 'my-cards'} balance={account.diamondBalance} ownedIds={account.ownedPremiumCardIds} cardBalances={account.premiumCardBalances} onBack={navigation.closePanel} onRecharge={() => navigation.goToPage('recharge', navigation.panel === 'my-cards' ? 'my-cards' : 'club-cards')} onPurchase={account.purchasePremiumCard} onTopUp={account.rechargePremiumCard} onOpenDetails={setSelectedPremiumCardId} />}</RightDrawer>
    : null
  const checkoutCompanions = navigation.companionIds.map((id) => companions.find((companion) => companion.id === id)).filter((companion): companion is Companion => Boolean(companion))
  const isWalletPage = navigation.page === 'wallet' || props.entryView === 'wallet-recharge'
  const isRechargeModalOpen = navigation.panel === 'diamond-recharge' || rechargeMenuOpen || checkoutRechargeOpen
  const closeRechargeModal = () => {
    setRechargeMenuState({ entryView: props.entryView, open: false })
    setCheckoutRechargeOpen(false)
    if (navigation.panel === 'diamond-recharge') navigation.closePanel()
  }
  const globalSearchUsers: GlobalSearchUser[] = [
    ...companions.map((companion) => ({
        id: companion.id,
        name: companion.name,
        initials: companion.initials,
        profileId: companion.id.replace('companion-', 'P-'),
        kind: '陪玩' as const,
        companionId: companion.id,
    })),
    ...socialFriends.map((friend) => ({
      id: friend.id,
      name: friend.name,
      initials: friend.initials,
      profileId: friend.profileId,
      kind: '玩家' as const,
      friendId: friend.id,
    })),
    { id: currentSocialUser.id, name: currentSocialUser.name, initials: currentSocialUser.initials, profileId: currentSocialUser.profileId, kind: '玩家' as const },
  ]
  const searchableVoiceRooms = social.voiceRooms.filter((room) => room.privacy === '公开'
    || room.channels.some((channel) => channel.members.some((member) => member.id === currentSocialUser.id))
    || social.voiceInvitations.some((invitation) => invitation.roomId === room.id))
  const selectedSearchFriend = selectedSearchUser?.friendId ? socialFriends.find((friend) => friend.id === selectedSearchUser.friendId) : undefined
  const selectedSearchProfile: ProfileCardData | null = selectedSearchUser ? selectedSearchFriend ? {
    name: selectedSearchFriend.name,
    initials: selectedSearchFriend.initials,
    status: selectedSearchFriend.status,
    gender: selectedSearchFriend.gender,
    age: selectedSearchFriend.age,
    userId: selectedSearchFriend.profileId,
    rating: selectedSearchFriend.rating,
    tags: selectedSearchFriend.tags,
    intro: selectedSearchFriend.intro,
  } : selectedSearchUser.id === currentSocialUser.id ? {
    name: currentSocialUser.name,
    initials: currentSocialUser.initials,
    status: currentSocialUser.status,
    gender: currentSocialUser.gender,
    age: currentSocialUser.age,
    userId: currentSocialUser.profileId,
    rating: currentSocialUser.rating,
    tags: currentSocialUser.tags,
    intro: currentSocialUser.intro,
  } : null : null
  const activeNavId = navigation.page === 'workbench' ? 'workbench' : navigation.page === 'talents' ? 'talents'
    : navigation.page === 'profile' || navigation.page === 'wallet' || navigation.page === 'orders' || props.entryView === 'wallet-recharge'
    ? navigation.page
    : navigation.page === 'messages' || navigation.page === 'voice-room'
      ? navigation.page
      : navigation.page === 'announcements' ? 'announcements'
        : navigation.page === 'club-announcements' ? '' : 'home'

  if (props.entryView === 'login') return <LoginPage {...props} />

  return <WindowsClientFrame
    className="game-companion-client"
    titleBar={<WindowsTitleBar title="游戏陪玩平台" leading={<Gamepad2 size={16} />} actions={<><button type="button" className="client-titlebar-search" onClick={() => setGlobalSearchOpen(true)} aria-label="全局搜索" title="搜索语音房、俱乐部和用户"><Search size={15} /><span>搜索语音房、俱乐部或用户</span></button><button type="button" className="client-titlebar-support" onClick={() => setPlatformSupportOpen(true)} aria-label="平台客服" title="平台客服"><Headphones size={16} /></button><button type="button" className="workbench-notice-button" aria-label="客户端通知" aria-expanded={noticesOpen} aria-controls="workbench-notifications" onClick={() => setNoticesOpen(value => !value)}><Bell size={16} /><span className="workbench-notice-count">{pendingNotificationCount}</span></button></>} />}
    sidebar={<WindowsSidebar
      heading="陪玩平台"
      items={[
        { id: 'quick-match', label: isMatching ? '匹配中' : '一键匹配', icon: <Swords size={16} />, group: 'quick-match', groupTitle: '', variant: 'primary' },
        { id: 'home', label: '首页', icon: <Building2 size={16} />, group: 'main', groupTitle: '' },
        { id: 'talents', label: '大神', icon: <Sparkles size={16} />, group: 'main' },
        { id: 'announcements', label: '公告', icon: <Bell size={16} />, group: 'main' },
        { id: 'messages', label: '消息', icon: <MessageCircle size={16} />, group: 'main', badge: social.totalUnread },
        { id: 'voice-room', label: '我的房间', icon: <Headphones size={16} />, group: 'main' },
        { id: 'profile', label: '个人中心', icon: <UserRound size={16} />, group: 'account', groupTitle: '' },
        { id: 'wallet', label: '我的钱包', icon: <WalletCards size={16} />, group: 'account' },
        { id: 'orders', label: '我的订单', icon: <History size={16} />, group: 'account' },
        { id: 'workbench', label: '陪玩工作台', icon: <Gamepad2 size={16} />, group: 'workbench', groupTitle: '', badge: workbench.pending },
        { id: 'club-admin', label: '俱乐部后台', icon: <LayoutDashboard size={16} />, group: 'workbench' },
      ]}
      activeId={matchPanelOpen || isMatching ? 'quick-match' : activeNavId}
      onSelect={(id) => id === 'club-admin' ? setClubAdminPreviewOpen(true) : id === 'quick-match' ? setMatchPanelOpen(true) : id === 'home' ? navigation.goHome() : id === 'voice-room' ? navigation.goToVoiceRoom('personal') : navigation.goToPage(id as 'workbench' | 'talents' | 'profile' | 'wallet' | 'orders' | 'messages' | 'announcements')}
      footer={<>{voiceRoomMinimized && <button type="button" className="voice-minimized-float" onClick={() => { setVoiceRoomMinimized(false); window.sessionStorage.removeItem('voice-room-minimized'); navigation.goToPage('voice-room') }}><Headphones size={17} /><span>语音聊天中</span><small>点击返回语音房</small><span className="voice-minimized-float__wave" aria-hidden="true"><i /><i /><i /><i /></span></button>}<ProfileQuickPanel profile={profile} diamondBalance={account.diamondBalance} beanBalance={account.beanBalance} orderCount={account.orders.length} onNavigate={(action) => navigation.goToPage(action)}>{profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="" /> : <AvatarMark initials={profile.initials} size="md" />}</ProfileQuickPanel></>}
    />}
    rightPanel={selectedSearchProfile ? <RightDrawer mode="inline" title={selectedSearchProfile.name} onClose={() => setSelectedSearchUser(null)} className="game-companion-drawer" width="100%"><div className="client-content companion-detail-page companion-detail-page--panel"><CompanionProfileCard profile={selectedSearchProfile} /></div></RightDrawer> : navigation.page === 'workbench' && pageState === 'normal' && workbench.selectedOrder ? <RightDrawer mode="inline" title="订单详情" description={workbench.selectedOrder.id} onClose={() => workbench.setSelectedOrderId(null)} className="game-order-drawer" width="100%"><WorkbenchOrderDetailPanel logic={workbench} /></RightDrawer> : navigation.panel === 'club-announcements' && navigation.page === 'club-detail' ? <RightDrawer mode="inline" title="俱乐部公告" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><AnnouncementsPage kind="club" clubName={navigation.club.name} announcements={clubAnnouncements.filter((item) => !item.clubId || item.clubId === navigation.clubId)} categories={clubAnnouncementCategories} pageState={pageState} readIds={readAnnouncementIds} onRead={(id) => setReadAnnouncementIds((ids) => ids.includes(id) ? ids : [...ids, id])} onRetry={() => setPageState('normal')} presentation="panel" /></RightDrawer> : navigation.panel === 'club-groups' && navigation.page === 'club-detail' ? <RightDrawer mode="inline" title="俱乐部群聊" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><ClubGroupsPanel club={navigation.club} groups={social.clubGroups.filter((group) => group.clubId === navigation.clubId)} onApply={social.applyToClubGroup} onOpenChat={(groupId) => { social.openClubGroupChat(groupId); navigation.goToPage('messages') }} /></RightDrawer> : navigation.panel === 'diamond-ledger' ? <RightDrawer mode="inline" title="钻石明细" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><WalletLedgerPanel entries={account.diamondTransactions} /></RightDrawer> : navigation.panel === 'bean-ledger' ? <RightDrawer mode="inline" title="糖豆明细" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><WalletLedgerPanel entries={account.beanTransactions} /></RightDrawer> : premiumCardsDrawer ? premiumCardsDrawer : navigation.panel === 'coupons' ? <RightDrawer mode="inline" title="我的优惠券" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><CouponsPage pageState={pageState} onRetry={() => setPageState('normal')} coupons={account.coupons} onBack={navigation.closePanel} /></RightDrawer> : (navigation.page === 'club-detail' || navigation.page === 'talents') && navigation.companion ? <RightDrawer
      mode="inline"
      title={navigation.companion.name}
      onClose={navigation.closeCompanion}
      className="game-companion-drawer"
      width="100%"
    ><CompanionDetailPage
        companion={navigation.companion}
        pageState={pageState}
        presentation="panel"
        onBack={navigation.closeCompanion}
        onRetry={() => setPageState('normal')}
        onOrder={navigation.beginOrder}
        followed={social.followedProfileIds.includes(navigation.companion.id)}
        blocked={social.blockedProfileIds.includes(navigation.companion.id)}
        note={social.profileNotes[navigation.companion.id] ?? ''}
        onSaveNote={(note) => social.setProfileNote(navigation.companion!.id, note)}
        onShare={(friendIds) => social.shareCompanionToFriends(navigation.companion!.id, friendIds)}
        onToggleFollow={() => social.toggleProfileFollow(navigation.companion!.id)}
        onBlock={() => social.blockProfile(navigation.companion!.id)}
        onGift={(anchor) => openGiftPanel([], { id: navigation.companion!.id, name: navigation.companion!.name, initials: navigation.companion!.initials, profileId: navigation.companion!.id.replace('companion-', 'P-') }, anchor)}
        onChat={() => {
          social.startDirectMessageWithCompanion(navigation.companion!.id)
          navigation.goToPage('messages')
        }}
      /></RightDrawer> : navigation.page === 'orders' && pageState === 'normal' && selectedOrder ? <RightDrawer
        mode="inline"
        title="订单详情"
        description={selectedOrder.id}
        onClose={() => setSelectedOrderId(null)}
        className="game-order-drawer"
        width="100%"
      ><OrderDetailPanel key={selectedOrder.id} order={selectedOrder} companion={companions.find((item) => item.id === selectedOrder.companionId)} diamondBalance={account.diamondBalance} onContact={() => { social.startDirectMessageWithCompanion(selectedOrder.companionId); navigation.goToPage('messages') }} onOpenRecharge={() => { setRechargeReturnLabel('返回订单'); setCheckoutRechargeOpen(true) }} onPauseOrder={account.pauseOrder} onRenewOrder={account.renewOrder} onReorder={() => {
        const services = servicesByCompanion[selectedOrder.companionId] ?? []
        const matchingService = services.find((service) => service.playName === selectedOrder.serviceName && account.getGameName(service.gameId) === selectedOrder.gameName)
          ?? services.find((service) => service.playName === selectedOrder.serviceName)
          ?? services[0]
        if (matchingService) navigation.beginOrder(matchingService.id, selectedOrder.companionId, 'cascade')
      }} onUpdateStatus={account.updateOrderStatus} /></RightDrawer> : undefined}
    rightPanelWidth="var(--client-profile-drawer-width)"
    overlayLayer={<>
      {workbench.orderAction && <WorkbenchOrderActionDialog key={`${workbench.orderAction.id}-${workbench.orderAction.action}`} logic={workbench} />}
      {clubAdminPreviewOpen && <DialogPanel overlayId="club-admin-dashboard-preview" title="俱乐部后台" onClose={() => setClubAdminPreviewOpen(false)} width={1680} className="club-admin-preview-dialog">
        <img src={clubAdminDashboardReference} alt="俱乐部后台工作台示例" />
      </DialogPanel>}
      <PlatformSupportDialog open={platformSupportOpen} onClose={closePlatformSupport} />
      {globalSearchOpen && <GlobalSearchPanel
        clubs={clubs}
        rooms={searchableVoiceRooms}
        users={globalSearchUsers}
        onClose={() => setGlobalSearchOpen(false)}
        onOpenClub={(clubId) => { setSelectedSearchUser(null); setGlobalSearchOpen(false); navigation.openClub(clubId) }}
        onOpenRoom={(roomId) => { setSelectedSearchUser(null); setGlobalSearchOpen(false); social.selectVoiceRoom(roomId); navigation.goToPage('voice-room') }}
        onOpenUser={(user) => {
          setGlobalSearchOpen(false)
          if (user.companionId) { setSelectedSearchUser(null); navigation.openCompanion(user.companionId) }
          else setSelectedSearchUser(user)
        }}
      />}
      {clubSupportChatOpen && <ClubSupportChatPanel conversation={social.conversations.find((item) => item.id === 'direct-club-support')} orders={account.orders} onClose={() => setClubSupportChatOpen(false)} onSend={(kind, content, duration, replyTo) => social.sendChatMessageToConversation('direct-club-support', kind, content, duration, replyTo)} onSendOrder={(order) => social.sendSupportCardToConversation('direct-club-support', order)} onReview={(messageId, rating, submitted) => social.updateSupportReviewInConversation('direct-club-support', messageId, rating, submitted)} />}
      {companionChatOpen && companionChatConversation && <ClubSupportChatPanel conversation={companionChatConversation} orders={account.orders} onClose={() => setCompanionChatOpen(false)} onSend={(kind, content, duration, replyTo) => social.sendChatMessageToConversation(companionChatConversation.id, kind, content, duration, replyTo)} onSendOrder={(order) => social.sendSupportCardToConversation(companionChatConversation.id, order)} onReview={(messageId, rating, submitted) => social.updateSupportReviewInConversation(companionChatConversation.id, messageId, rating, submitted)} />}
      <MatchPanel
      open={matchPanelOpen}
      matching={isMatching}
      logic={match}
      onMinimize={() => setMatchPanelOpen(false)}
      onRestore={() => setMatchPanelOpen(true)}
      onStartMatching={() => setIsMatching(true)}
      onGoToVoiceRoom={() => { setIsMatching(true); setMatchPanelOpen(true); navigation.goToPage('voice-room') }}
      onCancel={() => { setIsMatching(false); setMatchPanelOpen(false); navigation.goHome() }}
      onChooseCompanions={(companionIds) => {
        const selected = match.selectedService
        const servicesFor = (id: string) => servicesByCompanion[id] ?? []
        const serviceFor = (id: string) => {
          const services = servicesFor(id)
          return services.find((item) => item.gameId === match.gameId && item.playName === selected?.playName && item.levelName === selected?.levelName && item.unit === selected?.unit)
            ?? services.find((item) => item.gameId === match.gameId && item.playName === selected?.playName)
            ?? services.find((item) => item.gameId === match.gameId)
            ?? services[0]
        }
        const primaryId = companionIds.find((id) => serviceFor(id)) ?? companionIds[0]
        const service = serviceFor(primaryId) ?? selected
        if (!service) return
        setMatchPanelOpen(false)
        setIsMatching(false)
        navigation.beginMatchOrder(service.id, [primaryId, ...companionIds.filter((id) => id !== primaryId)])
      }}
      />
      {navigation.page === 'wallet' && navigation.panel === 'bean-withdraw' && <BeanWithdrawPanel balance={account.beanBalance} onWithdraw={account.withdrawBeans} onClose={navigation.closePanel} />}
      {beanExchangeOpen && <BeanExchangePanel beanBalance={account.beanBalance} onExchange={account.exchangeBeans} onClose={() => setBeanExchangeOpen(false)} />}
      {isRechargeModalOpen && <RechargePage presentation="modal" pageState={pageState} onRetry={() => setPageState('normal')} diamondBalance={account.diamondBalance} coupons={account.coupons} onBack={closeRechargeModal} backLabel={rechargeReturnLabel} onComplete={account.completeRecharge} />}
      <GiftPanel key={giftPanelKey} open={giftPanelOpen} recipients={giftRecipients} fixedRecipient={fixedGiftRecipient} anchor={giftAnchor} balance={account.diamondBalance} onClose={() => setGiftPanelOpen(false)} onPay={(gift, quantity, recipient, amount) => account.payGift(`${gift.name} × ${quantity}`, recipient.name, amount)} onRecharge={() => { setGiftPanelOpen(false); setRechargeReturnLabel('返回送礼'); setCheckoutRechargeOpen(true) }} />
      <WorkbenchNotifications logic={workbench} open={noticesOpen} voiceCallNotifications={voiceCallNotifications} voiceInvitations={social.voiceInvitations} onOpenVoiceCall={openVoiceCallNotification} onIgnoreVoiceCall={() => setVoiceCallNotifications([])} onIgnoreVoiceInvitation={social.ignoreVoiceInvitation} onAcceptVoiceInvitation={acceptRoomInvitation} />
      {voiceCallDialogOpen && voiceCallNotifications.length > 0 && <DialogPanel overlayId="voice-call-notification" title="呼叫通知" onClose={() => setVoiceCallDialogOpen(false)} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setVoiceCallDialogOpen(false)}>稍后</button><button type="button" className="client-button client-button--primary" onClick={() => enterVoiceCallRoom(selectedVoiceCallId)}>加入房间</button></>}>
        <div className="support-queue-summary"><Headphones size={18} /><strong>{voiceCallNotifications.length} 位好友邀请你加入语音房</strong></div>
        <div className="voice-call-invite-list" role="radiogroup" aria-label="选择要加入的用户房间">{voiceCallNotifications.map((invite) => <label className={`voice-call-invite${selectedVoiceCallId === invite.id ? ' is-selected' : ''}`} key={invite.id}>
          <input type="radio" name="voice-call-invite" value={invite.id} checked={selectedVoiceCallId === invite.id} onChange={() => setSelectedVoiceCallId(invite.id)} />
          <AvatarMark initials={invite.callerInitials} size="sm" />
          <span className="voice-call-invite__content"><strong><UserNameWithLevel name={invite.callerName} identityId={invite.callerName} /></strong><small>{invite.roomName} · {invite.channelName}</small></span>
          <span className="voice-call-invite__action">加入</span>
        </label>)}</div>
      </DialogPanel>}
      {props.entryView === 'identity-verification' && <IdentityVerificationFlow />}
    </>}
  >
    <>
    {navigation.page === 'workbench' ? <WorkbenchPage logic={workbench} pageState={pageState} onRetry={() => setPageState('normal')} balance={account.beanBalance} entries={account.beanTransactions} onWithdraw={account.withdrawBeans} onOpenExchange={() => setBeanExchangeOpen(true)} /> : navigation.page === 'announcements' ? <AnnouncementsPage kind="platform" announcements={platformAnnouncements} categories={platformAnnouncementCategories} pageState={pageState} readIds={readAnnouncementIds} onRead={(id) => setReadAnnouncementIds((ids) => ids.includes(id) ? ids : [...ids, id])} onRetry={() => setPageState('normal')} /> : navigation.page === 'club-announcements' ? <AnnouncementsPage kind="club" clubName={navigation.club.name} announcements={clubAnnouncements.filter((item) => !item.clubId || item.clubId === navigation.clubId)} categories={clubAnnouncementCategories} pageState={pageState} readIds={readAnnouncementIds} onRead={(id) => setReadAnnouncementIds((ids) => ids.includes(id) ? ids : [...ids, id])} onRetry={() => setPageState('normal')} onBack={() => navigation.goToPage('club-detail')} /> : navigation.page === 'messages' ? <MessagesPage orders={account.orders} logic={social} pageState={pageState} onRetry={() => setPageState('normal')} onOrder={navigation.beginOrder} onOpenGift={openGiftPanel} /> : navigation.page === 'voice-room' ? <VoiceRoomsPage logic={social} ownerSource={navigation.voiceRoomSource} pageState={pageState} onRetry={() => setPageState('normal')} onOrder={navigation.beginOrder} onMinimizeVoice={minimizeVoiceRoom} onExitVoice={leaveVoiceRoomPage} onOpenClubSupport={openClubSupportChat} onOpenGift={(recipients, fixedRecipient, anchor) => openGiftPanel(recipients, fixedRecipient, anchor)} /> : navigation.page === 'profile' ? <PersonalCenterPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      profile={profile}
      onSaveProfile={setProfile}
      orders={account.orders}
      diamondBalance={account.diamondBalance}
      beanBalance={account.beanBalance}
      onOpenWallet={() => navigation.goToPage('wallet')}
      onOpenOrders={() => navigation.goToPage('orders')}
      onOpenClub={navigation.openClub}
      boundPhone={boundPhone}
      onSaveBoundPhone={setBoundPhone}
      endedDeviceIds={endedDeviceIds}
      onEndDevice={(deviceId) => setEndedDeviceIds((ids) => ids.includes(deviceId) ? ids : [...ids, deviceId])}
      notifications={notificationPreferences}
      onUpdateNotifications={setNotificationPreferences}
      blockedProfiles={blockedProfiles}
      onUnblockProfile={social.unblockProfile}
      onLogout={() => navigate('/game-companion-login')}
    /> : isWalletPage ? <WalletPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      diamondBalance={account.diamondBalance}
      beanBalance={account.beanBalance}
      availableCouponCount={account.coupons.filter((coupon) => coupon.status === '可用').length}
      ownedPremiumCardCount={account.ownedPremiumCardIds.length}
      onOpenRecharge={navigation.openDiamondRecharge}
      onOpenDiamondDetails={() => navigation.openWalletLedger('diamond')}
      onOpenBeanDetails={() => navigation.openWalletLedger('bean')}
      onWithdrawBeans={navigation.openBeanWithdraw}
      onExchangeBeans={() => setBeanExchangeOpen(true)}
      onOpenCoupons={() => navigation.goToPage('coupons')}
      onOpenPremiumCards={() => navigation.goToPage('my-cards')}
    /> : navigation.page === 'recharge' ? <RechargePage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      diamondBalance={account.diamondBalance}
      coupons={account.coupons}
      onBack={() => navigation.returnTo === 'checkout' && navigation.companionId && navigation.serviceId
        ? navigation.beginOrder(navigation.serviceId, navigation.companionId)
        : navigation.goToPage(navigation.returnTo === 'club-cards' || navigation.returnTo === 'my-cards' ? navigation.returnTo : 'wallet')}
      backLabel={navigation.returnTo === 'checkout' ? '返回下单结算' : navigation.returnTo === 'club-cards' || navigation.returnTo === 'my-cards' ? '返回尊享卡' : '返回钱包'}
      onComplete={account.completeRecharge}
    /> : navigation.page === 'coupons' ? <CouponsPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      coupons={account.coupons}
      onBack={() => navigation.goToPage('wallet')}
    /> : navigation.page === 'club-cards' || navigation.page === 'my-cards' ? <PremiumCardsPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      clubId={navigation.clubId}
      ownedOnly={navigation.page === 'my-cards'}
      balance={account.diamondBalance}
      ownedIds={account.ownedPremiumCardIds}
      cardBalances={account.premiumCardBalances}
      onBack={() => navigation.goToPage(navigation.page === 'my-cards' ? 'wallet' : 'club-detail')}
      onRecharge={() => navigation.goToPage('recharge', navigation.panel === 'my-cards' ? 'my-cards' : 'club-cards')}
      onPurchase={account.purchasePremiumCard}
      onTopUp={account.rechargePremiumCard}
      onOpenDetails={setSelectedPremiumCardId}
    /> : navigation.page === 'orders' ? <OrdersPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      orders={account.orders}
      selectedOrderId={selectedOrderId}
      diamondBalance={account.diamondBalance}
      onSelectOrder={setSelectedOrderId}
      onPauseOrder={account.pauseOrder}
      onRenewOrder={account.renewOrder}
      onOpenRecharge={() => { setRechargeReturnLabel('返回订单'); setCheckoutRechargeOpen(true) }}
      onReorder={(order) => {
        const services = servicesByCompanion[order.companionId] ?? []
        const matchingService = services.find((service) => service.playName === order.serviceName && service.levelName === order.levelName && account.getGameName(service.gameId) === order.gameName)
          ?? services.find((service) => service.playName === order.serviceName && account.getGameName(service.gameId) === order.gameName)
          ?? services.find((service) => service.playName === order.serviceName)
          ?? services[0]
        if (matchingService) navigation.beginOrder(matchingService.id, order.companionId, 'cascade')
      }}
      onUpdateStatus={account.updateOrderStatus}
    /> : navigation.page === 'checkout' ? <CheckoutPage
      key={orderService?.service.id ?? 'missing-service'}
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      orderService={orderService ? { ...orderService, gameName: account.getGameName(orderService.service.gameId) } : null}
      availableServices={servicesByCompanion[navigation.companionId ?? ''] ?? []}
      selectedCompanions={checkoutCompanions}
      diamondBalance={account.diamondBalance}
      paymentCards={premiumCards.filter((card) => card.clubId === orderService?.companion.clubId && account.ownedPremiumCardIds.includes(card.id)).map((card) => ({ id: card.id, name: card.name, balance: account.premiumCardBalances[card.id] ?? 0, serviceDiscountRate: card.serviceDiscountRate }))}
      onBack={() => navigation.goToPage(navigation.returnTo === 'talents' ? 'talents' : 'club-detail')}
      hideRechargePrompt={checkoutRechargePromptDismissed}
      onResetRechargePrompt={() => setCheckoutRechargePromptDismissed(false)}
      onOpenWallet={() => { setCheckoutRechargePromptDismissed(true); setRechargeReturnLabel('返回下单结算'); setCheckoutRechargeOpen(true) }}
      onSelectService={(serviceId) => navigation.beginOrder(serviceId, navigation.companionId ?? '', 'cascade')}
      onCommunicate={(companionId) => { setChatCompanionId(companionId); social.startDirectMessageWithCompanion(companionId); setCompanionChatOpen(true) }}
      onComplete={(quantity, amount, remark, _selectedCompanions, tipAmount, paymentSource, premiumCardId) => {
        if (!orderService) return null
        return account.completePayment(orderService.service, orderService.companion, account.getGameName(orderService.service.gameId), quantity, amount, remark, checkoutCompanions, tipAmount, paymentSource, premiumCardId)?.id ?? null
      }}
      onOpenOrders={() => navigation.goToPage('orders')}
    /> : navigation.page === 'talents' ? <TalentsPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      onOpenCompanion={navigation.openCompanion}
      onChatWithCompanion={(companionId) => {
        social.startDirectMessageWithCompanion(companionId)
        navigation.goToPage('messages')
      }}
      onOrderWithCompanion={(companionId) => {
        const defaultService = servicesByCompanion[companionId]?.[0]
        if (defaultService) navigation.beginOrder(defaultService.id, companionId)
      }}
    /> : navigation.page === 'club-detail' ? <ClubDetailPage
      club={navigation.club}
      pageState={pageState}
      onBack={navigation.goHome}
      onOpenCompanion={navigation.openCompanion}
      onChatWithCompanion={(companionId) => {
        social.startDirectMessageWithCompanion(companionId)
        navigation.goToPage('messages')
      }}
      onOrderWithCompanion={(companionId) => {
        const defaultService = servicesByCompanion[companionId]?.[0]
        if (defaultService) navigation.beginOrder(defaultService.id, companionId)
      }}
      onOpenVoiceRoom={() => navigation.goToVoiceRoom('club')}
      onOpenClubGroups={navigation.openClubGroups}
      onOpenMatch={() => { match.chooseClub(navigation.clubId); setMatchPanelOpen(true) }}
      onOpenPremiumCards={() => navigation.goToPage('club-cards')}
      onOpenAnnouncements={navigation.openClubAnnouncements}
      social={social}
      orders={account.orders}
      onRetry={() => setPageState('normal')}
    /> : <HomePage
      followedClubIds={social.followedClubIds}
      pageState={pageState}
      onOpenClub={navigation.openClub}
      onBrowseClub={() => navigation.goToVoiceRoom('club')}
      onSelfOrderClub={(clubId) => { match.chooseClub(clubId); setMatchPanelOpen(true) }}
      onRetry={() => setPageState('normal')}
    />}
    </>
  </WindowsClientFrame>
}
