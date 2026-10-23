/**
 * @name 游戏陪玩平台客户端
 * 玩家端 Windows 客户端原型，包含发现、下单、个人中心、钱包和订单页面。
 */
import { useState } from 'react'
import { Building2, Gamepad2, Headphones, History, MessageCircle, UserRound, WalletCards } from 'lucide-react'
import { RightDrawer, WindowsClientFrame, WindowsSidebar, WindowsTitleBar } from '@/components/WindowsClient'
import { usePrototypeState, type PrototypePreviewProps } from '@/prototypes/previewState'
import { playerProfile } from './data/accountMockData'
import { useAccountLogic } from './hooks/useAccountLogic'
import { CheckoutPage, OrderDetailPanel, OrdersPage, PersonalCenterPage, WalletLedgerPanel, WalletPage } from './pages/AccountPages'
import { CompanionDetailPage } from './pages/CompanionDetailPage'
import { ClubDetailPage } from './pages/ClubDetailPage'
import { HomePage } from './pages/HomePage'
import { AvatarMark } from './components/AvatarMark'
import { MessagesPage, VoiceRoomsPage } from './pages/SocialPages'
import { useSocialLogic } from './hooks/useSocialLogic'
import { useClientNavigation } from './useClientNavigation'
import { companions, servicesByCompanion } from './data/mockData'
import { CouponsPage, PremiumCardsPage, RechargePage } from './pages/StorePages'
import './style.css'

type ClientPageState = 'normal' | 'loading' | 'empty' | 'error'

export default function GameCompanionClient(props: PrototypePreviewProps<ClientPageState>) {
  const [pageState, setPageState] = usePrototypeState<ClientPageState>('normal', props)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const navigation = useClientNavigation(props.entryView)
  const account = useAccountLogic()
  const social = useSocialLogic()
  const selectedOrder = account.orders.find((order) => order.id === selectedOrderId) ?? null
  const orderService = account.findOrderService(navigation.companionId, navigation.serviceId)
  const activeNavId = navigation.page === 'profile' || navigation.page === 'wallet' || navigation.page === 'orders'
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
        { id: 'home', label: '首页', icon: <Building2 size={16} /> },
        { id: 'profile', label: '个人中心', icon: <UserRound size={16} /> },
        { id: 'wallet', label: '我的钱包', icon: <WalletCards size={16} /> },
        { id: 'orders', label: '我的订单', icon: <History size={16} /> },
        { id: 'messages', label: '消息', icon: <MessageCircle size={16} /> },
        { id: 'voice-room', label: '语音房', icon: <Headphones size={16} /> },
      ]}
      activeId={activeNavId}
      onSelect={(id) => id === 'home' ? navigation.goHome() : navigation.goToPage(id as 'profile' | 'wallet' | 'orders' | 'messages' | 'voice-room')}
      footer={<button type="button" className="client-sidebar-profile-link" onClick={() => navigation.goToPage('profile')}><span className="client-sidebar-footer__dot" />玩家中心</button>}
    />}
    rightPanel={navigation.panel === 'diamond-ledger' ? <RightDrawer mode="inline" title="钻石明细" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><WalletLedgerPanel entries={account.diamondTransactions} /></RightDrawer> : navigation.panel === 'bean-ledger' ? <RightDrawer mode="inline" title="糖豆明细" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><WalletLedgerPanel entries={account.beanTransactions} /></RightDrawer> : navigation.panel === 'club-cards' ? <RightDrawer mode="inline" title={`${navigation.club.name} · 尊享卡`} onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><PremiumCardsPage pageState={pageState} onRetry={() => setPageState('normal')} clubId={navigation.clubId} balance={account.diamondBalance} ownedIds={account.ownedPremiumCardIds} cardBalances={account.premiumCardBalances} onBack={navigation.closePanel} onRecharge={() => navigation.goToPage('recharge', 'club-cards')} onPurchase={account.purchasePremiumCard} onTopUp={account.rechargePremiumCard} /></RightDrawer> : navigation.panel === 'coupons' ? <RightDrawer mode="inline" title="我的优惠券" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><CouponsPage pageState={pageState} onRetry={() => setPageState('normal')} coupons={account.coupons} onBack={navigation.closePanel} /></RightDrawer> : navigation.panel === 'my-cards' ? <RightDrawer mode="inline" title="我的尊享卡" onClose={navigation.closePanel} className="game-companion-drawer" width="100%"><PremiumCardsPage pageState={pageState} onRetry={() => setPageState('normal')} clubId={navigation.clubId} ownedOnly balance={account.diamondBalance} ownedIds={account.ownedPremiumCardIds} cardBalances={account.premiumCardBalances} onBack={navigation.closePanel} onRecharge={() => navigation.goToPage('recharge', 'my-cards')} onPurchase={account.purchasePremiumCard} onTopUp={account.rechargePremiumCard} /></RightDrawer> : navigation.page === 'club-detail' && navigation.companion ? <RightDrawer
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
  >
    {navigation.page === 'messages' ? <MessagesPage logic={social} pageState={pageState} onRetry={() => setPageState('normal')} onOrder={navigation.beginOrder} /> : navigation.page === 'voice-room' ? <VoiceRoomsPage logic={social} pageState={pageState} onRetry={() => setPageState('normal')} /> : navigation.page === 'profile' ? <PersonalCenterPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      diamondBalance={account.diamondBalance}
      beanBalance={account.beanBalance}
      onOpenWallet={() => navigation.goToPage('wallet')}
      onOpenOrders={() => navigation.goToPage('orders')}
    /> : navigation.page === 'wallet' ? <WalletPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      diamondBalance={account.diamondBalance}
      beanBalance={account.beanBalance}
      availableCouponCount={account.coupons.filter((coupon) => coupon.status === '可用').length}
      ownedPremiumCardCount={account.ownedPremiumCardIds.length}
      onOpenRecharge={() => navigation.goToPage('recharge', 'wallet')}
      onOpenDiamondDetails={() => navigation.openWalletLedger('diamond')}
      onOpenBeanDetails={() => navigation.openWalletLedger('bean')}
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
    /> : navigation.page === 'orders' ? <OrdersPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      orders={account.orders}
      selectedOrderId={selectedOrderId}
      onSelectOrder={setSelectedOrderId}
    /> : navigation.page === 'checkout' ? <CheckoutPage
      key={orderService?.service.id ?? 'missing-service'}
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      orderService={orderService ? { ...orderService, gameName: account.getGameName(orderService.service.gameId) } : null}
      availableServices={servicesByCompanion[navigation.companionId ?? ''] ?? []}
      diamondBalance={account.diamondBalance}
      onBack={() => navigation.goToPage('club-detail')}
      onOpenWallet={() => navigation.goToPage('recharge', 'checkout')}
      onSelectService={(serviceId) => navigation.beginOrder(serviceId, navigation.companionId ?? '')}
      onComplete={(quantity, amount, remark) => {
        if (!orderService) return null
        return account.completePayment(orderService.service, orderService.companion, account.getGameName(orderService.service.gameId), quantity, amount, remark)?.id ?? null
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
      onOpenPremiumCards={() => navigation.goToPage('club-cards')}
      onRetry={() => setPageState('normal')}
    /> : <HomePage
      pageState={pageState}
      onOpenClub={navigation.openClub}
      onBrowseClub={() => navigation.goToPage('voice-room')}
      onRetry={() => setPageState('normal')}
    />}
  </WindowsClientFrame>
}
