/**
 * @name 游戏陪玩平台客户端
 * 玩家端 Windows 客户端原型，包含发现、下单、个人中心、钱包和订单页面。
 */
import { useState } from 'react'
import { Building2, Gamepad2, Headphones, History, MessageCircle, Swords, UserRound, WalletCards } from 'lucide-react'
import { RightDrawer, WindowsClientFrame, WindowsSidebar, WindowsTitleBar } from '@/components/WindowsClient'
import { usePrototypeState, type PrototypePreviewProps } from '@/prototypes/previewState'
import { playerProfile } from './data/accountMockData'
import { useAccountLogic } from './hooks/useAccountLogic'
import { BeanWithdrawPanel, CheckoutPage, OrderDetailPanel, OrdersPage, PersonalCenterPage, WalletLedgerPanel, WalletPage } from './pages/AccountPages'
import { CompanionDetailPage } from './pages/CompanionDetailPage'
import { ClubDetailPage } from './pages/ClubDetailPage'
import { HomePage } from './pages/HomePage'
import { AvatarMark } from './components/AvatarMark'
import { MessagesPage, VoiceRoomsPage } from './pages/SocialPages'
import { useSocialLogic } from './hooks/useSocialLogic'
import { useClientNavigation } from './useClientNavigation'
import { companions, servicesByCompanion, type Companion } from './data/mockData'
import { CouponsPage, PremiumCardDetailPage, PremiumCardsPage, RechargePage } from './pages/StorePages'
import { premiumCards } from './data/storeMockData'
import { ClubGroupsPanel } from './pages/ClubGroupsPanel'
import { MatchPanel } from './pages/MatchPanel'
import { useMatchLogic } from './hooks/useMatchLogic'
import './style.css'

type ClientPageState = 'normal' | 'loading' | 'empty' | 'error'

