/**
 * @name 游戏陪玩平台客户端
 * 玩家端 Windows 客户端原型，包含发现、下单、个人中心、钱包和订单页面。
 */
import { Building2, Gamepad2, Headphones, History, MessageCircle, UserRound, WalletCards } from 'lucide-react'
import { RightDrawer, WindowsClientFrame, WindowsSidebar, WindowsTitleBar } from '@/components/WindowsClient'
import { usePrototypeState, type PrototypePreviewProps } from '@/prototypes/previewState'
import { playerProfile } from './data/accountMockData'
import { useAccountLogic } from './hooks/useAccountLogic'
import { CheckoutPage, OrdersPage, PersonalCenterPage, WalletPage } from './pages/AccountPages'
import { CompanionDetailPage } from './pages/CompanionDetailPage'
import { ClubDetailPage } from './pages/ClubDetailPage'
import { HomePage } from './pages/HomePage'
import { AvatarMark } from './components/AvatarMark'
import { MessagesPage, VoiceRoomsPage } from './pages/SocialPages'
import { useSocialLogic } from './hooks/useSocialLogic'
import { useClientNavigation } from './useClientNavigation'
import './style.css'

type ClientPageState = 'normal' | 'loading' | 'empty' | 'error'

export default function GameCompanionClient(props: PrototypePreviewProps<ClientPageState>) {
  const [pageState, setPageState] = usePrototypeState<ClientPageState>('normal', props)
  const navigation = useClientNavigation(props.entryView)
  const account = useAccountLogic()
  const social = useSocialLogic()
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
    rightPanel={navigation.page === 'club-detail' && navigation.companion ? <RightDrawer
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
      /></RightDrawer> : undefined}
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
      diamondTransactions={account.diamondTransactions}
      beanTransactions={account.beanTransactions}
    /> : navigation.page === 'orders' ? <OrdersPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      orders={account.orders}
    /> : navigation.page === 'checkout' ? <CheckoutPage
      pageState={pageState}
      onRetry={() => setPageState('normal')}
      orderService={orderService ? { ...orderService, gameName: account.getGameName(orderService.service.gameId) } : null}
      diamondBalance={account.diamondBalance}
      onBack={() => navigation.goToPage('club-detail')}
      onOpenWallet={() => navigation.goToPage('wallet')}
      onComplete={(durationHours, amount) => {
        if (!orderService) return null
        return account.completePayment(orderService.service, orderService.companion, account.getGameName(orderService.service.gameId), durationHours, amount)?.id ?? null
      }}
      onOpenOrders={() => navigation.goToPage('orders')}
    /> : navigation.page === 'club-detail' ? <ClubDetailPage
      club={navigation.club}
      pageState={pageState}
      onBack={navigation.goHome}
      onOpenCompanion={navigation.openCompanion}
      onRetry={() => setPageState('normal')}
    /> : <HomePage
      pageState={pageState}
      onOpenClub={navigation.openClub}
      onRetry={() => setPageState('normal')}
    />}
  </WindowsClientFrame>
}