export default function GameCompanionClient(props: PrototypePreviewProps<ClientPageState>) {
  const [pageState, setPageState] = usePrototypeState<ClientPageState>('normal', props)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedPremiumCardId, setSelectedPremiumCardId] = useState<string | null>(null)
  const [matchPanelOpen, setMatchPanelOpen] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [rechargeMenuState, setRechargeMenuState] = useState({ entryView: props.entryView, open: props.entryView === 'wallet-recharge' })
  if (rechargeMenuState.entryView !== props.entryView) setRechargeMenuState({ entryView: props.entryView, open: props.entryView === 'wallet-recharge' })
  const rechargeMenuOpen = rechargeMenuState.open
  const navigation = useClientNavigation(props.entryView)
  const account = useAccountLogic()
  const social = useSocialLogic()
  const match = useMatchLogic()
  const selectedOrder = account.orders.find((order) => order.id === selectedOrderId) ?? null
  const orderService = account.findOrderService(navigation.companionId, navigation.serviceId)
  const selectedPremiumCard = premiumCards.find((card) => card.id === selectedPremiumCardId && account.ownedPremiumCardIds.includes(card.id)) ?? null
  const showPremiumCardDetail = Boolean(selectedPremiumCard && (navigation.panel === 'club-cards' || navigation.panel === 'my-cards'))
  const premiumCardsDrawer = navigation.panel === 'club-cards' || navigation.panel === 'my-cards'
    ? <RightDrawer mode="inline" title={showPremiumCardDetail ? '尊享卡明细' : navigation.panel === 'club-cards' ? `${navigation.club.name} · 尊享卡` : '我的尊享卡'} description={showPremiumCardDetail ? selectedPremiumCard?.name : undefined} onClose={() => { setSelectedPremiumCardId(null); navigation.closePanel() }} className="game-companion-drawer" width="100%">{showPremiumCardDetail && selectedPremiumCard ? <PremiumCardDetailPage card={selectedPremiumCard} transactions={account.premiumCardTransactions.filter((entry) => entry.cardId === selectedPremiumCard.id)} onBack={() => setSelectedPremiumCardId(null)} /> : <PremiumCardsPage pageState={pageState} onRetry={() => setPageState('normal')} clubId={navigation.clubId} ownedOnly={navigation.panel === 'my-cards'} balance={account.diamondBalance} ownedIds={account.ownedPremiumCardIds} cardBalances={account.premiumCardBalances} onBack={navigation.closePanel} onRecharge={() => navigation.goToPage('recharge', navigation.panel === 'my-cards' ? 'my-cards' : 'club-cards')} onPurchase={account.purchasePremiumCard} onTopUp={account.rechargePremiumCard} onOpenDetails={setSelectedPremiumCardId} />}</RightDrawer>
    : null
  const checkoutCompanions = navigation.companionIds.map((id) => companions.find((companion) => companion.id === id)).filter((companion): companion is Companion => Boolean(companion))
  const isWalletPage = navigation.page === 'wallet' || props.entryView === 'wallet-recharge'
  const isRechargeModalOpen = navigation.panel === 'diamond-recharge' || rechargeMenuOpen
  const closeRechargeModal = () => {
    setRechargeMenuState({ entryView: props.entryView, open: false })
    if (navigation.panel === 'diamond-recharge') navigation.closePanel()
  }
  const activeNavId = navigation.page === 'profile' || navigation.page === 'wallet' || navigation.page === 'orders' || props.entryView === 'wallet-recharge'
    ? navigation.page
    : navigation.page === 'messages' || navigation.page === 'voice-room'
      ? navigation.page
    : 'home'

  return <WindowsClientFrame
    className="game-companion-client"
    titleBar={<WindowsTitleBar title="游戏陪玩平台" leading={<Gamepad2 size={16} />} actions={<button type="button" className="client-titlebar-account" onClick={() => navigation.goToPage('profile')} aria-label="打开个人中心" title="个人中心"><AvatarMark initials={playerProfile.initials} size="sm" /></button>} />}
    sidebar={<WindowsSidebar
      heading="陪玩平台"
      items={[
        { id: 'quick-match', label: isMatching ? '匹配中' : '一键匹配', icon: <Swords size={16} />, variant: 'primary' },
        { id: 'home', label: '首页', icon: <Building2 size={16} /> },
        { id: 'profile', label: '个人中心', icon: <UserRound size={16} /> },
        { id: 'wallet', label: '我的钱包', icon: <WalletCards size={16} /> },
        { id: 'orders', label: '我的订单', icon: <History size={16} /> },
        { id: 'messages', label: '消息', icon: <MessageCircle size={16} /> },
        { id: 'voice-room', label: '语音房', icon: <Headphones size={16} /> },
      ]}
      activeId={matchPanelOpen || isMatching ? 'quick-match' : activeNavId}
      onSelect={(id) => id === 'quick-match' ? setMatchPanelOpen(true) : id === 'home' ? navigation.goHome() : navigation.goToPage(id as 'profile' | 'wallet' | 'orders' | 'messages' | 'voice-room')}
      footer={<button type="button" className="client-sidebar-profile-link" onClick={() => navigation.goToPage('profile')}><span className="client-sidebar-footer__dot" />玩家中心</button>}
    />}
    rightPanel={navigation.panel === 'club-groups' && navigation.page === 'club-detail' ? <RightDrawer mode="inline" title="俱乐部群聊" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><ClubGroupsPanel club={navigation.club} groups={social.clubGroups.filter((group) => group.clubId === navigation.clubId)} onApply={social.applyToClubGroup} onOpenChat={(groupId) => { social.openClubGroupChat(groupId); navigation.goToPage('messages') }} /></RightDrawer> : navigation.panel === 'diamond-ledger' ? <RightDrawer mode="inline" title="钻石明细" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><WalletLedgerPanel entries={account.diamondTransactions} /></RightDrawer> : navigation.panel === 'bean-ledger' ? <RightDrawer mode="inline" title="糖豆明细" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><WalletLedgerPanel entries={account.beanTransactions} /></RightDrawer> : premiumCardsDrawer ? premiumCardsDrawer : navigation.panel === 'coupons' ? <RightDrawer mode="inline" title="我的优惠券" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><CouponsPage pageState={pageState} onRetry={() => setPageState('normal')} coupons={account.coupons} onBack={navigation.closePanel} /></RightDrawer> : navigation.page === 'club-detail' && navigation.companion ? <RightDrawer
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
        onToggleFollow={() => social.toggleProfileFollow(navigation.companion!.id)}
        onBlock={() => social.blockProfile(navigation.companion!.id)}
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
      ><OrderDetailPanel key={selectedOrder.id} order={selectedOrder} companion={companions.find((item) => item.id === selectedOrder.companionId)} onContact={() => { social.startDirectMessageWithCompanion(selectedOrder.companionId); navigation.goToPage('messages') }} onReorder={() => {
        const services = servicesByCompanion[selectedOrder.companionId] ?? []
        const matchingService = services.find((service) => service.playName === selectedOrder.serviceName && account.getGameName(service.gameId) === selectedOrder.gameName)
          ?? services.find((service) => service.playName === selectedOrder.serviceName)
          ?? services[0]
        if (matchingService) navigation.beginOrder(matchingService.id, selectedOrder.companionId)
      }} onUpdateStatus={account.updateOrderStatus} /></RightDrawer> : undefined}
    rightPanelWidth="var(--client-profile-drawer-width)"
    overlayLayer={<>
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
      {isRechargeModalOpen && <RechargePage presentation="modal" pageState={pageState} onRetry={() => setPageState('normal')} diamondBalance={account.diamondBalance} coupons={account.coupons} onBack={closeRechargeModal} backLabel="返回钱包" onComplete={account.completeRecharge} />}
    </>}
  >
    {navigation.page === 'messages' ? <MessagesPage logic={social} pageState={pageState} onRetry={() => setPageState('normal')} onOrder={navigation.beginOrder} /> : navigation.page === 'voice-room' ? <VoiceRoomsPage logic={social} pageState={pageState} onRetry={() => setPageState('normal')} onOrder={navigation.beginOrder} /> : navigation.page === 'profile' ? <PersonalCenterPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      diamondBalance={account.diamondBalance}
      beanBalance={account.beanBalance}
      onOpenWallet={() => navigation.goToPage('wallet')}
      onOpenOrders={() => navigation.goToPage('orders')}
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
      onSelectOrder={setSelectedOrderId}
      onReorder={(order) => {
        const services = servicesByCompanion[order.companionId] ?? []
        const matchingService = services.find((service) => service.playName === order.serviceName && service.levelName === order.levelName && account.getGameName(service.gameId) === order.gameName)
          ?? services.find((service) => service.playName === order.serviceName && account.getGameName(service.gameId) === order.gameName)
          ?? services.find((service) => service.playName === order.serviceName)
          ?? services[0]
        if (matchingService) navigation.beginOrder(matchingService.id, order.companionId)
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
      onBack={() => navigation.goToPage('club-detail')}
      onOpenWallet={() => navigation.goToPage('recharge', 'checkout')}
      onSelectService={(serviceId) => navigation.beginOrder(serviceId, navigation.companionId ?? '')}
      onComplete={(quantity, amount, remark) => {
        if (!orderService) return null
        return account.completePayment(orderService.service, orderService.companion, account.getGameName(orderService.service.gameId), quantity, amount, remark, checkoutCompanions)?.id ?? null
      }}
      onOpenOrders={() => navigation.goToPage('orders')}
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
      onOpenVoiceRoom={() => navigation.goToPage('voice-room')}
      onOpenClubGroups={navigation.openClubGroups}
      onOpenMatch={() => { match.chooseClub(navigation.clubId); setMatchPanelOpen(true) }}
      onOpenPremiumCards={() => navigation.goToPage('club-cards')}
      onRetry={() => setPageState('normal')}
    /> : <HomePage
      pageState={pageState}
      onOpenClub={navigation.openClub}
      onBrowseClub={() => navigation.goToPage('voice-room')}
      onSelfOrderClub={(clubId) => { match.chooseClub(clubId); setMatchPanelOpen(true) }}
      onRetry={() => setPageState('normal')}
    />}
  </WindowsClientFrame>
}
