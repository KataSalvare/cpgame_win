import type { ClientOrder } from '../data/accountMockData'
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import {
  Bell, Star, ReceiptText, Check, CheckCheck, ChevronDown, ChevronRight, Circle, Clipboard, Eraser, Flag, Flame, Globe2, Headphones, MessageSquareText,
  Gift, ImagePlus, LockKeyhole, MessageCircle, Mic, MicOff, MoreHorizontal, Pencil,
  PhoneOff, Pin, Play, Plus, Reply, Search, Send, SlidersHorizontal, Smile, Trash2, Undo2, UserPlus, Users, PanelRightClose, PanelRightOpen,
  Volume2, VolumeX, X,
} from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import { currentSocialUser, initialSupportQueue, DEFAULT_VOICE_GROUP_CAPACITY, MAX_VOICE_CHANNEL_MEMBERS, MAX_VOICE_GROUP_MEMBERS, UNASSIGNED_VOICE_ROOM_ID, socialFriends, type ChatMessageKind, type SocialMessage, type VoiceMember, type VoiceRole, type VoiceSubchannel } from '../data/socialMockData'
import { clubs, companions } from '../data/mockData'
import { PageStatePanel } from '../components/PageStatePanel'
import type { useSocialLogic } from '../hooks/useSocialLogic'
import { FixedMessageFeedPanel } from '../components/FixedMessageFeedPanel'
import { fixedMessageFeeds } from '../data/socialMockData'
import type { GiftRecipient } from '../components/GiftPanel'
import { AvatarMark } from '../components/AvatarMark'
import { UserNameWithLevel } from '../components/UserNameWithLevel'
import { FollowIconButton } from '../components/FollowIconButton'
import { CompanionProfileCard } from '../components/CompanionProfileCard'
import type { ProfileCardData } from '../components/profileCardData'
import { CompanionDetailPage } from './CompanionDetailPage'
import { UserReportDialog } from '../components/UserReportDialog'
import '../social.css'

type SocialLogic = ReturnType<typeof useSocialLogic>
type VoiceRoomOption = SocialLogic['voiceRooms'][number]
type VoiceMemberAction = 'mute' | 'remove' | 'block' | 'role'
type GroupManagementAction = { type: 'admin'; memberId: string; memberName: string; makeAdmin: boolean } | { type: 'remove'; memberId: string; memberName: string } | { type: 'admin-batch'; members: { id: string; name: string }[]; makeAdmin: boolean } | { type: 'remove-batch'; members: { id: string; name: string }[] } | { type: 'leave' | 'dissolve' }
type ConversationActionType = 'pin' | 'read' | 'clear' | 'delete'
type ConversationAction = { type: 'clear' | 'delete'; conversation: NonNullable<SocialLogic['selectedConversation']> }
type VoiceMode = '自由模式' | '主持人模式' | '麦序模式'
const getMicQueueMembers = (channel?: VoiceSubchannel | null) => {
  if (!channel) return []
  const activeIds = channel.members.filter((member) => member.micOn).map((member) => member.id)
  const orderedIds = [...new Set(channel.micQueueMemberIds ?? activeIds)]
  const knownIds = new Set(orderedIds)
  return [...orderedIds, ...activeIds.filter((id) => !knownIds.has(id))]
    .map((id) => channel.members.find((member) => member.id === id))
    .filter((member): member is VoiceMember => Boolean(member?.micOn))
}
function VoiceDestinationCascade({ groups, selectedGroupId, selectedChannelId, onSelectGroup, onSelectChannel, getUnavailableReason }: {
  groups: VoiceRoomOption[]
  selectedGroupId: string
  selectedChannelId: string
  onSelectGroup: (id: string) => void
  onSelectChannel: (id: string) => void
  getUnavailableReason: (group: VoiceRoomOption, channel: VoiceSubchannel) => string | null
}) {
  const selectedGroup = groups.find((group) => group.id === selectedGroupId)
  return <div className="voice-destination-cascade" role="group" aria-label="选择目标位置">
    <section className="voice-destination-cascade__column" aria-label="分组">
      <h3>分组</h3>
      <div className="voice-destination-cascade__options">
        {groups.map((group) => <button type="button" key={group.id} className={selectedGroupId === group.id ? 'is-selected' : ''} aria-pressed={selectedGroupId === group.id} onClick={() => onSelectGroup(group.id)}><span>{group.name}</span><ChevronRight size={14} /></button>)}
        {!groups.length && <p className="voice-destination-cascade__empty">没有可选分组</p>}
      </div>
    </section>
    <section className="voice-destination-cascade__column" aria-label="房间">
      <h3>{selectedGroup ? selectedGroup.name : '房间'}</h3>
      <div className="voice-destination-cascade__options">
        {selectedGroup ? selectedGroup.channels.map((channel) => {
          const unavailableReason = getUnavailableReason(selectedGroup, channel)
          return <button type="button" key={channel.id} className={`${selectedChannelId === channel.id ? 'is-selected ' : ''}${unavailableReason ? 'is-disabled' : ''}`} aria-pressed={selectedChannelId === channel.id} disabled={Boolean(unavailableReason)} onClick={() => onSelectChannel(channel.id)}><span>{channel.name}<small>{channel.members.length}/{channel.capacity}{unavailableReason ? ` · ${unavailableReason}` : ''}</small></span><ChevronRight size={14} /></button>
        }) : <p className="voice-destination-cascade__empty">选择分组</p>}
      </div>
    </section>
  </div>
}
type PageState = 'normal' | 'loading' | 'empty' | 'error'
type PageStateProps = { pageState: PageState; onRetry: () => void }

const quickReplies = ['收到，马上来。', '等我一下，马上到。', '可以，开一把吧。', '我先准备一下。', '稍等，我马上回来。', '今天先到这里，下次再玩。']
const clubPresaleStaff = [
  { id: 'presale-1', name: '客服1号', initials: '客', hours: '13:00–22:00', available: true },
  { id: 'presale-2', name: '客服2号', initials: '服', hours: '13:00–22:00', available: true },
  { id: 'presale-3', name: '客服3号', initials: '3', hours: '13:00–22:00', available: false },
]
const clubAftersaleStaff = [
  { id: 'aftersale-1', name: '售后客服1号', initials: '售', hours: '09:00–18:00', available: true },
  { id: 'aftersale-2', name: '售后客服2号', initials: '后', hours: '09:00–18:00', available: false },
]
function QuickReplyMenu({ onSelect, className = '' }: { onSelect: (text: string) => void; className?: string }) {
  return <div className={`social-quick-replies ${className}`} role="menu" aria-label="快捷回复">{quickReplies.map((text) => <button key={text} type="button" role="menuitem" onClick={() => onSelect(text)}>{text}</button>)}</div>
}

function VoiceRecordingPanel({ onSendVoice, onTranscribe, onCancel }: { onSendVoice: (duration: number) => void; onTranscribe: () => void; onCancel: () => void }) {
  const [duration, setDuration] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setDuration((seconds) => seconds + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const timeLabel = `${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`
  return <div className="voice-recording-panel" role="group" aria-label="录音操作">
    <div className="voice-recording-panel__status"><span className="voice-recording-panel__indicator" aria-hidden="true" /><div><strong>正在录音</strong><time aria-label={`录音时长 ${timeLabel}`}>{timeLabel}</time></div><button type="button" className="windows-icon-button" aria-label="取消录音" onClick={onCancel}><X size={15} /></button></div>
    <div className="voice-recording-panel__actions"><button type="button" className="client-button client-button--primary" onClick={() => onSendVoice(Math.max(duration, 1))}><Mic size={14} />发送语音</button><button type="button" className="client-button client-button--secondary" onClick={onTranscribe}>语音转文字</button><button type="button" className="client-button client-button--secondary" onClick={onCancel}>取消</button></div>
  </div>
}

function NonNormalPageState({ pageState, onRetry }: PageStateProps) {
  if (pageState === 'normal') return null
  return <div className="social-state-wrap"><PageStatePanel
    state={pageState}
    title={pageState === 'empty' ? '暂时没有内容' : '暂时无法加载'}
    description={pageState === 'error' ? '加载遇到问题，请重试。' : '当前没有可展示的内容。'}
    actionLabel={pageState === 'error' ? '重新加载' : '返回消息'}
    onAction={onRetry}
  /></div>
}

export function MessagesPage({ logic, orders, pageState, onRetry, onOrder, onOpenGift }: PageStateProps & { logic: SocialLogic; orders: ClientOrder[]; onOrder: (serviceId: string, companionId: string) => void; onOpenGift: (recipients: GiftRecipient[], fixedRecipient?: GiftRecipient, anchor?: HTMLButtonElement) => void }) {
  const [orderDialogConversationId, setOrderDialogConversationId] = useState<string | null>(null)
  const [selectedSendOrderId, setSelectedSendOrderId] = useState('')
  const [kindFilter, setKindFilter] = useState<'all' | 'direct' | 'group'>('all')
  const [groupDialog, setGroupDialog] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupMembers, setGroupMembers] = useState<string[]>([])
  const [groupInviteOpen, setGroupInviteOpen] = useState(false)
  const [groupInvitees, setGroupInvitees] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false)
  const [playingMessage, setPlayingMessage] = useState<string | null>(null)
  const [voiceRecordingOpen, setVoiceRecordingOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [globalNotice, setGlobalNotice] = useState('')
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false)
  const [groupManagementAction, setGroupManagementAction] = useState<GroupManagementAction | null>(null)
  const [groupMemberDialog, setGroupMemberDialog] = useState<'admin' | 'remove' | null>(null)
  const [replyTarget, setReplyTarget] = useState<SocialMessage | null>(null)
  const [contextMessage, setContextMessage] = useState<SocialMessage | null>(null)
  const [contextPoint, setContextPoint] = useState({ x: 0, y: 0 })
  const [contextConversation, setContextConversation] = useState<NonNullable<SocialLogic['selectedConversation']> | null>(null)
  const [conversationAction, setConversationAction] = useState<ConversationAction | null>(null)
  const [reportTarget, setReportTarget] = useState<SocialMessage | null>(null)

  if (pageState !== 'normal') return <NonNormalPageState pageState={pageState} onRetry={onRetry} />

  const conversation = logic.selectedConversation
  const directMemberId = conversation?.kind === 'direct' ? conversation.members[0] : undefined
  const directFriend = directMemberId ? socialFriends.find((friend) => friend.id === directMemberId) : undefined
  const directCompanion = (directFriend?.companionId ? companions.find((companion) => companion.id === directFriend.companionId) : undefined)
    ?? companions.find((companion) => companion.id === directMemberId)
  const directUserTags = directFriend?.tags ?? directCompanion?.tags ?? []
  const selectedProfile = logic.selectedProfile
  const selectedProfileFriend = selectedProfile ? socialFriends.find((friend) => friend.id === selectedProfile.id) : undefined
  const linkedCompanion = selectedProfileFriend?.companionId ? companions.find((item) => item.id === selectedProfileFriend.companionId) : undefined
  const selectedProfileCard: ProfileCardData | undefined = selectedProfile ? {
    name: selectedProfile.name,
    initials: selectedProfile.initials,
    status: selectedProfile.status,
    gender: selectedProfile.gender,
    age: selectedProfile.age,
    userId: selectedProfile.profileId,
    rating: selectedProfile.rating,
    tags: selectedProfile.tags,
    intro: selectedProfile.intro,
  } : undefined
  const filteredConversations = logic.visibleConversations.filter((item) => kindFilter === 'all' || item.kind === kindFilter)
  const groupMemberCandidates = conversation?.kind === 'group' ? conversation.members.map((id) => socialFriends.find((friend) => friend.id === id)).filter((friend): friend is (typeof socialFriends)[number] => Boolean(friend)) : []
  const conversationGiftRecipient: GiftRecipient | undefined = conversation?.kind === 'direct' ? (() => {
    const memberId = conversation.members[0]
    const friend = socialFriends.find((item) => item.id === memberId)
    const companion = companions.find((item) => item.id === memberId)
    return friend ? { id: friend.id, name: friend.name, initials: friend.initials, profileId: friend.profileId } : companion ? { id: companion.id, name: companion.name, initials: companion.initials, profileId: companion.id.replace('companion-', 'P-') } : conversation ? { id: memberId ?? conversation.id, name: conversation.title.replace(/-用户视角|-客服视角/, ''), initials: conversation.initials } : undefined
  })() : undefined
  const sendText = () => {
    if (!draft.trim()) return
    logic.sendChatMessage('text', draft.trim(), undefined, replyTarget ? replySnapshot(replyTarget) : undefined)
    setDraft('')
    setReplyTarget(null)
    setEmojiOpen(false)
  }
  const sendQuickReply = (text: string) => {
    logic.sendChatMessage('text', text, undefined, replyTarget ? replySnapshot(replyTarget) : undefined)
    setReplyTarget(null)
    setQuickRepliesOpen(false)
  }
  const handleEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendText() }
  }
  const createGroup = () => {
    if (!groupName.trim() || groupMembers.length < 2) return
    logic.createGroup(groupName, groupMembers)
    setGroupName('')
    setGroupMembers([])
    setGroupDialog(false)
  }
  const toggleGroupMember = (id: string) => setGroupMembers((members) => members.includes(id) ? members.filter((item) => item !== id) : [...members, id])
  const showFriendProfile = (friendId: string) => { setGroupSettingsOpen(false); logic.setSelectedProfileId(friendId) }
  const openGroupSettings = () => { logic.setSelectedProfileId(null); setGroupSettingsOpen(true) }
  const availableGroupFriends = conversation?.kind === 'group' ? socialFriends.filter((friend) => !conversation.members.includes(friend.id)) : []
  const submitGroupInvite = () => {
    if (!conversation || conversation.kind !== 'group') return
    logic.inviteFriendsToGroup(conversation.id, groupInvitees)
    setGroupInviteOpen(false)
    setGroupInvitees([])
  }
  const confirmGroupManagementAction = () => {
    if (!conversation || conversation.kind !== 'group' || !groupManagementAction) return
    if (groupManagementAction.type === 'admin') logic.setGroupAdmin(conversation.id, groupManagementAction.memberId, groupManagementAction.makeAdmin)
    if (groupManagementAction.type === 'remove') logic.removeGroupMember(conversation.id, groupManagementAction.memberId)
    if (groupManagementAction.type === 'admin-batch') groupManagementAction.members.forEach((member) => logic.setGroupAdmin(conversation.id, member.id, groupManagementAction.makeAdmin))
    if (groupManagementAction.type === 'remove-batch') groupManagementAction.members.forEach((member) => logic.removeGroupMember(conversation.id, member.id))
    if (groupManagementAction.type === 'leave') {
      logic.leaveGroup(conversation.id)
      setGroupSettingsOpen(false)
    }
    if (groupManagementAction.type === 'dissolve') {
      logic.dissolveGroup(conversation.id)
      setGroupSettingsOpen(false)
    }
    const names = groupManagementAction.type === 'admin-batch' || groupManagementAction.type === 'remove-batch' ? groupManagementAction.members.map((member) => member.name).join('、') : ''
    setGlobalNotice(groupManagementAction.type === 'dissolve' ? `已解散群聊「${conversation.title}」。` : groupManagementAction.type === 'leave' ? `已退出群聊「${conversation.title}」。` : groupManagementAction.type === 'admin' ? groupManagementAction.makeAdmin ? `已将「${groupManagementAction.memberName}」设为管理员。` : `已撤销「${groupManagementAction.memberName}」的管理员身份。` : groupManagementAction.type === 'remove' ? `已将「${groupManagementAction.memberName}」移出群聊。` : groupManagementAction.type === 'admin-batch' ? `${groupManagementAction.makeAdmin ? '已设置' : '已撤销'}「${names}」的管理员身份。` : `已将「${names}」移出群聊。`)
    setFeedback('')
    setGroupManagementAction(null)
  }
  const isRemoveAction = groupManagementAction?.type === 'remove' || groupManagementAction?.type === 'remove-batch'
  const isRevokingGroupAdmin = (groupManagementAction?.type === 'admin' || groupManagementAction?.type === 'admin-batch') && !groupManagementAction.makeAdmin
  const actionNames = groupManagementAction?.type === 'admin-batch' || groupManagementAction?.type === 'remove-batch' ? groupManagementAction.members.map((member) => member.name).join('、') : groupManagementAction?.type === 'admin' || groupManagementAction?.type === 'remove' ? groupManagementAction.memberName : ''
  const groupManagementTitle = groupManagementAction?.type === 'dissolve' ? '确认解散群聊' : groupManagementAction?.type === 'leave' ? '确认退出群聊' : isRemoveAction ? '确认移除成员' : isRevokingGroupAdmin ? '确认撤销管理员' : '确认设置管理员'
  const groupManagementDescription = groupManagementAction?.type === 'dissolve' ? `解散后，「${conversation?.title}」将从会话列表移除，群成员也无法继续在此群聊。` : groupManagementAction?.type === 'leave' ? `退出后，「${conversation?.title}」将从会话列表移除，你将不再收到群消息。` : isRemoveAction ? `确定将「${actionNames}」移出群聊吗？` : isRevokingGroupAdmin ? `确定撤销「${actionNames}」的管理员身份吗？` : `确定将「${actionNames}」设为管理员吗？`
  const groupManagementConfirmLabel = groupManagementAction?.type === 'dissolve' ? '确认解散' : groupManagementAction?.type === 'leave' ? '确认退出' : isRemoveAction ? '确认移除' : isRevokingGroupAdmin ? '确认撤销' : '确认设置'
  const openConversationMenu = (event: ReactMouseEvent<HTMLButtonElement>, item: NonNullable<SocialLogic['selectedConversation']>) => {
    event.preventDefault()
    setContextMessage(null)
    setContextPoint(getMessageMenuPoint(event, 196, 160))
    setContextConversation(item)
  }
  const requestConversationAction = (type: ConversationAction['type']) => {
    if (!contextConversation) return
    setConversationAction({ type, conversation: contextConversation })
    setContextConversation(null)
  }
  const handleConversationMenuAction = (type: ConversationActionType) => {
    if (!contextConversation) return
    if (type === 'pin') {
      logic.setConversationPinned(contextConversation.id, !contextConversation.pinned)
      setGlobalNotice(contextConversation.pinned ? '已取消置顶' : '会话已置顶')
      setContextConversation(null)
      return
    }
    if (type === 'read') {
      logic.markConversationRead(contextConversation.id)
      setGlobalNotice('消息已标为已读')
      setContextConversation(null)
      return
    }
    requestConversationAction(type)
  }
  const confirmConversationAction = () => {
    if (!conversationAction) return
    const { type, conversation: target } = conversationAction
    if (type === 'clear') logic.clearConversationMessages(target.id)
    if (type === 'delete') logic.deleteConversation(target.id)
    setGlobalNotice(type === 'clear' ? '聊天记录已清空' : '聊天已删除')
    setFeedback('')
    setConversationAction(null)
  }
  const conversationActionTitle = conversationAction ? ({ clear: '清空消息', delete: '删除聊天' } as const)[conversationAction.type] : ''
  const conversationActionDescription = conversationAction ? ({
    clear: `清空后，「${conversationAction.conversation.title}」的聊天记录将被删除，且无法恢复。`,
    delete: `删除后，「${conversationAction.conversation.title}」及其聊天记录将从会话列表移除，且无法恢复。`,
  } as const)[conversationAction.type] : ''
  const conversationActionConfirmLabel = conversationAction ? ({ clear: '确认清空', delete: '确认删除' } as const)[conversationAction.type] : ''

  return <div className="social-page messages-page">
    {globalNotice && <div className="social-toast social-toast--global" role="status" aria-live="polite">{globalNotice}<button type="button" className="windows-icon-button" onClick={() => setGlobalNotice('')} aria-label="关闭全局通知"><X size={15} /></button></div>}
    <div className={`messages-layout${!logic.activeFixedFeed && (logic.selectedProfile || (groupSettingsOpen && conversation?.kind === 'group')) ? ' messages-layout--profile-open' : ''}`}>
      <aside className="messages-list-panel" aria-label="会话和好友">
        <div className="social-segmented" role="tablist" aria-label="消息内容">
          <button type="button" role="tab" aria-selected={logic.activeMessagesTab === 'messages'} className={logic.activeMessagesTab === 'messages' ? 'is-active' : ''} onClick={() => { logic.setActiveMessagesTab('messages'); logic.setSelectedFriendId(null) }}>会话{logic.totalUnread > 0 && <span className="social-unread-count">{logic.totalUnread}</span>}</button>
          <button type="button" role="tab" aria-selected={logic.activeMessagesTab === 'friends'} className={logic.activeMessagesTab === 'friends' ? 'is-active' : ''} onClick={() => { logic.setActiveFixedFeed(null); logic.setActiveMessagesTab('friends'); setGroupSettingsOpen(false) }}>好友</button>
        </div>
        <label className="social-search"><Search size={16} /><input value={logic.chatSearch} onChange={(event) => logic.setChatSearch(event.target.value)} placeholder={logic.activeMessagesTab === 'friends' ? '搜索好友' : '搜索会话'} aria-label={logic.activeMessagesTab === 'friends' ? '搜索好友' : '搜索会话'} /></label>
        {logic.activeMessagesTab === 'messages' ? <>
          <div className="conversation-filter" aria-label="会话类型">
            {(['all', 'direct', 'group'] as const).map((filter) => <button type="button" key={filter} className={kindFilter === filter ? 'is-active' : ''} onClick={() => setKindFilter(filter)}>{filter === 'all' ? '全部' : filter === 'direct' ? '私聊' : '群聊'}</button>)}
          </div>
          {kindFilter === 'group' && <button type="button" className="conversation-create-group" onClick={() => { setGroupDialog(true); setFeedback('') }}><Users size={15} />创建群聊</button>}
          <div className="conversation-list">
            {fixedMessageFeeds.filter((item) => !logic.chatSearch.trim() || item.title.includes(logic.chatSearch.trim())).map((item) => {
              const Icon = item.id === 'system' ? Bell : Users
              return <button type="button" key={item.id} className={`conversation-row${logic.activeFixedFeed === item.id ? ' is-active' : ''}`} onClick={() => { logic.setActiveFixedFeed(item.id); logic.setSelectedProfileId(null); setGroupSettingsOpen(false) }}><span className="fixed-notification-icon"><Icon size={22} /></span><span className="conversation-row__copy"><span className="conversation-row__title"><strong>{item.title}</strong></span><small>{item.summary}</small></span></button>
            })}

            {filteredConversations.map((item) => {
              const last = item.messages[item.messages.length - 1]
              return <button type="button" className={`conversation-row${!logic.activeFixedFeed && conversation?.id === item.id ? ' is-active' : ''}`} key={item.id} onClick={() => { logic.openConversation(item); logic.setSelectedProfileId(null); if (item.kind !== 'group') setGroupSettingsOpen(false) }} onContextMenu={(event) => openConversationMenu(event, item)}>
                <AvatarMark initials={item.initials} imageUrl={item.avatarDataUrl} size="md" />
                <span className="conversation-row__copy"><span className="conversation-row__title"><strong>{item.kind === 'direct' ? <UserNameWithLevel name={item.title} identityId={socialFriends.find((friend) => friend.id === item.members[0])?.profileId ?? companions.find((companion) => companion.id === item.members[0])?.id ?? item.members[0] ?? item.id} /> : item.title}</strong>{item.kind === 'group' && <span className="conversation-group-tag">群</span>}{item.pinned && <Pin size={12} aria-label="已置顶" />}</span><small>{last ? messagePreview(last) : '开始一段新对话'}</small></span>
                <span className="conversation-row__meta"><small>{last?.time}</small>{item.unread > 0 && <span className="social-unread-count">{item.unread}</span>}</span>
              </button>
            })}
            {filteredConversations.length === 0 && !fixedMessageFeeds.some((item) => !logic.chatSearch.trim() || item.title.includes(logic.chatSearch.trim())) && <div className="social-empty-inline">没有匹配的会话</div>}
          </div>
        </> : <div className="social-friend-list">
          <div className="social-list-caption">好友 · {logic.visibleFriends.length}</div>
          {logic.visibleFriends.map((friend) => <div className={`social-friend-row${logic.selectedFriendId === friend.id ? ' is-active' : ''}`} key={friend.id}>
            <button type="button" className="social-friend-identity" onClick={() => { logic.startDirectMessage(friend.id); logic.setSelectedProfileId(friend.id); setGroupSettingsOpen(false) }} aria-label={`打开与${friend.name}的聊天和资料`}><span className="social-avatar-wrap"><AvatarMark initials={friend.initials} size="md" /><i className={friend.online ? 'is-online' : ''} /></span><span><strong><UserNameWithLevel name={friend.name} identityId={friend.profileId} /></strong><small>{friend.status}</small></span></button>
            <button type="button" className="windows-icon-button" aria-label={`查看${friend.name}资料`} onClick={() => showFriendProfile(friend.id)}><MoreHorizontal size={18} /></button>
          </div>)}
        </div>}
      </aside>

      {logic.activeMessagesTab === 'friends' ? logic.selectedFriend ? <FriendPreview
        friend={logic.selectedFriend}
        onMessage={() => logic.startDirectMessage(logic.selectedFriend!.id)}
        onOpenProfile={() => showFriendProfile(logic.selectedFriend!.id)}
      /> : <section className="chat-empty-state"><Users size={28} /><h2>选择一位好友</h2></section> : logic.activeFixedFeed ? <FixedMessageFeedPanel feed={logic.activeFixedFeed} requests={logic.groupJoinRequests} onResolve={logic.resolveGroupJoinRequest} /> : conversation ? <section className="chat-panel" aria-label={`${conversation.title}聊天`}>
        <header className="chat-panel__header">
          <div className="chat-panel__identity">
            <button type="button" className="chat-avatar-trigger" aria-expanded={conversation.kind === 'group' ? groupSettingsOpen : Boolean(logic.selectedProfile)} onClick={() => conversation.kind === 'direct' ? showFriendProfile(conversation.members[0]) : openGroupSettings()} aria-label={conversation.kind === 'group' ? `打开${conversation.title}群设置` : `查看${conversation.title}资料`}><AvatarMark initials={conversation.initials} imageUrl={conversation.avatarDataUrl} size="md" /></button>
            <div>{conversation.kind === 'direct' ? <>
              <div className="chat-panel__titleline"><h2><UserNameWithLevel name={conversation.title} identityId={directFriend?.profileId ?? directCompanion?.id ?? directMemberId ?? conversation.id} /></h2>{directCompanion && <span className="chat-companion-status" aria-label="接单状态">{directCompanion.status}</span>}</div>
              {directUserTags.length > 0 && <div className="chat-user-tags" aria-label="用户标签">{directUserTags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>}
            </> : <><h2>{conversation.title}</h2><small>{conversation.members.length + 1} 位成员</small></>}</div>
          </div>
        </header>
        <div className="chat-message-list" aria-live="polite">
          {conversation.messages.map((message) => <ChatMessage key={message.id} selfId={conversation.self?.id} onReviewChange={(rating, submitted) => logic.updateSupportReview(message.id, rating, submitted)} message={message} playing={playingMessage === message.id} onTogglePlay={() => setPlayingMessage(playingMessage === message.id ? null : message.id)} onAvatarClick={() => message.senderId !== currentSocialUser.id && showFriendProfile(message.senderId)} onContextMenu={(event) => openMessageMenu(event, message, setContextMessage, setContextPoint)} />)}
        </div>
        <div className="chat-composer">
          {conversation.supportAction && <div className="chat-support-actions"><button type="button" className="client-button client-button--secondary client-button--small" onClick={() => { if (conversation.supportAction === 'order') { setSelectedSendOrderId(''); setOrderDialogConversationId(conversation.id) } else logic.sendSupportCard() }}>{conversation.supportAction === 'order' ? <ReceiptText size={15} /> : <Star size={15} />}{conversation.supportAction === 'order' ? '发送订单' : '评价'}</button></div>}
          {replyTarget && <ReplyPreview message={replyTarget} onCancel={() => setReplyTarget(null)} />}
          {quickRepliesOpen && <QuickReplyMenu className="chat-quick-replies" onSelect={sendQuickReply} />}
          {voiceRecordingOpen && <VoiceRecordingPanel onCancel={() => setVoiceRecordingOpen(false)} onSendVoice={(duration) => { logic.sendChatMessage('voice', '语音消息', duration, replyTarget ? replySnapshot(replyTarget) : undefined); setReplyTarget(null); setVoiceRecordingOpen(false) }} onTranscribe={() => { setDraft((value) => `${value}${value ? '\n' : ''}这是一段语音转文字示例。`); setVoiceRecordingOpen(false) }} />}
          {emojiOpen && <div className="emoji-picker" role="group" aria-label="选择表情">{['😀', '😊', '😂', '👍', '🎮', '🎉', '❤️', '🙌'].map((emoji) => <button type="button" key={emoji} onClick={() => logic.sendChatMessage('emoji', emoji)} aria-label={`发送${emoji}`}>{emoji}</button>)}</div>}
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleEnter} placeholder={`发送消息给 ${conversation.title}…`} aria-label="消息内容" />
          <div className="chat-composer__toolbar">
            <div className="chat-composer__tools">
              <button type="button" className="windows-icon-button" aria-label="表情" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((value) => !value)}><Smile size={18} /></button>
              <button type="button" className="windows-icon-button" aria-label="发送示例图片" onClick={() => logic.sendChatMessage('image', '战绩截图 · 示例图片')}><ImagePlus size={18} /></button>
              <button type="button" className="windows-icon-button" aria-label="录制语音" title="录制语音" aria-expanded={voiceRecordingOpen} onClick={() => { setEmojiOpen(false); setQuickRepliesOpen(false); setVoiceRecordingOpen(true) }}><Mic size={18} /></button>
          <button type="button" className="windows-icon-button" aria-label="送礼" title="送礼" onClick={(event) => conversation?.kind === 'group' ? onOpenGift(groupMemberCandidates.map((friend) => ({ id: friend.id, name: friend.name, initials: friend.initials, profileId: friend.profileId })), undefined, event.currentTarget) : conversationGiftRecipient && onOpenGift([], conversationGiftRecipient, event.currentTarget)}><Gift size={17} /></button>
              <button type="button" className="windows-icon-button" aria-label="快捷回复" title="快捷回复" aria-expanded={quickRepliesOpen} onClick={() => { setEmojiOpen(false); setQuickRepliesOpen((open) => !open) }}><MessageSquareText size={17} /></button>
            </div>
            <button type="button" className="client-button client-button--primary chat-send-button" onClick={sendText} disabled={!draft.trim()}><Send size={15} />发送</button>
          </div>
          {feedback && <div className="social-inline-feedback" role="status">{feedback}<button type="button" onClick={() => setFeedback('')} aria-label="关闭提示"><X size={14} /></button></div>}
        </div>
      </section> : <section className="chat-empty-state"><MessageCircle size={28} /><h2>选择一个会话</h2></section>}

      {selectedProfile && <aside className="social-profile-panel" aria-label={`${selectedProfile.name}资料`}>
        <header><h2><UserNameWithLevel name={selectedProfile.name} identityId={selectedProfile.id} /></h2><button type="button" className="windows-icon-button" aria-label="关闭资料" onClick={() => logic.setSelectedProfileId(null)}><X size={17} /></button></header>
        {linkedCompanion && selectedProfileCard ? <CompanionDetailPage
          key={linkedCompanion.id}
          companion={linkedCompanion}
          pageState="normal"
          presentation="panel"
          onBack={() => logic.setSelectedProfileId(null)}
          onRetry={onRetry}
          onOrder={onOrder}
          profileOverride={selectedProfileCard}
          followed={logic.followedProfileIds.includes(linkedCompanion.id)}
          blocked={logic.blockedProfileIds.includes(linkedCompanion.id)}
          onShare={(friendIds) => logic.shareCompanionToFriends(linkedCompanion.id, friendIds)}
          onToggleFollow={() => logic.toggleProfileFollow(linkedCompanion.id)}
          onBlock={() => logic.blockProfile(linkedCompanion.id)}
          onChat={selectedProfile.id === currentSocialUser.id ? undefined : () => logic.startDirectMessage(selectedProfile.id)}
          onGift={(anchor) => onOpenGift([], { id: linkedCompanion.id, name: linkedCompanion.name, initials: linkedCompanion.initials, profileId: linkedCompanion.id.replace('companion-', 'P-') }, anchor)}
        /> : selectedProfileCard ? <CompanionProfileCard profile={selectedProfileCard} /> : null}
      </aside>}
      {!logic.selectedProfile && groupSettingsOpen && conversation?.kind === 'group' && <GroupSettingsPanel
        key={conversation.id}
        conversation={conversation}
        onClose={() => setGroupSettingsOpen(false)}
        onInvite={() => { setGroupInviteOpen(true); setFeedback('') }}
        onRename={(name) => logic.renameGroup(conversation.id, name)}
        onUpdateAvatar={(avatarDataUrl) => logic.updateGroupAvatar(conversation.id, avatarDataUrl)}
        onOpenProfile={showFriendProfile}
        onSetJoinApproval={(required) => logic.setGroupJoinApproval(conversation.id, required)}
        onSetMuted={(muted) => logic.setGroupMuted(conversation.id, muted)}
        onSetPinned={(pinned) => logic.setConversationPinned(conversation.id, pinned)}
        onOpenMemberDialog={setGroupMemberDialog}
        onLeave={() => setGroupManagementAction({ type: 'leave' })}
        onDissolve={() => setGroupManagementAction({ type: 'dissolve' })}
      />}
    </div>

    {groupDialog && <GroupCreateDialog
      name={groupName}
      members={groupMembers}
      onNameChange={setGroupName}
      onToggle={toggleGroupMember}
      onClose={() => setGroupDialog(false)}
      onSubmit={createGroup}
    />}
    {groupInviteOpen && <GroupInviteDialog
      friends={availableGroupFriends}
      selected={groupInvitees}
      onToggle={(id) => setGroupInvitees((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])}
      onClose={() => setGroupInviteOpen(false)}
      onSubmit={submitGroupInvite}
    />}
    {groupMemberDialog === 'admin' && conversation?.kind === 'group' && <GroupMemberAdminDialog friends={groupMemberCandidates} adminIds={conversation.adminIds ?? []} onClose={() => setGroupMemberDialog(null)} onSubmit={(action) => { setGroupMemberDialog(null); setGroupManagementAction(action) }} />}
    {groupMemberDialog === 'remove' && conversation?.kind === 'group' && <GroupMemberRemoveDialog friends={groupMemberCandidates} onClose={() => setGroupMemberDialog(null)} onSubmit={(action) => { setGroupMemberDialog(null); setGroupManagementAction(action) }} />}
    {groupManagementAction && <DialogPanel overlayId="group-management-confirm" children={null} title={groupManagementTitle} description={groupManagementDescription} onClose={() => setGroupManagementAction(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setGroupManagementAction(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={confirmGroupManagementAction}>{groupManagementConfirmLabel}</button></>} />}
    {contextConversation && <ConversationContextMenu conversation={contextConversation} point={contextPoint} onClose={() => setContextConversation(null)} onAction={handleConversationMenuAction} />}
    {conversationAction && <DialogPanel overlayId="conversation-action-confirm" children={null} title={conversationActionTitle} description={conversationActionDescription} onClose={() => setConversationAction(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setConversationAction(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={confirmConversationAction}>{conversationActionConfirmLabel}</button></>} />}
    {contextMessage && <MessageContextMenu point={contextPoint} canRecall={contextMessage.senderId === (conversation?.self?.id ?? currentSocialUser.id)} canReport={contextMessage.senderId !== (conversation?.self?.id ?? currentSocialUser.id)} onClose={() => setContextMessage(null)} onReply={() => { setReplyTarget(contextMessage); setContextMessage(null) }} onCopy={() => copyMessage(contextMessage, setFeedback, () => setContextMessage(null))} onRecall={() => { if (conversation && logic.recallChatMessage(conversation.id, contextMessage.id)) setFeedback('消息已撤回'); setContextMessage(null) }} onReport={() => { setReportTarget(contextMessage); setContextMessage(null) }} />}
    {orderDialogConversationId === conversation?.id && <DialogPanel overlayId="send-chat-order" title="选择订单" width={460} className="chat-order-dialog" onClose={() => setOrderDialogConversationId(null)} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setOrderDialogConversationId(null)}>取消</button><button type="button" className="client-button client-button--primary" disabled={!orders.some((order) => order.id === selectedSendOrderId)} onClick={() => { const order = orders.find((item) => item.id === selectedSendOrderId); if (order) { logic.sendSupportCard(order); setOrderDialogConversationId(null) } }}>发送订单</button></>}>
      <div className="chat-order-options" role="radiogroup" aria-label="选择要发送的订单">{orders.length ? orders.map((order) => <label className={`chat-order-option${selectedSendOrderId === order.id ? ' is-selected' : ''}`} key={order.id}><input type="radio" name="chat-order" value={order.id} checked={selectedSendOrderId === order.id} onChange={() => setSelectedSendOrderId(order.id)} /><span><strong>{order.gameName} · {order.serviceName}</strong><span><UserNameWithLevel name={order.companionName} identityId={order.companionId} /> · {order.duration} {order.durationUnit} · {order.amount} 钻石</span><small>{order.id}</small></span><span>{order.status}</span></label>) : <p>暂无订单</p>}</div>
    </DialogPanel>}

    {reportTarget && <UserReportDialog overlayId="report-chat-message" onClose={() => setReportTarget(null)} onSubmit={() => { setFeedback('举报已提交（仅演示）'); setReportTarget(null) }} />}
  </div>
}

function FriendPreview({ friend, onMessage, onOpenProfile }: { friend: (typeof socialFriends)[number]; onMessage: () => void; onOpenProfile: () => void }) {
  return <section className="friend-preview"><button type="button" className="friend-preview__avatar" onClick={onOpenProfile} aria-label={`查看${friend.name}资料`}><AvatarMark initials={friend.initials} size="lg" /></button><h2><UserNameWithLevel name={friend.name} identityId={friend.profileId} /></h2><span>{friend.status}</span><div className="friend-preview__actions"><button type="button" className="client-button client-button--primary" onClick={onMessage}><MessageCircle size={15} />发起私聊</button><button type="button" className="client-button client-button--secondary" onClick={onOpenProfile}>查看资料</button></div></section>
}

function GroupSettingsPanel({ conversation, onClose, onInvite, onRename, onUpdateAvatar, onOpenProfile, onSetJoinApproval, onSetMuted, onSetPinned, onOpenMemberDialog, onLeave, onDissolve }: {
  conversation: NonNullable<SocialLogic['selectedConversation']>
  onClose: () => void
  onInvite: () => void
  onRename: (name: string) => void
  onUpdateAvatar: (avatarDataUrl: string) => void
  onOpenProfile: (id: string) => void
  onSetJoinApproval: (required: boolean) => void
  onSetMuted: (muted: boolean) => void
  onSetPinned: (pinned: boolean) => void
  onOpenMemberDialog: (mode: 'admin' | 'remove') => void
  onLeave: () => void
  onDissolve: () => void
}) {
  const [name, setName] = useState(conversation.title)
  const [isEditingName, setIsEditingName] = useState(false)
  const isOwner = conversation.ownerId === currentSocialUser.id
  const members = conversation.members.map((id) => socialFriends.find((friend) => friend.id === id)).filter((friend): friend is (typeof socialFriends)[number] => Boolean(friend))

  return <aside className="group-settings-panel" aria-label="群聊设置">
    <header><div><h2>群聊设置</h2><small>{conversation.members.length + 1} 位成员</small></div><button type="button" className="windows-icon-button" aria-label="关闭群聊设置" onClick={onClose}><X size={17} /></button></header>
    <section className="group-settings-identity">
      <AvatarMark initials={conversation.initials} imageUrl={conversation.avatarDataUrl} size="lg" />
      {isEditingName ? <form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; onRename(name); setIsEditingName(false) }}>
        <input value={name} onChange={(event) => setName(event.target.value)} aria-label="群名称" maxLength={24} />
        <button type="submit" className="client-button client-button--primary client-button--small" disabled={!name.trim()}>保存</button>
        <button type="button" className="client-button client-button--secondary client-button--small" onClick={() => { setName(conversation.title); setIsEditingName(false) }}>取消</button>
      </form> : <div><h3>{conversation.title}</h3><small className="group-settings-id">群聊ID：{conversation.id}</small>{isOwner && <div className="group-settings-identity-actions"><button type="button" className="group-settings-edit-name" onClick={() => setIsEditingName(true)}><Pencil size={13} />修改群名称</button><label className="group-settings-edit-name group-settings-avatar-upload"><ImagePlus size={13} />更换群头像<input type="file" accept="image/*" aria-label="上传群头像图片" onChange={(event) => { const input = event.currentTarget; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') onUpdateAvatar(reader.result) }; reader.readAsDataURL(file); input.value = '' }} /></label></div>}</div>}
    </section>
    <section className="group-settings-members" aria-label="群成员列表">
      <div className="group-settings-section-heading"><strong>群聊成员</strong><div><span>{conversation.members.length + 1} 人</span></div></div>
      <div className="group-settings-member-grid">
        <GroupMemberTile initials={currentSocialUser.initials} name={`${currentSocialUser.name}（我）`} identityId={currentSocialUser.profileId} role={isOwner ? '群主' : conversation.adminIds?.includes(currentSocialUser.id) ? '管理员' : '成员'} onClick={() => onOpenProfile(currentSocialUser.id)} />
        {members.map((friend) => {
          const isAdmin = conversation.adminIds?.includes(friend.id) ?? false
          return <GroupMemberTile key={friend.id} initials={friend.initials} name={friend.name} identityId={friend.profileId} role={friend.id === conversation.ownerId ? '群主' : isAdmin ? '管理员' : '成员'} onClick={() => onOpenProfile(friend.id)} />
        })}
        <button type="button" className="group-settings-member-tile group-settings-member-add" onClick={onInvite}><span className="group-settings-member-avatar"><UserPlus size={19} /></span><strong>添加</strong></button>
        {isOwner && <button type="button" className="group-settings-member-tile group-settings-member-action" onClick={() => onOpenMemberDialog('remove')}><span className="group-settings-member-avatar"><X size={19} /></span><strong>移除</strong></button>}
        {isOwner && <button type="button" className="group-settings-member-tile group-settings-member-action" onClick={() => onOpenMemberDialog('admin')}><span className="group-settings-member-avatar"><Users size={19} /></span><strong>管理</strong></button>}
      </div>
    </section>
    {isOwner && <section className="group-settings-options" aria-label="群聊选项">
      <div><strong>加入群聊验证</strong><small>{conversation.joinApprovalRequired ? '新成员申请加入后，需要群主确认' : '好友可直接加入群聊'}</small></div>
      <div className="group-settings-switch"><span>{conversation.joinApprovalRequired ? '已开启' : '已关闭'}</span><button type="button" role="switch" aria-checked={conversation.joinApprovalRequired ?? false} aria-label="加入群聊需要验证" disabled={!isOwner} className={`group-settings-toggle${conversation.joinApprovalRequired ? ' is-on' : ''}`} onClick={() => onSetJoinApproval(!(conversation.joinApprovalRequired ?? false))}><span /></button></div>
    </section>}
    <section className="group-settings-options" aria-label="消息免打扰">
      <div><strong>消息免打扰</strong></div>
      <div className="group-settings-switch"><span>{conversation.muted ? '已开启' : '已关闭'}</span><button type="button" role="switch" aria-checked={conversation.muted ?? false} aria-label="群聊消息免打扰" className={`group-settings-toggle${conversation.muted ? ' is-on' : ''}`} onClick={() => onSetMuted(!conversation.muted)}><span /></button></div>
    </section>
    <section className="group-settings-options" aria-label="置顶群聊">
      <div><strong>置顶群聊</strong></div>
      <div className="group-settings-switch"><span>{conversation.pinned ? '已置顶' : '未置顶'}</span><button type="button" role="switch" aria-checked={conversation.pinned ?? false} aria-label="置顶群聊" className={`group-settings-toggle${conversation.pinned ? ' is-on' : ''}`} onClick={() => onSetPinned(!conversation.pinned)}><span /></button></div>
    </section>
    {isOwner ? <section className="group-settings-danger-zone"><div><strong>解散群聊</strong><small>群聊将从会话列表中移除。</small></div><button type="button" className="client-button client-button--secondary client-button--small" onClick={onDissolve}>解散群聊</button></section> : <section className="group-settings-danger-zone"><div><strong>退出群聊</strong><small>退出后将从会话列表移除。</small></div><button type="button" className="client-button client-button--secondary client-button--small" onClick={onLeave}>退出群聊</button></section>}
  </aside>
}

function GroupMemberTile({ initials, name, identityId, role, onClick }: { initials: string; name: string; identityId: string; role: string; onClick: () => void }) {
  return <div className="group-settings-member-tile"><button type="button" className="group-settings-member-profile" onClick={onClick} aria-label={`查看${name}资料`}><span className="group-settings-member-avatar"><AvatarMark initials={initials} size="sm" /></span><strong title={name}><UserNameWithLevel name={name} identityId={identityId} /></strong><small>{role}</small></button></div>
}

function GroupCreateDialog({ name, members, onNameChange, onToggle, onClose, onSubmit }: { name: string; members: string[]; onNameChange: (value: string) => void; onToggle: (id: string) => void; onClose: () => void; onSubmit: () => void }) {
  return <DialogPanel overlayId="create-group" title="创建群聊" onClose={onClose} width={520} footer={<><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" onClick={onSubmit} disabled={!name.trim() || members.length < 2}>创建群聊</button></>}>
    <label className="social-form-field">群名称<input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="例如：周末开黑小队" maxLength={24} /></label>
    <div className="social-dialog-section-title">选择好友 <span>已选 {members.length}/至少 2 位</span></div>
    <div className="social-select-friends">{socialFriends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={members.includes(friend.id)} onChange={() => onToggle(friend.id)} /><AvatarMark initials={friend.initials} size="sm" /><span><strong><UserNameWithLevel name={friend.name} identityId={friend.profileId} /></strong><small>{friend.status}</small></span></label>)}</div>
  </DialogPanel>
}

function GroupInviteDialog({ friends, selected, onToggle, onClose, onSubmit }: { friends: typeof socialFriends; selected: string[]; onToggle: (id: string) => void; onClose: () => void; onSubmit: () => void }) {
  return <DialogPanel overlayId="invite-group-members" title="邀请好友入群" onClose={onClose} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" onClick={onSubmit} disabled={!selected.length}>邀请（{selected.length}）</button></>}>
    {friends.length ? <div className="social-select-friends">{friends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={selected.includes(friend.id)} onChange={() => onToggle(friend.id)} /><AvatarMark initials={friend.initials} size="sm" /><span><strong><UserNameWithLevel name={friend.name} identityId={friend.profileId} /></strong><small>{friend.status}</small></span></label>)}</div> : <p className="social-dialog-copy">所有好友都已在群聊中。</p>}
  </DialogPanel>
}

function GroupMemberAdminDialog({ friends, adminIds, onClose, onSubmit }: { friends: typeof socialFriends; adminIds: string[]; onClose: () => void; onSubmit: (action: Extract<GroupManagementAction, { type: 'admin-batch' }>) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const selectedMembers = friends.filter((friend) => selected.includes(friend.id))
  const regularMembers = selectedMembers.filter((friend) => !adminIds.includes(friend.id))
  const admins = selectedMembers.filter((friend) => adminIds.includes(friend.id))
  const toActionMembers = (items: typeof friends) => items.map(({ id, name }) => ({ id, name }))
  return <DialogPanel overlayId="group-member-admin-select" title="设置群管理员" onClose={onClose} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--secondary" disabled={!admins.length} onClick={() => onSubmit({ type: 'admin-batch', members: toActionMembers(admins), makeAdmin: false })}>取消管理员（{admins.length}）</button><button type="button" className="client-button client-button--primary" disabled={!regularMembers.length} onClick={() => onSubmit({ type: 'admin-batch', members: toActionMembers(regularMembers), makeAdmin: true })}>设为管理员（{regularMembers.length}）</button></>}>
    <div className="social-dialog-section-title">群成员 <span>已选 {selected.length} 位</span></div>
    <div className="social-select-friends">{friends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={selected.includes(friend.id)} onChange={() => setSelected((items) => items.includes(friend.id) ? items.filter((id) => id !== friend.id) : [...items, friend.id])} /><AvatarMark initials={friend.initials} size="sm" /><span><strong><UserNameWithLevel name={friend.name} identityId={friend.profileId} /></strong><small>{adminIds.includes(friend.id) ? '管理员' : friend.status}</small></span></label>)}</div>
  </DialogPanel>
}

function GroupMemberRemoveDialog({ friends, onClose, onSubmit }: { friends: typeof socialFriends; onClose: () => void; onSubmit: (action: Extract<GroupManagementAction, { type: 'remove-batch' }>) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const selectedMembers = friends.filter((friend) => selected.includes(friend.id))
  return <DialogPanel overlayId="group-member-remove-select" title="移除群成员" onClose={onClose} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" disabled={!selectedMembers.length} onClick={() => onSubmit({ type: 'remove-batch', members: selectedMembers.map(({ id, name }) => ({ id, name })) })}>移除（{selected.length}）</button></>}>
    <div className="social-dialog-section-title">群成员 <span>已选 {selected.length} 位</span></div>
    <div className="social-select-friends">{friends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={selected.includes(friend.id)} onChange={() => setSelected((items) => items.includes(friend.id) ? items.filter((id) => id !== friend.id) : [...items, friend.id])} /><AvatarMark initials={friend.initials} size="sm" /><span><strong><UserNameWithLevel name={friend.name} identityId={friend.profileId} /></strong><small>{friend.status}</small></span></label>)}</div>
  </DialogPanel>
}

export function VoiceRoomsPage({ logic, pageState, onRetry, onOrder, onMinimizeVoice, onExitVoice, onOpenClubSupport, onOpenGift, onChatWithCompanion, ownerSource = 'personal' }: PageStateProps & { logic: SocialLogic; onOrder: (serviceId: string, companionId: string) => void; onMinimizeVoice: () => void; onExitVoice: () => void; onOpenClubSupport: () => void; onOpenGift: (recipients: GiftRecipient[], fixedRecipient?: GiftRecipient, anchor?: HTMLButtonElement) => void; onChatWithCompanion: (companionId: string) => void; ownerSource?: 'personal' | 'club' }) {
  const voicePageRef = useRef<HTMLDivElement>(null)
  const channelMenuRef = useRef<HTMLDivElement>(null)
  const roomMenuRef = useRef<HTMLDivElement>(null)
  const memberMenuRef = useRef<HTMLDivElement>(null)
  const voiceModeMenuRef = useRef<HTMLDivElement>(null)
  const voiceAudioControlsRef = useRef<HTMLDivElement>(null)
  const [treeSelection, setTreeSelection] = useState(() => ({ roomId: logic.activeVoiceRoomId, channelId: logic.activeSubchannelId, activeRoomId: logic.activeVoiceRoomId, activeChannelId: logic.activeSubchannelId }))
  const [roomDialog, setRoomDialog] = useState<'create' | 'edit' | null>(null)
  const [roomDialogTargetId, setRoomDialogTargetId] = useState<string | undefined>()
  const [roomName, setRoomName] = useState('')
  const [roomCapacity, setRoomCapacity] = useState(DEFAULT_VOICE_GROUP_CAPACITY)
  const [channelDialog, setChannelDialog] = useState<{ mode: 'create' | 'edit'; id?: string; roomId?: string } | null>(null)
  const [channelName, setChannelName] = useState('')
  const [channelCapacity, setChannelCapacity] = useState(MAX_VOICE_CHANNEL_MEMBERS)
  const [channelMessageFrequency, setChannelMessageFrequency] = useState('')
  const [channelMicQueueDuration, setChannelMicQueueDuration] = useState('60')
  const [channelPrivacy, setChannelPrivacy] = useState<VoiceSubchannel['privacy']>('公开')
  const [channelPassword, setChannelPassword] = useState('')
  const [privateRoomPasswordTarget, setPrivateRoomPasswordTarget] = useState<{ roomId: string; channelId: string } | null>(null)
  const [privateRoomPasswordInput, setPrivateRoomPasswordInput] = useState('')
  const [privateRoomPasswordError, setPrivateRoomPasswordError] = useState('')
  const [channelImageDataUrl, setChannelImageDataUrl] = useState('')
  const [inviteDialog, setInviteDialog] = useState(false)
  const [inviteTargetChannel, setInviteTargetChannel] = useState<{ roomName: string; channelName: string } | null>(null)
  const [invitees, setInvitees] = useState<string[]>([])
  const [deleteChannelId, setDeleteChannelId] = useState<string | null>(null)
  const [memberAction, setMemberAction] = useState<{ type: VoiceMemberAction; member: VoiceMember } | null>(null)
  const [memberContextMenu, setMemberContextMenu] = useState<{ member: VoiceMember; x: number; y: number } | null>(null)
  const [singleMoveDialog, setSingleMoveDialog] = useState<{ member: VoiceMember; roomId: string; channelId: string } | null>(null)
  const [singleMoveTargetRoomId, setSingleMoveTargetRoomId] = useState('')
  const [singleMoveTargetChannelId, setSingleMoveTargetChannelId] = useState('')
  const [voiceProfileId, setVoiceProfileId] = useState<string | null>(null)
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false)
  const [roomChatCollapsed, setRoomChatCollapsed] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [roomSearch, setRoomSearch] = useState('')
  const [voiceModes, setVoiceModes] = useState<Record<string, VoiceMode>>({})
  const [micQueueCountdown, setMicQueueCountdown] = useState<{ memberId: string; seconds: number } | null>(null)
  const [voiceModeOpen, setVoiceModeOpen] = useState(false)
  const [pendingMicRequest, setPendingMicRequest] = useState<{ channelId: string; member: VoiceMember } | null>(null)
  const [feedback, setFeedback] = useState('')
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [collapsedRoomIds, setCollapsedRoomIds] = useState<string[]>([])
  const [collapsedChannelIds, setCollapsedChannelIds] = useState<string[]>([])
  const [channelContextMenu, setChannelContextMenu] = useState<{ roomId: string; channelId: string; x: number; y: number } | null>(null)
  const [roomContextMenu, setRoomContextMenu] = useState<{ roomId: string; x: number; y: number } | null>(null)
  const [deleteVoiceRoomId, setDeleteVoiceRoomId] = useState<string | null>(null)
  const [deleteVoiceRoomWithChannels, setDeleteVoiceRoomWithChannels] = useState(false)
  const [draggedVoiceChannel, setDraggedVoiceChannel] = useState<{ roomId: string; channelId: string } | null>(null)
  const [draggedVoiceGroupId, setDraggedVoiceGroupId] = useState<string | null>(null)
  const [batchMoveDialog, setBatchMoveDialog] = useState<{ roomId: string; channelId: string } | null>(null)
  const [batchMoveMemberIds, setBatchMoveMemberIds] = useState<string[]>([])
  const [batchMoveTargetRoomId, setBatchMoveTargetRoomId] = useState('')
  const [batchMoveTargetChannelId, setBatchMoveTargetChannelId] = useState('')
  const [batchMoveMemberPage, setBatchMoveMemberPage] = useState(0)
  const [recording, setRecording] = useState(false)
  const [recordingPromptOpen, setRecordingPromptOpen] = useState(false)
  const recordingStartButton = useRef<HTMLButtonElement>(null)
  const recordingEntryButton = useRef<HTMLButtonElement>(null)
  const [skipRecordingPrompt, setSkipRecordingPrompt] = useState(false)
  const startRoomRecording = () => {
    if (!logic.isInVoice) return
    if (skipRecordingPrompt) window.sessionStorage.setItem('game-companion-room-recording-skip-prompt', 'true')
    setRecordingPromptOpen(false)
    setRecording(true)
    setFeedback('录音已开始（仅演示）。')
  }
  const requestRoomRecording = () => {
    if (recording) { setRecording(false); setFeedback('录音已停止（仅演示）。'); return }
    if (window.sessionStorage.getItem('game-companion-room-recording-skip-prompt') === 'true') { startRoomRecording(); return }
    setSkipRecordingPrompt(false)
    setRecordingPromptOpen(true)
  }
  useEffect(() => {
    if (!recordingPromptOpen) return
    const entryButton = recordingEntryButton.current
    recordingStartButton.current?.focus({ preventScroll: true })
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setRecordingPromptOpen(false) }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => { window.removeEventListener('keydown', closeOnEscape); entryButton?.focus({ preventScroll: true }) }
  }, [recordingPromptOpen])
  const [micInputVolume, setMicInputVolume] = useState(70)
  const [micMode, setMicMode] = useState('语音感应')
  const [outputVolume, setOutputVolume] = useState(78)
  const [volumePopover, setVolumePopover] = useState<'speaker' | null>(null)
  const [supportDialogOpen, setSupportDialogOpen] = useState(false)
  const [supportQueued, setSupportQueued] = useState(false)
  const [clubSupportSelectionOpen, setClubSupportSelectionOpen] = useState(false)
  const micSetterRef = useRef(logic.setVoiceMemberMic)
  useEffect(() => { micSetterRef.current = logic.setVoiceMemberMic }, [logic.setVoiceMemberMic])
  const timerChannel = logic.activeSubchannel
  const timerQueue = getMicQueueMembers(timerChannel)
  const timerMode = timerChannel ? voiceModes[timerChannel.id] ?? '自由模式' : '自由模式'
  const timerFirstMemberId = timerMode === '麦序模式' ? timerQueue[0]?.id : undefined
  const timerDuration = timerChannel?.micQueueDurationSeconds
  useEffect(() => {
    if (!timerChannel?.id || !timerFirstMemberId) return
    const duration = Math.max(1, timerDuration || 60)
    const deadline = Date.now() + duration * 1000
    const intervalId = window.setInterval(() => {
      const secondsRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setMicQueueCountdown({ memberId: timerFirstMemberId, seconds: secondsRemaining })
      if (secondsRemaining === 0) {
        window.clearInterval(intervalId)
        micSetterRef.current(timerFirstMemberId, false)
      }
    }, 250)
    return () => window.clearInterval(intervalId)
  }, [timerChannel?.id, timerDuration, timerMode, timerFirstMemberId])
  useEffect(() => {
    if (!voiceModeOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!voiceModeMenuRef.current?.contains(event.target as Node)) setVoiceModeOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setVoiceModeOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [voiceModeOpen])
  useEffect(() => {
    if (!volumePopover) return
    const onPointerDown = (event: PointerEvent) => {
      if (!voiceAudioControlsRef.current?.contains(event.target as Node)) setVolumePopover(null)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setVolumePopover(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [volumePopover])

  useEffect(() => {
    if (!channelContextMenu) return
    const onPointerDown = (event: PointerEvent) => {
      if (!channelMenuRef.current?.contains(event.target as Node)) setChannelContextMenu(null)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setChannelContextMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [channelContextMenu])
  useEffect(() => {
    if (!roomContextMenu) return
    const onPointerDown = (event: PointerEvent) => {
      if (!roomMenuRef.current?.contains(event.target as Node)) setRoomContextMenu(null)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setRoomContextMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown) }
  }, [roomContextMenu])
  useEffect(() => {
    if (!roomContextMenu || !roomMenuRef.current || !voicePageRef.current) return
    const root = voicePageRef.current
    const menu = roomMenuRef.current
    const maxX = Math.max(8, root.clientWidth - menu.offsetWidth - 8)
    const maxY = Math.max(8, root.clientHeight - menu.offsetHeight - 8)
    const x = Math.min(Math.max(8, roomContextMenu.x), maxX)
    const y = Math.min(Math.max(8, roomContextMenu.y), maxY)
    if (x !== roomContextMenu.x || y !== roomContextMenu.y) setRoomContextMenu((current) => current ? { ...current, x, y } : null)
  }, [roomContextMenu])
  useEffect(() => {
    if (!channelContextMenu || !channelMenuRef.current || !voicePageRef.current) return
    const root = voicePageRef.current
    const menu = channelMenuRef.current
    const maxX = Math.max(8, root.clientWidth - menu.offsetWidth - 8)
    const maxY = Math.max(8, root.clientHeight - menu.offsetHeight - 8)
    const x = Math.min(Math.max(8, channelContextMenu.x), maxX)
    const y = Math.min(Math.max(8, channelContextMenu.y), maxY)
    if (x !== channelContextMenu.x || y !== channelContextMenu.y) {
      setChannelContextMenu((current) => current ? { ...current, x, y } : null)
    }
  }, [channelContextMenu])
  useEffect(() => {
    if (!membersDrawerOpen) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setMembersDrawerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [membersDrawerOpen])
  useEffect(() => {
    if (!memberContextMenu) return
    const onPointerDown = (event: PointerEvent) => {
      if (!memberMenuRef.current?.contains(event.target as Node)) setMemberContextMenu(null)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setMemberContextMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [memberContextMenu])
  useEffect(() => {
    if (!memberContextMenu || !memberMenuRef.current || !voicePageRef.current) return
    const root = voicePageRef.current
    const menu = memberMenuRef.current
    const maxX = Math.max(8, root.clientWidth - menu.offsetWidth - 8)
    const maxY = Math.max(8, root.clientHeight - menu.offsetHeight - 8)
    const x = Math.min(Math.max(8, memberContextMenu.x), maxX)
    const y = Math.min(Math.max(8, memberContextMenu.y), maxY)
    if (x !== memberContextMenu.x || y !== memberContextMenu.y) {
      setMemberContextMenu((current) => current ? { ...current, x, y } : null)
    }
  }, [memberContextMenu])

  if (treeSelection.activeRoomId !== logic.activeVoiceRoomId || treeSelection.activeChannelId !== logic.activeSubchannelId) {
    setTreeSelection({ roomId: logic.activeVoiceRoomId, channelId: logic.activeSubchannelId, activeRoomId: logic.activeVoiceRoomId, activeChannelId: logic.activeSubchannelId })
  }
  const selectedVoiceChannel = treeSelection

  if (pageState !== 'normal') return <NonNormalPageState pageState={pageState} onRetry={onRetry} />

  const room = logic.activeVoiceRoom
  const channel = logic.activeSubchannel
  const privateRoomTarget = privateRoomPasswordTarget
    ? logic.voiceRooms.find((item) => item.id === privateRoomPasswordTarget.roomId)?.channels.find((item) => item.id === privateRoomPasswordTarget.channelId)
    : undefined
  const selectVoiceSubchannel = (roomId: string, channelId: string) => {
    const targetRoom = logic.voiceRooms.find((item) => item.id === roomId)
    const targetChannel = targetRoom?.channels.find((item) => item.id === channelId)
    if (!targetRoom || !targetChannel) return
    if (targetChannel.privacy === '私密' && targetChannel.password && !targetChannel.members.some((member) => member.id === currentSocialUser.id)) {
      setPrivateRoomPasswordTarget({ roomId, channelId })
      setPrivateRoomPasswordInput('')
      setPrivateRoomPasswordError('')
      return
    }
    logic.selectVoiceSubchannel(roomId, channelId)
  }
  const confirmPrivateRoomPassword = () => {
    if (!privateRoomPasswordTarget || !privateRoomTarget) return
    if (privateRoomPasswordInput !== privateRoomTarget.password) {
      setPrivateRoomPasswordError('房间密码错误，请重试')
      return
    }
    logic.selectVoiceSubchannel(privateRoomPasswordTarget.roomId, privateRoomPasswordTarget.channelId)
    setPrivateRoomPasswordTarget(null)
    setPrivateRoomPasswordInput('')
    setPrivateRoomPasswordError('')
  }
  const channelDialogRoom = logic.voiceRooms.find((item) => item.id === channelDialog?.roomId)
  const channelDialogIsUngrouped = channelDialogRoom?.isUngrouped || channelDialog?.roomId === UNASSIGNED_VOICE_ROOM_ID
  const channelCapacityLimit = channelDialogIsUngrouped ? MAX_VOICE_CHANNEL_MEMBERS : channelDialogRoom?.capacity ?? 0
  const members = channel?.members ?? []
  const roomMemberCount = room?.channels.reduce((total, item) => total + item.members.length, 0) ?? 0
  const roomDialogMemberCount = logic.voiceRooms.find((item) => item.id === roomDialogTargetId)?.channels.reduce((total, item) => total + item.members.length, 0) ?? 0
  const roomDialogMinCapacity = Math.max(roomDialogMemberCount, ...((logic.voiceRooms.find((item) => item.id === roomDialogTargetId)?.channels ?? []).map((item) => item.capacity)), 1)
  const roomClub = ownerSource === 'club' ? clubs.find((club) => club.id === room?.clubId) ?? clubs[0] : undefined
  const roomOwner = ownerSource === 'personal' ? undefined : room?.ownerType === 'personal' ? socialFriends.find((friend) => friend.id === room.ownerId) : undefined
  const voiceMode = channel ? voiceModes[channel.id] ?? '自由模式' : '自由模式'
  const queueMembers = getMicQueueMembers(channel)
  const activeStageMembers = voiceMode === '麦序模式' ? queueMembers : members.filter((member) => member.micOn)
  const activeMicRequest = pendingMicRequest?.channelId === channel?.id ? pendingMicRequest.member : null
  const normalizedMemberSearch = memberSearch.trim().toLocaleLowerCase()
  const filteredMembers = members.filter((member) => member.name.toLocaleLowerCase().includes(normalizedMemberSearch))
  const contextRoom = channelContextMenu ? logic.voiceRooms.find((item) => item.id === channelContextMenu.roomId) : undefined
  const contextChannel = contextRoom?.channels.find((item) => item.id === channelContextMenu?.channelId)
  const menuRoom = roomContextMenu ? logic.voiceRooms.find((item) => item.id === roomContextMenu.roomId) : undefined
  const deletingVoiceRoom = logic.voiceRooms.find((item) => item.id === deleteVoiceRoomId)
  const deletingRoomMemberCount = deletingVoiceRoom?.channels.reduce((total, item) => total + item.members.length, 0) ?? 0
  const remainingVoiceRooms = logic.voiceRooms.filter((item) => item.id !== deleteVoiceRoomId)
  const canPreserveVoiceGroupRooms = Boolean(deletingVoiceRoom && !deletingVoiceRoom.isUngrouped)
  const canDeleteVoiceGroup = deleteVoiceRoomWithChannels
    ? remainingVoiceRooms.reduce((total, target) => total + Math.min(target.capacity - target.channels.reduce((count, child) => count + child.members.length, 0), target.channels.reduce((count, child) => count + child.capacity - child.members.length, 0)), 0) >= deletingRoomMemberCount
    : canPreserveVoiceGroupRooms
  const batchMoveSourceRoom = batchMoveDialog ? logic.voiceRooms.find((item) => item.id === batchMoveDialog.roomId) : undefined
  const batchMoveSourceChannel = batchMoveSourceRoom?.channels.find((item) => item.id === batchMoveDialog?.channelId)
  const batchMoveTargetRoom = logic.voiceRooms.find((item) => item.id === batchMoveTargetRoomId)
  const batchMoveTargetGroups = logic.voiceRooms.filter((item) => item.channels.some((target) => item.id !== batchMoveSourceRoom?.id || target.id !== batchMoveDialog?.channelId))
  const batchMoveTargets = batchMoveTargetRoom?.channels.filter((item) => batchMoveTargetRoom.id !== batchMoveSourceRoom?.id || item.id !== batchMoveDialog?.channelId) ?? []
  const batchMoveTarget = batchMoveTargets.find((item) => item.id === batchMoveTargetChannelId)
  const batchMoveTargetRoomCount = batchMoveTargetRoom?.channels.reduce((total, item) => total + item.members.length, 0) ?? 0
  const batchMoveGroupFits = batchMoveTargetRoom?.id === batchMoveSourceRoom?.id || Boolean(batchMoveTargetRoom && batchMoveTargetRoom.capacity - batchMoveTargetRoomCount >= batchMoveMemberIds.length)
  const batchMoveUnavailableReason = (group: VoiceRoomOption, target: VoiceSubchannel) => {
    if (group.id === batchMoveSourceRoom?.id && target.id === batchMoveSourceChannel?.id) return '当前房间'
    if (!batchMoveMemberIds.length) return '先选择成员'
    const groupCount = group.channels.reduce((total, item) => total + item.members.length, 0)
    if (group.id !== batchMoveSourceRoom?.id && group.capacity - groupCount < batchMoveMemberIds.length) return '分组容量不足'
    if (target.capacity - target.members.length < batchMoveMemberIds.length) return '房间容量不足'
    return null
  }
  const batchMovePageSize = 6
  const batchMovePageCount = Math.max(1, Math.ceil((batchMoveSourceChannel?.members.length ?? 0) / batchMovePageSize))
  const batchMovePageMembers = batchMoveSourceChannel?.members.slice(batchMoveMemberPage * batchMovePageSize, (batchMoveMemberPage + 1) * batchMovePageSize) ?? []
  const singleMoveSourceRoom = singleMoveDialog ? logic.voiceRooms.find((item) => item.id === singleMoveDialog.roomId) : undefined
  const singleMoveSourceChannel = singleMoveSourceRoom?.channels.find((item) => item.id === singleMoveDialog?.channelId)
  const singleMoveTargetRoom = logic.voiceRooms.find((item) => item.id === singleMoveTargetRoomId)
  const singleMoveTargetGroups = logic.voiceRooms.filter((item) => item.channels.some((target) => item.id !== singleMoveSourceRoom?.id || target.id !== singleMoveSourceChannel?.id))
  const singleMoveTargets = singleMoveTargetRoom?.channels.filter((item) => singleMoveTargetRoom.id !== singleMoveSourceRoom?.id || item.id !== singleMoveSourceChannel?.id) ?? []
  const singleMoveTarget = singleMoveTargets.find((item) => item.id === singleMoveTargetChannelId)
  const singleMoveUnavailableReason = (group: VoiceRoomOption, target: VoiceSubchannel) => {
    if (group.id === singleMoveSourceRoom?.id && target.id === singleMoveSourceChannel?.id) return '当前房间'
    if (group.id !== singleMoveSourceRoom?.id && singleMoveDialog && group.channels.some((item) => item.members.some((member) => member.id === singleMoveDialog.member.id))) return '成员已在此分组'
    const groupCount = group.channels.reduce((total, item) => total + item.members.length, 0)
    if (target.members.length >= target.capacity) return '房间已满'
    if (group.id !== singleMoveSourceRoom?.id && group.capacity - groupCount < 1) return '分组已满'
    return null
  }
  const singleMoveCanConfirm = Boolean(singleMoveDialog && singleMoveTargetRoom && singleMoveTarget && !singleMoveUnavailableReason(singleMoveTargetRoom, singleMoveTarget))
  const deletingChannel = room?.channels.find((item) => item.id === deleteChannelId)
  const deleteAvailableCapacity = room?.channels
    .filter((item) => item.id !== deleteChannelId)
    .reduce((total, item) => total + item.capacity - item.members.length, 0) ?? 0
  const canDeleteChannel = Boolean(deletingChannel && deletingChannel.members.length <= deleteAvailableCapacity)
  const canManage = room?.currentRole !== 'member'
  const isOwner = room?.currentRole === 'owner'
  const selectedProfile = voiceProfileId === currentSocialUser.id
    ? { ...currentSocialUser, status: '在线', online: true }
    : socialFriends.find((friend) => friend.id === voiceProfileId) ?? null
  const selectedProfileFriend = selectedProfile ? socialFriends.find((friend) => friend.id === selectedProfile.id) : undefined
  const linkedCompanion = selectedProfileFriend?.companionId ? companions.find((item) => item.id === selectedProfileFriend.companionId) : undefined
  const selectedProfileCard: ProfileCardData | undefined = selectedProfile ? {
    name: selectedProfile.name,
    initials: selectedProfile.initials,
    status: selectedProfile.status,
    gender: selectedProfile.gender,
    age: selectedProfile.age,
    userId: selectedProfile.profileId,
    rating: selectedProfile.rating,
    tags: selectedProfile.tags,
    intro: selectedProfile.intro,
  } : undefined
  const openInviteForChannel = (roomName: string, channelName: string) => {
    setInviteTargetChannel({ roomName, channelName })
    setInviteDialog(true)
  }
  const openCreateRoom = () => { setRoomName(''); setRoomCapacity(DEFAULT_VOICE_GROUP_CAPACITY); setRoomDialogTargetId(undefined); setRoomDialog('create') }
  const openEditRoom = (targetRoom = room) => { if (!targetRoom) return; setRoomName(targetRoom.name); setRoomCapacity(targetRoom.capacity); setRoomDialogTargetId(targetRoom.id); setRoomDialog('edit') }
  const saveRoom = () => {
    if (!roomName.trim() || !Number.isInteger(roomCapacity) || roomCapacity < (roomDialog === 'edit' ? roomDialogMinCapacity : 1) || roomCapacity > MAX_VOICE_GROUP_MEMBERS) return
    if (roomDialog === 'create') logic.createVoiceRoom(roomName, roomCapacity)
    else logic.updateVoiceRoom(roomName, roomDialogTargetId, roomCapacity)
    setRoomDialog(null)
  }
  const openChannelDialog = (mode: 'create' | 'edit', id?: string, roomId = room?.id) => {
    const targetRoom = logic.voiceRooms.find((item) => item.id === roomId)
    if (mode === 'create' && targetRoom) logic.selectVoiceRoom(targetRoom.id)
    const targetChannel = mode === 'edit' ? targetRoom?.channels.find((item) => item.id === id) : undefined
    setChannelName(targetChannel?.name ?? (mode === 'create' ? logic.nextVoiceChannelName : ''))
    const targetIsUngrouped = roomId === UNASSIGNED_VOICE_ROOM_ID || targetRoom?.isUngrouped
    setChannelCapacity(targetChannel?.capacity ?? Math.min(MAX_VOICE_CHANNEL_MEMBERS, targetIsUngrouped ? MAX_VOICE_CHANNEL_MEMBERS : targetRoom?.capacity ?? 1))
    setChannelMessageFrequency(targetChannel ? String(targetChannel.messageFrequencySeconds || '') : '5')
    setChannelMicQueueDuration(String(targetChannel?.micQueueDurationSeconds ?? 60))
    setChannelPrivacy(targetChannel?.privacy ?? '公开')
    setChannelPassword(targetChannel?.password ?? '')
    setChannelImageDataUrl(targetChannel?.imageDataUrl ?? '')
    setChannelDialog({ mode, id, roomId })
  }
  const saveChannel = () => {
    if (!channelName.trim() || !channelDialog) return
    const messageFrequencySeconds = channelMessageFrequency.trim() === '' ? 0 : Number(channelMessageFrequency)
    const micQueueDurationSeconds = Number(channelMicQueueDuration)
    if (!Number.isSafeInteger(messageFrequencySeconds) || messageFrequencySeconds < 0 || !Number.isSafeInteger(micQueueDurationSeconds) || micQueueDurationSeconds < 1) return
    const editingChannel = channelDialog.mode === 'edit'
      ? logic.voiceRooms.find((item) => item.id === channelDialog.roomId)?.channels.find((item) => item.id === channelDialog.id)
      : undefined
    if (logic.voiceRooms.some((item) => item.channels.some((child) => child.id !== editingChannel?.id && child.name.trim() === channelName.trim()))) {
      setFeedback('房间名称不能重复。')
      return
    }
    const targetRoom = logic.voiceRooms.find((item) => item.id === channelDialog.roomId)
    const capacityLimit = channelDialog.roomId === UNASSIGNED_VOICE_ROOM_ID || targetRoom?.isUngrouped ? MAX_VOICE_CHANNEL_MEMBERS : targetRoom?.capacity ?? 0
    if (channelCapacity < Math.max(1, editingChannel?.members.length ?? 1) || channelCapacity > capacityLimit) return
    const details = { name: channelName, imageDataUrl: channelImageDataUrl || undefined, capacity: channelCapacity, messageFrequencySeconds, micQueueDurationSeconds, privacy: channelPrivacy, password: channelPassword }
    if (channelDialog.mode === 'create') logic.createSubchannel(details, channelDialog.roomId)
    else if (channelDialog.id) logic.updateSubchannel(channelDialog.roomId, channelDialog.id, details)
    setChannelDialog(null)
  }
  const saveInvites = () => {
    if (!invitees.length) return
    const count = logic.inviteFriendsToRoom(invitees)
    setFeedback(`已向 ${count} 位好友发送加入「${inviteTargetChannel?.roomName ?? room?.name} · ${inviteTargetChannel?.channelName ?? channel?.name}」的邀请（仅演示）。`)
    setInviteDialog(false)
    setInviteTargetChannel(null)
    setInvitees([])
  }
  const toggleInvitee = (id: string) => setInvitees((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const onDropMember = (targetChannelId: string) => {
    if (!logic.draggedMemberId) return
    logic.moveMember(logic.draggedMemberId, targetChannelId)
    setFeedback('已将成员移动到目标房间。')
    logic.setDraggedMemberId(null)
  }
  const toggleRole = (member: VoiceMember) => setMemberAction({ type: 'role', member })
  const memberActionLabel = !memberAction ? '' : memberAction.type === 'mute'
    ? memberAction.member.muted ? '解除静音' : '静音'
    : memberAction.type === 'remove' ? '移出房间'
      : memberAction.type === 'role' ? memberAction.member.role === 'admin' ? '撤销管理员' : '设为管理员'
        : '拉黑'
  const confirmMemberAction = () => {
    if (!memberAction) return
    const { type, member } = memberAction
    if (type === 'mute') logic.setVoiceMemberMuted(member.id)
    if (type === 'remove') logic.removeVoiceMember(member.id)
    if (type === 'block') logic.blockVoiceMember(member.id)
    if (type === 'role') logic.setVoiceMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')
    setFeedback(type === 'block' ? `已拉黑「${member.name}」，并从语音房成员中移除。` : type === 'role' ? member.role === 'admin' ? `已撤销「${member.name}」的管理员身份。` : `已将「${member.name}」设为管理员。` : `已${memberActionLabel}「${member.name}」。`)
    setMemberAction(null)
  }

  const openMemberProfile = (memberId: string) => {
    setVoiceProfileId(memberId)
    setMemberContextMenu(null)
  }

  const openMemberContextMenu = (event: ReactMouseEvent, member: VoiceMember) => {
    event.preventDefault()
    event.stopPropagation()
    const root = voicePageRef.current
    if (!root) return
    const bounds = root.getBoundingClientRect()
    const scale = bounds.width / root.clientWidth || 1
    setMemberContextMenu({ member, x: (event.clientX - bounds.left) / scale, y: (event.clientY - bounds.top) / scale })
  }

  const openSingleMoveDialogFor = (member: VoiceMember, sourceRoomId: string, sourceChannelId: string) => {
    setSingleMoveDialog({ member, roomId: sourceRoomId, channelId: sourceChannelId })
    setSingleMoveTargetRoomId('')
    setSingleMoveTargetChannelId('')
  }
  const openSingleMoveDialog = () => {
    if (!memberContextMenu || !room) return
    const sourceChannel = room.channels.find((item) => item.members.some((member) => member.id === memberContextMenu.member.id))
    if (!sourceChannel) return
    openSingleMoveDialogFor(memberContextMenu.member, room.id, sourceChannel.id)
    setMemberContextMenu(null)
  }
  const confirmSingleMove = () => {
    if (!singleMoveDialog || !singleMoveTargetRoom || !singleMoveTarget) return
    const moved = logic.moveVoiceMember(singleMoveDialog.member.id, singleMoveTargetRoom.id, singleMoveTarget.id)
    setFeedback(moved
      ? `已将「${singleMoveDialog.member.name}」移动到「${singleMoveTargetRoom.name} · ${singleMoveTarget.name}」。`
      : '目标房间剩余人数不足，无法移动成员。')
    setSingleMoveDialog(null)
  }

  const openChannelContextMenu = (event: ReactMouseEvent, roomId: string, channelId: string) => {
    event.preventDefault()
    event.stopPropagation()
    const root = voicePageRef.current
    if (!root) return
    const bounds = root.getBoundingClientRect()
    const scale = bounds.width / root.clientWidth || 1
    setChannelContextMenu({ roomId, channelId, x: (event.clientX - bounds.left) / scale, y: (event.clientY - bounds.top) / scale })
  }
  const openRoomContextMenu = (event: ReactMouseEvent, roomId: string) => {
    event.preventDefault()
    event.stopPropagation()
    const targetRoom = logic.voiceRooms.find((item) => item.id === roomId)
    if (!targetRoom || targetRoom.isUngrouped || targetRoom.currentRole === 'member') return
    const root = voicePageRef.current
    if (!root) return
    const bounds = root.getBoundingClientRect()
    const scale = bounds.width / root.clientWidth || 1
    setChannelContextMenu(null)
    setRoomContextMenu({ roomId, x: (event.clientX - bounds.left) / scale, y: (event.clientY - bounds.top) / scale })
  }
  const moveDraggedVoiceChannel = (targetRoomId: string, beforeChannelId?: string) => {
    if (!draggedVoiceChannel) return
    const moved = logic.moveVoiceSubchannel(draggedVoiceChannel.roomId, draggedVoiceChannel.channelId, targetRoomId, beforeChannelId)
    if (!moved) setFeedback('目标分组人数或房间上限不足，无法移动。')
    else if (draggedVoiceChannel.roomId !== targetRoomId) setFeedback('房间已移动到目标分组。')
    setDraggedVoiceChannel(null)
  }
  const moveDraggedVoiceGroup = (targetRoomId: string, insertAfter: boolean) => {
    if (!draggedVoiceGroupId) return
    const moved = logic.moveVoiceRoom(draggedVoiceGroupId, targetRoomId, insertAfter)
    if (moved) setFeedback('分组顺序已更新。')
    setDraggedVoiceGroupId(null)
  }

  const collapseAllVoiceChannels = () => {
    setCollapsedChannelIds(logic.voiceRooms.flatMap((item) => item.channels.map((subchannel) => subchannel.id)))
    setChannelContextMenu(null)
  }

  const collapseAllVoiceGroups = () => {
    setCollapsedRoomIds(logic.voiceRooms.map((item) => item.id))
    setRoomContextMenu(null)
  }

  const locateMyVoicePosition = () => {
    if (!contextRoom) return
    const myChannel = contextRoom.channels.find((item) => item.members.some((member) => member.id === currentSocialUser.id))
    setChannelContextMenu(null)
    if (!myChannel) {
      setFeedback('你当前不在这个语音分组中。')
      return
    }
    setCollapsedRoomIds((ids) => ids.filter((id) => id !== contextRoom.id))
    setCollapsedChannelIds((ids) => ids.filter((id) => id !== myChannel.id))
    logic.selectVoiceSubchannel(contextRoom.id, myChannel.id)
    window.requestAnimationFrame(() => {
      const target = voicePageRef.current?.querySelector<HTMLElement>('[data-voice-member-id="player"]')
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      target?.focus({ preventScroll: true })
    })
  }

  const openBatchMoveDialog = () => {
    if (!contextRoom || !contextChannel) return
    setBatchMoveDialog({ roomId: contextRoom.id, channelId: contextChannel.id })
    setBatchMoveMemberIds([])
    setBatchMoveTargetRoomId('')
    setBatchMoveTargetChannelId('')
    setBatchMoveMemberPage(0)
    setChannelContextMenu(null)
  }
  const setBatchMoveSelection = (next: string[]) => {
    if (batchMoveTargetChannelId && (!next.length || next.length > (batchMoveTarget?.capacity ?? 0) - (batchMoveTarget?.members.length ?? 0) || (batchMoveTargetRoom?.id !== batchMoveSourceRoom?.id && next.length > (batchMoveTargetRoom?.capacity ?? 0) - batchMoveTargetRoomCount))) setBatchMoveTargetChannelId('')
    setBatchMoveMemberIds(next)
  }
  const toggleBatchMoveMember = (memberId: string) => setBatchMoveSelection(batchMoveMemberIds.includes(memberId) ? batchMoveMemberIds.filter((id) => id !== memberId) : [...batchMoveMemberIds, memberId])
  const confirmBatchMove = () => {
    if (!batchMoveDialog || !batchMoveTargetRoomId || !batchMoveTargetChannelId || !batchMoveMemberIds.length) return
    const movedCount = logic.moveMembers(batchMoveDialog.roomId, batchMoveDialog.channelId, batchMoveMemberIds, batchMoveTargetRoomId, batchMoveTargetChannelId)
    if (movedCount && batchMoveMemberIds.includes(currentSocialUser.id)) logic.selectVoiceSubchannel(batchMoveTargetRoomId, batchMoveTargetChannelId)
    setFeedback(movedCount ? `已将 ${movedCount} 位成员移动到「${batchMoveTargetRoom?.name ?? '目标分组'} · ${batchMoveTarget?.name ?? '目标房间'}」。` : '目标房间剩余人数不足，未能移动成员。')
    setBatchMoveDialog(null)
  }
  const roomQuery = roomSearch.trim().toLocaleLowerCase()
  const searchableVoiceRooms = logic.visibleVoiceRooms.filter((item) => !item.isUngrouped || item.channels.length > 0).map((item) => {
    const groupMatches = item.name.toLocaleLowerCase().includes(roomQuery)
    return { ...item, channels: !roomQuery || groupMatches ? item.channels : item.channels.filter((voiceChannel) => voiceChannel.name.toLocaleLowerCase().includes(roomQuery)) }
  }).filter((item) => !roomQuery || item.name.toLocaleLowerCase().includes(roomQuery) || item.channels.length > 0)

  return <div className="social-page voice-page" ref={voicePageRef}>
    <div className="voice-workspace">
      <aside className="voice-room-tree" aria-label="语音分组与房间">
        <section className="voice-owner-card" aria-label="房间归属">
          <AvatarMark initials={roomClub?.initials ?? roomOwner?.initials ?? currentSocialUser.initials} size="md" />
          <div className="voice-owner-card__identity">{roomClub ? <strong>{roomClub.name}</strong> : <strong><UserNameWithLevel name={roomOwner?.name ?? currentSocialUser.name} identityId={roomOwner?.id ?? currentSocialUser.profileId} /></strong>}<span>ID：{roomClub?.id ?? roomOwner?.profileId ?? currentSocialUser.profileId}</span></div>
          {roomClub && <button type="button" className="voice-owner-card__support" aria-label="联系俱乐部客服" onClick={() => setClubSupportSelectionOpen(true)}><Headphones size={14} />客服</button>}
        </section>
        <label className="voice-room-search"><Search size={15} /><input type="search" value={roomSearch} onChange={(event) => setRoomSearch(event.target.value)} placeholder="搜索房间" aria-label="搜索房间" /></label>
        <div className="voice-tree-section-actions">
          <button type="button" className="voice-create-group-entry" onClick={openCreateRoom}><Plus size={14} />创建分组</button>
          <button type="button" className="voice-create-group-entry" onClick={() => openChannelDialog('create', undefined, UNASSIGNED_VOICE_ROOM_ID)}><Plus size={14} />创建房间</button>
        </div>
        <div className="voice-room-list">{searchableVoiceRooms.map((item) => <section className={`voice-room-group${selectedVoiceChannel.roomId === item.id ? ' is-active' : ''}${draggedVoiceChannel && item.id !== draggedVoiceChannel.roomId && item.currentRole !== 'member' ? ' is-channel-drop-target' : ''}${draggedVoiceGroupId && draggedVoiceGroupId !== item.id && !item.isUngrouped && item.currentRole !== 'member' ? ' is-group-drop-target' : ''}${draggedVoiceGroupId === item.id ? ' is-group-dragging' : ''}`} key={item.id}>
          <div className="voice-room-heading-row" onContextMenu={(event) => openRoomContextMenu(event, item.id)} onDragOver={(event) => { if (event.dataTransfer.types.includes('application/x-voice-room-group') && draggedVoiceGroupId !== item.id && !item.isUngrouped && item.currentRole !== 'member') event.preventDefault(); else if (event.dataTransfer.types.includes('application/x-voice-room-channel') && item.currentRole !== 'member' && draggedVoiceChannel?.roomId !== item.id) event.preventDefault() }} onDrop={(event) => { if (event.dataTransfer.types.includes('application/x-voice-room-group')) { event.preventDefault(); event.stopPropagation(); const bounds = event.currentTarget.getBoundingClientRect(); moveDraggedVoiceGroup(item.id, event.clientY >= bounds.top + bounds.height / 2); return } if (event.dataTransfer.types.includes('application/x-voice-room-channel')) { event.preventDefault(); event.stopPropagation(); moveDraggedVoiceChannel(item.id) } }}>
            <button type="button" className="voice-room-heading" draggable={!item.isUngrouped && item.currentRole !== 'member'} onDragStart={(event) => { if (item.isUngrouped || item.currentRole === 'member') { event.preventDefault(); return } event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/x-voice-room-group', item.id); setDraggedVoiceGroupId(item.id) }} onDragEnd={() => setDraggedVoiceGroupId(null)} aria-expanded={!collapsedRoomIds.includes(item.id)} onClick={() => setCollapsedRoomIds((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id])}><ChevronRight size={14} className={`voice-room-chevron${collapsedRoomIds.includes(item.id) ? '' : ' is-expanded'}`} /><span>{item.isUngrouped ? <Volume2 size={15} /> : <Users size={15} />}</span><strong>{item.name}</strong><small className="voice-room-heading__count">{item.isUngrouped ? `${item.channels.length} 个房间` : `${item.channels.reduce((total, roomChannel) => total + roomChannel.members.length, 0)}/${item.capacity}`}</small></button>
            {!item.isUngrouped && <button type="button" className="voice-create-child-channel" aria-label={`在${item.name}创建房间`} title="新增房间" onClick={() => openChannelDialog('create', undefined, item.id)}><Plus size={13} /></button>}
            {!item.isUngrouped && <button type="button" className="windows-icon-button voice-tree-manage" aria-label={`编辑${item.name}分组`} title="编辑分组" onClick={() => openEditRoom(item)}><Pencil size={13} /></button>}
          </div>
          {(!roomQuery && collapsedRoomIds.includes(item.id)) ? null : <div className="voice-subchannel-list">{item.channels.map((subchannel) => <div className={`voice-subchannel${selectedVoiceChannel.channelId === subchannel.id && selectedVoiceChannel.roomId === item.id ? ' is-active' : ''}${logic.draggedMemberId && room?.id === item.id && logic.draggedMemberId !== currentSocialUser.id ? ' is-drop-target' : ''}${draggedVoiceChannel?.channelId === subchannel.id ? ' is-channel-dragging' : ''}${draggedVoiceChannel && draggedVoiceChannel.channelId !== subchannel.id && item.currentRole !== 'member' ? ' is-channel-drop-target' : ''}`} key={subchannel.id} onContextMenu={(event) => openChannelContextMenu(event, item.id, subchannel.id)} onDragOver={(event) => { if (event.dataTransfer.types.includes('application/x-voice-room-channel') && item.currentRole !== 'member') event.preventDefault(); else if (room?.id === item.id && canManage) event.preventDefault() }} onDrop={(event) => { if (event.dataTransfer.types.includes('application/x-voice-room-channel')) { event.preventDefault(); event.stopPropagation(); moveDraggedVoiceChannel(item.id, subchannel.id); return } event.preventDefault(); if (room?.id === item.id) onDropMember(subchannel.id) }}>
            <div className="voice-subchannel__heading-row">
              <button type="button" className="voice-subchannel__collapse" aria-label={`${collapsedChannelIds.includes(subchannel.id) ? '展开' : '折叠'}${subchannel.name}成员`} aria-expanded={!collapsedChannelIds.includes(subchannel.id)} onClick={() => setCollapsedChannelIds((ids) => ids.includes(subchannel.id) ? ids.filter((id) => id !== subchannel.id) : [...ids, subchannel.id])}><ChevronRight size={13} className={`voice-room-chevron${collapsedChannelIds.includes(subchannel.id) ? '' : ' is-expanded'}`} /></button>
              <button type="button" className="voice-subchannel__heading" draggable={item.currentRole !== 'member'} onDragStart={(event) => { if (item.currentRole === 'member') { event.preventDefault(); return } event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/x-voice-room-channel', subchannel.id); setDraggedVoiceChannel({ roomId: item.id, channelId: subchannel.id }) }} onDragEnd={() => setDraggedVoiceChannel(null)} onClick={() => setTreeSelection({ roomId: item.id, channelId: subchannel.id, activeRoomId: logic.activeVoiceRoomId, activeChannelId: logic.activeSubchannelId })} onDoubleClick={() => selectVoiceSubchannel(item.id, subchannel.id)}>{subchannel.privacy === '私密' ? <LockKeyhole size={14} /> : <Volume2 size={14} />}<span><span>{subchannel.name}</span>{subchannel.isDefault && <em className="voice-default-room-badge"><Star size={10} fill="currentColor" />默认</em>}</span><small>{subchannel.members.length}/{subchannel.capacity}</small></button>
              <span className="voice-subchannel__hover-hint" aria-hidden="true">双击进入房间</span>
              <div className="voice-subchannel__tools">
                <button type="button" className="voice-subchannel__action" aria-label={`邀请好友加入${item.name}的${subchannel.name}`} title="邀请好友" onClick={() => openInviteForChannel(item.name, subchannel.name)}><UserPlus size={13} /></button>
                <button type="button" className="voice-subchannel__action" aria-label={`编辑${subchannel.name}`} title="编辑房间" onClick={() => openChannelDialog('edit', subchannel.id, item.id)}><Pencil size={13} /></button>
              </div>
            </div>
            {!collapsedChannelIds.includes(subchannel.id) && <div className="voice-channel-members">{subchannel.members.map((member) => <span className={`voice-channel-member${member.id === currentSocialUser.id ? ' is-self' : ''}`} data-voice-member-id={member.id} tabIndex={member.id === currentSocialUser.id ? -1 : undefined} key={member.id} draggable={room?.id === item.id && canManage && member.id !== currentSocialUser.id} onDragStart={() => logic.setDraggedMemberId(member.id)} onDragEnd={() => logic.setDraggedMemberId(null)} title={canManage ? '拖动到其他房间' : member.name}><AvatarMark initials={member.initials} size="sm" /><UserNameWithLevel name={member.name} identityId={member.id} />{member.muted && <MicOff size={12} />}</span>)}</div>}
          </div>)}
        </div>}
        </section>)}
          {searchableVoiceRooms.length === 0 && <div className="social-empty-inline">{roomQuery ? '没有匹配的房间' : '暂无可发现的语音房'}</div>}
        </div>
        <section className="voice-device-panel" aria-label="语音设备控制">
          <div className="voice-device-panel__heading"><span><i className={`voice-status-dot${logic.isInVoice ? ' is-connected' : ''}`} />{channel?.name ?? '未选择房间'}</span><button type="button" className="voice-leave-button" onClick={() => setLeaveDialogOpen(true)} disabled={!logic.isInVoice} aria-label="退出房间" data-tooltip="退出房间"><PhoneOff size={15} /></button></div>
          <div className="voice-quick-actions" ref={voiceAudioControlsRef}>
            <label className="voice-mic-mode"><SlidersHorizontal size={14} /><select value={micMode} onChange={(event) => setMicMode(event.target.value)} aria-label="语音感应选项"><option>语音感应</option><option>按键发言</option></select></label>
            <button type="button" className={`voice-quick-action voice-quick-action--icon${recording ? ' is-active' : ''}`} ref={recordingEntryButton} onClick={requestRoomRecording} disabled={!logic.isInVoice} aria-label={recording ? '停止录音' : '录音'} data-tooltip={recording ? '停止录音' : '录音'}><Circle size={15} />{recording && <i />}</button>
            <div className="voice-device-control">
              <button type="button" className={`voice-quick-action voice-quick-action--icon${logic.isInVoice && logic.isSelfMuted ? ' is-active' : ''}`} onClick={logic.toggleSelfMute} disabled={!logic.isInVoice} aria-label={logic.isSelfMuted ? '取消麦克风静音' : '麦克风静音'}>{logic.isSelfMuted ? <MicOff size={15} /> : <Mic size={15} />}</button>
              <div className="voice-volume-popover"><label><output>{micInputVolume}</output><input type="range" min="0" max="100" value={micInputVolume} onChange={(event) => setMicInputVolume(Number(event.target.value))} aria-label="麦克风音量" /></label></div>
            </div>
            <div className={`voice-device-control${volumePopover === 'speaker' ? ' is-open' : ''}`}>
              <button type="button" className={`voice-quick-action voice-quick-action--icon${volumePopover === 'speaker' ? ' is-active' : ''}`} onClick={() => setVolumePopover((current) => current === 'speaker' ? null : 'speaker')} aria-label="扬声器音量" aria-expanded={volumePopover === 'speaker'}><Volume2 size={15} /></button>
              <div className="voice-volume-popover"><label><output>{outputVolume}</output><input type="range" min="0" max="100" value={outputVolume} onChange={(event) => setOutputVolume(Number(event.target.value))} aria-label="扬声器音量" /></label></div>
            </div>
          </div>
          <div className="voice-device-panel__join"><span>{logic.isInVoice ? logic.isMicOn ? '麦克风已开启' : '当前在听' : '正在浏览房间'}</span><button type="button" onClick={logic.isInVoice ? logic.toggleMic : logic.joinVoice} disabled={!logic.isInVoice && (members.length >= (channel?.capacity ?? MAX_VOICE_CHANNEL_MEMBERS) || roomMemberCount >= (room?.capacity ?? MAX_VOICE_GROUP_MEMBERS))} aria-label={logic.isInVoice ? logic.isMicOn ? '下麦' : '上麦' : '加入语音'}>{logic.isInVoice ? logic.isMicOn ? <><MicOff size={14} />下麦</> : <><Mic size={14} />上麦</> : <><Headphones size={14} />加入语音</>}</button></div>
        </section>
      </aside>

      <section className="voice-stage" aria-label="语音房麦位">
        <header className="voice-stage__header">
          <div className="voice-stage__room-identity"><AvatarMark initials={channel?.name.slice(0, 1) ?? '房'} imageUrl={channel?.imageDataUrl} size="md" /><div className="voice-stage__room-copy"><strong className="voice-stage__room-name">{channel?.name ?? '语音房'}</strong><div className="voice-stage__room-meta"><span>ID：{channel?.id ?? '—'}</span><span>{members.length}/{channel?.capacity ?? MAX_VOICE_CHANNEL_MEMBERS} 人</span><span><Flame size={12} />热度 {channel?.heat ?? 0}</span></div></div></div>
          <div className="voice-stage__header-actions">
            {room && channel && <FollowIconButton followed={logic.followedChannelIds.includes(`${room.id}:${channel.id}`)} name={`${room.name}${channel.name}`} onToggle={() => logic.toggleChannelFollow(`${room.id}:${channel.id}`)} />}
            <button type="button" className="voice-support-call" onClick={() => setSupportDialogOpen(true)}><Headphones size={14} />{supportQueued ? `排队中 · 第 ${initialSupportQueue.length + 1} 位` : '呼叫客服'}</button>
            <div className="voice-mode-control" ref={voiceModeMenuRef}>
            <button type="button" className="voice-mode-trigger" aria-haspopup="menu" aria-expanded={voiceModeOpen} onClick={() => setVoiceModeOpen((open) => !open)}><span>{voiceMode}</span><ChevronDown size={14} /></button>
            {voiceModeOpen && <div className="voice-mode-menu" role="menu" aria-label="选择房间模式">{(['自由模式', '主持人模式', '麦序模式'] as const).map((mode) => <button type="button" role="menuitemradio" aria-checked={voiceMode === mode} className={voiceMode === mode ? 'is-selected' : ''} key={mode} onClick={() => { if (channel) { setVoiceModes((current) => ({ ...current, [channel.id]: mode })); const requester = mode === '主持人模式' && canManage ? channel.members.find((member) => member.id !== currentSocialUser.id && !member.micOn) : undefined; setPendingMicRequest(requester ? { channelId: channel.id, member: requester } : null) } setVoiceModeOpen(false) }}>{mode}{voiceMode === mode && <Check size={14} />}</button>)}</div>}
            </div>
          </div>
        </header>
        {voiceMode === '主持人模式' && activeMicRequest && <div className="voice-mic-request" role="status"><div><AvatarMark initials={activeMicRequest.initials} size="sm" /><span className="voice-mic-request__copy"><strong>{activeMicRequest.name}</strong> 请求上麦</span></div><div><button type="button" onClick={() => setPendingMicRequest(null)}>拒绝</button><button type="button" className="is-primary" onClick={() => { logic.setVoiceMemberMic(activeMicRequest.id, true); setPendingMicRequest(null); setFeedback(`已同意 ${activeMicRequest.name} 上麦。`) }}>同意</button></div></div>}
        <div className="voice-member-grid">{Array.from({ length: voiceMode === '麦序模式' ? channel?.capacity ?? MAX_VOICE_CHANNEL_MEMBERS : activeStageMembers.length }, (_, index) => {
          const member = activeStageMembers[index]
          return <div className={`voice-seat${member ? ' is-occupied' : ''}${member?.micOn && !member.muted ? ' is-speaking' : ''}`} key={member?.id ?? `seat-${index}`}>
            {member ? <>
              <button type="button" className="voice-seat__avatar" aria-label={`${member.name}资料`}><AvatarMark initials={member.initials} size="lg" />{member.muted ? <span className="voice-seat__mic"><MicOff size={14} /></span> : member.micOn ? <span className="voice-seat__mic"><Mic size={14} /></span> : <span className="voice-seat__mic"><VolumeX size={14} /></span>}</button>
              <strong><UserNameWithLevel name={`${member.name}${member.id === currentSocialUser.id ? '（我）' : ''}`} identityId={member.id} /></strong>
              {member.role !== 'member' && <span className="voice-role-label">{roleLabel(member.role)}</span>}
              {voiceMode === '麦序模式' && index === 0 && micQueueCountdown?.memberId === member.id && <span className="voice-seat__countdown" role="timer" aria-label={`麦序剩余${micQueueCountdown.seconds}秒`}>{micQueueCountdown.seconds}秒</span>}
              {canManage && member.id !== currentSocialUser.id && <div className="voice-seat__management"><button type="button" onClick={() => setMemberAction({ type: 'mute', member })}>{member.muted ? '解除静音' : '静音'}</button><button type="button" onClick={() => setMemberAction({ type: 'remove', member })}>移出</button><button type="button" onClick={() => setMemberAction({ type: 'block', member })}>拉黑</button><button type="button" onClick={() => room && channel && openSingleMoveDialogFor(member, room.id, channel.id)}>移动至其他房间</button>{isOwner && member.role !== 'owner' && <button type="button" onClick={() => toggleRole(member)}>{member.role === 'admin' ? '撤销管理员' : '设为管理员'}</button>}</div>}
            </> : <><span className="voice-seat__empty"><Mic size={18} /></span><span>空麦位 {index + 1}</span></>}
          </div>
        })}</div>
        <footer className="voice-stage__footer"><button type="button" className="voice-members-entry" onClick={() => { setMemberSearch(''); setMembersDrawerOpen(true) }} aria-expanded={membersDrawerOpen} aria-controls="voice-members-drawer"><Users size={14} />全部成员<span>{members.length}</span></button></footer>
        {membersDrawerOpen && <>
          <button type="button" className="voice-members-backdrop" onClick={() => setMembersDrawerOpen(false)} aria-label="关闭全部成员面板" />
          <aside id="voice-members-drawer" className="voice-members-drawer" aria-label="房间成员">
            <header className="voice-members-drawer__header"><div><h2><Users size={16} />房间成员</h2><span>{members.length} 人</span></div><button type="button" className="windows-icon-button" onClick={() => setMembersDrawerOpen(false)} aria-label="关闭全部成员面板"><X size={17} /></button></header>
            <label className="voice-members-drawer__search"><Search size={15} /><input type="search" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="搜索当前房间成员" aria-label="搜索当前房间成员" /></label>
            <div className="voice-members-drawer__list">
              {filteredMembers.map((member) => <div className="voice-members-row" key={member.id} onContextMenu={(event) => openMemberContextMenu(event, member)}>
                <button type="button" className="voice-members-row__avatar" onClick={() => openMemberProfile(member.id)} onContextMenu={(event) => openMemberContextMenu(event, member)} aria-label={`查看${member.name}陪玩详情`}><AvatarMark initials={member.initials} size="sm" /></button>
                <button type="button" className="voice-members-row__name" onClick={() => openMemberProfile(member.id)} onContextMenu={(event) => openMemberContextMenu(event, member)}><UserNameWithLevel name={`${member.name}${member.id === currentSocialUser.id ? '（我）' : ''}`} identityId={member.id} /></button>
                {member.role !== 'member' && <span className={`voice-members-row__role is-${member.role}`}>{roleLabel(member.role)}</span>}
                <span className="voice-members-row__mic" role="img" aria-label={member.muted || !member.micOn ? '麦克风已关闭' : '麦克风已开启'} title={member.muted || !member.micOn ? '麦克风已关闭' : '麦克风已开启'}>{member.muted || !member.micOn ? <MicOff size={14} /> : <Mic size={14} />}</span>
              </div>)}
              {!filteredMembers.length && <p className="voice-members-empty">{members.length ? '没有匹配的成员' : '当前房间暂无成员'}</p>}
            </div>
          </aside>
        </>}
      </section>
      {recordingPromptOpen && <DialogPanel overlayId="room-recording-prompt" title="房间录音" description="开始后可点击录音按钮结束录音。" width={440} onClose={() => setRecordingPromptOpen(false)} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setRecordingPromptOpen(false)}>取消</button><button type="button" className="client-button client-button--primary" ref={recordingStartButton} onClick={startRoomRecording} disabled={!logic.isInVoice}>开始录音</button></>}>
        <label className="screen-recording-prompt__skip"><input type="checkbox" checked={skipRecordingPrompt} onChange={event => setSkipRecordingPrompt(event.target.checked)} /><span>本次会话不再提醒</span></label>
      </DialogPanel>}
      {leaveDialogOpen && <DialogPanel overlayId="voice-leave-options" title="退出语音房" description="选择如何处理当前语音连接。" onClose={() => setLeaveDialogOpen(false)} width={420} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setLeaveDialogOpen(false)}>取消</button><button type="button" className="client-button client-button--secondary" onClick={() => { setLeaveDialogOpen(false); onMinimizeVoice() }}>最小化</button><button type="button" className="client-button client-button--primary" onClick={() => { logic.leaveVoice(); setLeaveDialogOpen(false); onExitVoice() }}>退出房间</button></>} children={null} />}

      <RoomChatPanel hidden={Boolean(selectedProfile)} collapsed={roomChatCollapsed} onToggleCollapsed={() => setRoomChatCollapsed((value) => !value)} messages={logic.roomMessages} onRecallMessage={logic.recallRoomMessage} onSend={(kind, text, duration, replyTo) => logic.sendRoomMessage(kind, text, duration, replyTo)} onOpenProfile={openMemberProfile} onAvatarContextMenu={openMemberContextMenu} onOpenGift={(anchor) => onOpenGift(members.filter((member) => member.id !== currentSocialUser.id).map((member) => ({ id: member.id, name: member.name, initials: member.initials, profileId: socialFriends.find((friend) => friend.id === member.id)?.profileId })), undefined, anchor)} members={room?.channels.flatMap((subchannel) => subchannel.members) ?? []} />
      {selectedProfile && <aside className="social-profile-panel voice-profile-panel" aria-label={`${selectedProfile.name}陪玩详情`}>
        <header><h2><UserNameWithLevel name={selectedProfile.name} identityId={selectedProfile.id} /></h2><button type="button" className="windows-icon-button" aria-label="关闭陪玩详情" onClick={() => setVoiceProfileId(null)}><X size={17} /></button></header>
        {linkedCompanion && selectedProfileCard ? <CompanionDetailPage
          key={linkedCompanion.id}
          companion={linkedCompanion}
          pageState="normal"
          presentation="panel"
          onBack={() => setVoiceProfileId(null)}
          onRetry={onRetry}
          onOrder={onOrder}
          profileOverride={selectedProfileCard}
          followed={logic.followedProfileIds.includes(linkedCompanion.id)}
          blocked={logic.blockedProfileIds.includes(linkedCompanion.id)}
          onShare={(friendIds) => logic.shareCompanionToFriends(linkedCompanion.id, friendIds)}
          onToggleFollow={() => logic.toggleProfileFollow(linkedCompanion.id)}
          onBlock={() => logic.blockProfile(linkedCompanion.id)}
          onChat={() => onChatWithCompanion(linkedCompanion.id)}
          onGift={(anchor) => onOpenGift([], { id: linkedCompanion.id, name: linkedCompanion.name, initials: linkedCompanion.initials, profileId: linkedCompanion.id.replace('companion-', 'P-') }, anchor)}
        /> : selectedProfileCard ? <CompanionProfileCard profile={selectedProfileCard} /> : null}
      </aside>}
    </div>
    {feedback && <div className="social-toast" role="status">{feedback}<button type="button" className="windows-icon-button" onClick={() => setFeedback('')} aria-label="关闭通知"><X size={15} /></button></div>}

    {channelContextMenu && contextRoom && contextChannel && <div ref={channelMenuRef} className="voice-channel-context-menu" role="menu" aria-label={`${contextChannel.name}房间操作`} style={{ left: channelContextMenu.x, top: channelContextMenu.y }} onContextMenu={(event) => event.preventDefault()}>
      <button type="button" role="menuitem" onClick={() => { openInviteForChannel(contextRoom.name, contextChannel.name); setChannelContextMenu(null) }}><UserPlus size={15} />邀请</button>
      {contextRoom.currentRole !== 'member' && <>
        <button type="button" role="menuitem" disabled={!contextChannel.members.length || !contextRoom.channels.some((item) => item.id !== contextChannel.id)} onClick={openBatchMoveDialog}>批量移动用户至</button>
      </>}
      <button type="button" role="menuitemradio" aria-checked={Boolean(contextChannel.isDefault)} onClick={() => { const updated = logic.setDefaultVoiceSubchannel(contextRoom.id, contextChannel.id); if (updated) setFeedback(`已将「${contextChannel.name}」设为默认房间。`); setChannelContextMenu(null) }}><Star size={15} fill={contextChannel.isDefault ? 'currentColor' : 'none'} />{contextChannel.isDefault ? '默认房间（当前）' : '设为默认房间'}</button>
      <button type="button" role="menuitemcheckbox" aria-checked={collapsedChannelIds.includes(contextChannel.id)} onClick={() => { setCollapsedChannelIds((ids) => ids.includes(contextChannel.id) ? ids.filter((id) => id !== contextChannel.id) : [...ids, contextChannel.id]); setChannelContextMenu(null) }}><span>收起该房间</span><i className={collapsedChannelIds.includes(contextChannel.id) ? 'is-checked' : ''} /></button>
      <button type="button" role="menuitem" onClick={collapseAllVoiceChannels}>收起所有房间</button>
      {contextRoom.currentRole === 'owner' && <>
        <div className="voice-channel-context-separator" />
        <button type="button" role="menuitem" onClick={() => { openChannelDialog('edit', contextChannel.id, contextRoom.id); setChannelPrivacy('私密'); setChannelContextMenu(null) }}><LockKeyhole size={15} />设置密码</button>
        <button type="button" role="menuitem" onClick={() => { openChannelDialog('edit', contextChannel.id, contextRoom.id); setChannelContextMenu(null) }}><Pencil size={15} />编辑房间</button>
        <div className="voice-channel-context-separator" />
        <button type="button" role="menuitem" className="is-danger" disabled={contextRoom.channels.length <= 1} onClick={() => { logic.selectVoiceRoom(contextRoom.id); setDeleteChannelId(contextChannel.id); setChannelContextMenu(null) }}><Trash2 size={15} />删除房间</button>
      </>}
      <div className="voice-channel-context-separator" />
      <button type="button" role="menuitem" onClick={locateMyVoicePosition}>定位我的位置</button>
    </div>}

    {roomContextMenu && menuRoom && <div ref={roomMenuRef} className="voice-channel-context-menu voice-room-context-menu" role="menu" aria-label={`${menuRoom.name}分组操作`} style={{ left: roomContextMenu.x, top: roomContextMenu.y }} onContextMenu={(event) => event.preventDefault()}>
      <button type="button" role="menuitem" onClick={() => { openChannelDialog('create', undefined, menuRoom.id); setRoomContextMenu(null) }}><Plus size={15} />创建房间</button>
      <button type="button" role="menuitem" onClick={() => { openEditRoom(menuRoom); setRoomContextMenu(null) }}><Pencil size={15} />编辑分组</button>
      <button type="button" role="menuitemcheckbox" aria-checked={collapsedRoomIds.includes(menuRoom.id)} onClick={() => { setCollapsedRoomIds((ids) => ids.includes(menuRoom.id) ? ids.filter((id) => id !== menuRoom.id) : [...ids, menuRoom.id]); setRoomContextMenu(null) }}><span>收起该分组</span><i className={collapsedRoomIds.includes(menuRoom.id) ? 'is-checked' : ''} /></button>
      <button type="button" role="menuitem" onClick={collapseAllVoiceGroups}>收起全部分组</button>
      <div className="voice-channel-context-separator" />
      <button type="button" role="menuitem" className="is-danger" disabled={menuRoom.currentRole !== 'owner'} onClick={() => { setDeleteVoiceRoomId(menuRoom.id); setDeleteVoiceRoomWithChannels(false); setRoomContextMenu(null) }}><Trash2 size={15} />删除分组</button>
    </div>}

    {privateRoomPasswordTarget && <DialogPanel overlayId="voice-private-room-password" title={`进入私密房间${privateRoomTarget ? `：${privateRoomTarget.name}` : ''}`} description="请输入房间密码。" onClose={() => { setPrivateRoomPasswordTarget(null); setPrivateRoomPasswordInput(''); setPrivateRoomPasswordError('') }} width={420} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => { setPrivateRoomPasswordTarget(null); setPrivateRoomPasswordInput(''); setPrivateRoomPasswordError('') }}>取消</button><button type="button" className="client-button client-button--primary" onClick={confirmPrivateRoomPassword} disabled={!privateRoomPasswordInput}>进入房间</button></>}>
      <label className="social-form-field">房间密码<input autoFocus type="password" inputMode="numeric" autoComplete="current-password" value={privateRoomPasswordInput} onChange={(event) => { setPrivateRoomPasswordInput(event.target.value); setPrivateRoomPasswordError('') }} onKeyDown={(event) => { if (event.key === 'Enter' && privateRoomPasswordInput) confirmPrivateRoomPassword() }} placeholder="请输入房间密码" aria-invalid={Boolean(privateRoomPasswordError)} aria-describedby={privateRoomPasswordError ? 'voice-private-room-password-error' : undefined} /></label>
      {privateRoomPasswordError && <p id="voice-private-room-password-error" className="voice-private-room-password-error" role="alert">{privateRoomPasswordError}</p>}
    </DialogPanel>}
    {roomDialog && <DialogPanel overlayId="voice-room-dialog" title={roomDialog === 'create' ? '创建分组' : '编辑分组'} description={roomDialog === 'create' ? '创建后自动添加一个公开房间。' : undefined} onClose={() => setRoomDialog(null)} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setRoomDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveRoom} disabled={!roomName.trim() || !Number.isInteger(roomCapacity) || roomCapacity < (roomDialog === 'edit' ? roomDialogMinCapacity : 1) || roomCapacity > MAX_VOICE_GROUP_MEMBERS}>{roomDialog === 'create' ? '创建分组' : '保存'}</button></>}>
      <label className="social-form-field">分组名称<input value={roomName} onChange={(event) => setRoomName(event.target.value)} maxLength={24} placeholder="输入分组名称" /></label>
      <label className="social-form-field">分组最大人数（含所有房间）<input type="number" inputMode="numeric" min={roomDialog === 'edit' ? roomDialogMinCapacity : 1} max={MAX_VOICE_GROUP_MEMBERS} step={1} value={roomCapacity} onChange={(event) => setRoomCapacity(Number(event.target.value))} aria-label="分组最大人数，包含分组内所有房间" /></label>
    </DialogPanel>}
    {deleteVoiceRoomId && <DialogPanel overlayId="delete-voice-group-dialog" title={`删除「${deletingVoiceRoom?.name ?? '分组'}」`} onClose={() => setDeleteVoiceRoomId(null)} width={460} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setDeleteVoiceRoomId(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { const removed = logic.deleteVoiceRoom(deleteVoiceRoomId, deleteVoiceRoomWithChannels); setFeedback(removed ? deleteVoiceRoomWithChannels ? '分组及房间已删除，成员已移入其他房间。' : '分组已删除，房间已移至未分组。' : '其他房间没有足够的空位，无法删除。'); setDeleteVoiceRoomId(null) }} disabled={!canDeleteVoiceGroup}>确认删除</button></>}>
      <fieldset className="voice-delete-group-options"><legend>删除范围</legend><label><input type="radio" name="voice-delete-group-scope" checked={!deleteVoiceRoomWithChannels} onChange={() => setDeleteVoiceRoomWithChannels(false)} /><span><strong>仅删除分组</strong><small>保留房间</small></span></label><label><input type="radio" name="voice-delete-group-scope" checked={deleteVoiceRoomWithChannels} onChange={() => setDeleteVoiceRoomWithChannels(true)} /><span><strong>删除分组及房间</strong><small>删除组内房间，成员移入其他房间</small></span></label></fieldset>
      {!canDeleteVoiceGroup && <p className="social-dialog-copy">其他分组没有足够的空位，无法按当前选项删除。</p>}
    </DialogPanel>}

    {memberContextMenu && <div ref={memberMenuRef} className="voice-channel-context-menu voice-member-context-menu" role="menu" aria-label={`${memberContextMenu.member.name}成员操作`} style={{ left: memberContextMenu.x, top: memberContextMenu.y }} onContextMenu={(event) => event.preventDefault()}>
      <div className="voice-member-context-menu__title"><AvatarMark initials={memberContextMenu.member.initials} size="sm" /><strong><UserNameWithLevel name={memberContextMenu.member.name} identityId={memberContextMenu.member.id} /></strong></div>
      <button type="button" role="menuitem" disabled={!canManage || memberContextMenu.member.id === currentSocialUser.id} onClick={() => { setMemberAction({ type: 'mute', member: memberContextMenu.member }); setMemberContextMenu(null) }}><MicOff size={15} />{memberContextMenu.member.muted ? '解除静音' : '静音'}</button>
      <button type="button" role="menuitem" disabled={!canManage || memberContextMenu.member.id === currentSocialUser.id} onClick={() => { setMemberAction({ type: 'remove', member: memberContextMenu.member }); setMemberContextMenu(null) }}><X size={15} />移出房间</button>
      <button type="button" role="menuitem" disabled={!canManage || memberContextMenu.member.id === currentSocialUser.id} onClick={() => { setMemberAction({ type: 'block', member: memberContextMenu.member }); setMemberContextMenu(null) }}><Flag size={15} />拉黑</button>
      {isOwner && memberContextMenu.member.id !== currentSocialUser.id && <button type="button" role="menuitem" onClick={() => { setMemberAction({ type: 'role', member: memberContextMenu.member }); setMemberContextMenu(null) }}><Users size={15} />{memberContextMenu.member.role === 'admin' ? '撤销管理员' : '设为管理员'}</button>}
      <div className="voice-channel-context-separator" />
      <button type="button" role="menuitem" disabled={!canManage || memberContextMenu.member.id === currentSocialUser.id || !logic.voiceRooms.some((voiceRoom) => voiceRoom.channels.some((target) => voiceRoom.id !== room?.id || target.id !== channel?.id))} onClick={openSingleMoveDialog}>移动至其他房间<ChevronRight size={14} /></button>
    </div>}

    {channelDialog && <DialogPanel overlayId="voice-channel-dialog" title={channelDialog.mode === 'create' ? '创建房间' : '编辑房间'} description={channelDialog.mode === 'create' ? channelDialogIsUngrouped ? '创建为无分组房间。' : `添加到「${channelDialogRoom?.name ?? ''}」` : undefined} onClose={() => setChannelDialog(null)} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setChannelDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveChannel} disabled={!channelName.trim() || (channelMessageFrequency.trim() !== '' && (!Number.isSafeInteger(Number(channelMessageFrequency)) || Number(channelMessageFrequency) < 1)) || !Number.isSafeInteger(Number(channelMicQueueDuration)) || Number(channelMicQueueDuration) < 1 || channelCapacity < Math.max(1, channelDialog.mode === 'edit' ? logic.voiceRooms.find((item) => item.id === channelDialog.roomId)?.channels.find((item) => item.id === channelDialog.id)?.members.length ?? 1 : 1) || channelCapacity > channelCapacityLimit}>{channelDialog.mode === 'create' ? '创建房间' : '保存'}</button></>}>
      <div className="voice-channel-form">
        <label className="social-form-field">房间名称<input value={channelName} onChange={(event) => setChannelName(event.target.value)} maxLength={20} placeholder="例如：战术讨论" /></label>
        <div className="social-form-field"><span>房间图片</span><label className="voice-room-image-upload">{channelImageDataUrl ? <img src={channelImageDataUrl} alt="房间图片预览" /> : <ImagePlus size={20} />}<span>{channelImageDataUrl ? '更换图片' : '上传图片'}</span><input type="file" accept="image/*" aria-label="上传房间图片" onChange={(event) => { const input = event.currentTarget; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') setChannelImageDataUrl(reader.result) }; reader.readAsDataURL(file); input.value = '' }} /></label></div>
        <label className="social-form-field">人数上限<input type="number" min={1} max={channelCapacityLimit} value={channelCapacity} onChange={(event) => setChannelCapacity(event.target.value === '' ? 0 : Number(event.target.value))} aria-label="人数上限" /><small>{channelDialogIsUngrouped ? `单个房间最多 ${channelCapacityLimit} 人。` : `不能超过分组上限（${channelCapacityLimit} 人）。`}</small></label>
        <label className="social-form-field voice-frequency-field">发言频控（秒）<input type="number" min={1} step={1} value={channelMessageFrequency} onChange={(event) => setChannelMessageFrequency(event.target.value)} placeholder="不限制" aria-label="发言频控秒数，留空表示不限制" /><small>留空表示不限制。</small></label>
        <label className="social-form-field">麦序时长（秒）<input type="number" min={1} step={1} value={channelMicQueueDuration} onChange={(event) => setChannelMicQueueDuration(event.target.value)} aria-label="麦序时长秒数" /></label>
        <fieldset className="voice-privacy-choice"><legend>房间权限</legend><div className="voice-privacy-choice__options"><label><input type="radio" name="channelPrivacy" checked={channelPrivacy === '公开'} onChange={() => { setChannelPrivacy('公开'); setChannelPassword('') }} /><Globe2 size={17} /><span><strong>公开房间</strong><small>可在房间列表中浏览</small></span></label><label><input type="radio" name="channelPrivacy" checked={channelPrivacy === '私密'} onChange={() => setChannelPrivacy('私密')} /><LockKeyhole size={17} /><span><strong>私密房间</strong><small>可选设置进入密码</small></span></label></div></fieldset>
        {channelPrivacy === '私密' && <label className="social-form-field">房间密码<input type="password" value={channelPassword} onChange={(event) => setChannelPassword(event.target.value)} maxLength={32} placeholder="设置房间密码（可选）" autoComplete="new-password" /></label>}
      </div>
    </DialogPanel>}

    {singleMoveDialog && <DialogPanel overlayId="voice-single-move-dialog" title={`移动「${singleMoveDialog.member.name}」`} onClose={() => setSingleMoveDialog(null)} width={560} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setSingleMoveDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={confirmSingleMove} disabled={!singleMoveCanConfirm}>确认移动</button></>}>
      <VoiceDestinationCascade groups={singleMoveTargetGroups} selectedGroupId={singleMoveTargetRoomId} selectedChannelId={singleMoveTargetChannelId} onSelectGroup={(id) => { setSingleMoveTargetRoomId(id); setSingleMoveTargetChannelId('') }} onSelectChannel={setSingleMoveTargetChannelId} getUnavailableReason={singleMoveUnavailableReason} />
    </DialogPanel>}

    {batchMoveDialog && batchMoveSourceChannel && <DialogPanel overlayId="voice-batch-move-dialog" title="批量移动成员" description={`从「${batchMoveSourceRoom?.name ?? ''} · ${batchMoveSourceChannel.name}」选择成员和目标位置。`} onClose={() => setBatchMoveDialog(null)} width={520} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setBatchMoveDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={confirmBatchMove} disabled={!batchMoveMemberIds.length || !batchMoveTarget || !batchMoveGroupFits || batchMoveTarget.capacity - batchMoveTarget.members.length < batchMoveMemberIds.length}>确认移动（{batchMoveMemberIds.length}）</button></>}>
      <div className="voice-batch-move-form">
        <fieldset className="voice-batch-move-section">
          <legend>选择成员（{batchMoveMemberIds.length}/{batchMoveSourceChannel.members.length}）</legend>
          <div className="voice-batch-move-tools"><button type="button" className="client-text-button" onClick={() => setBatchMoveSelection(batchMoveSourceChannel.members.map((member) => member.id))}>全选</button><button type="button" className="client-text-button" onClick={() => setBatchMoveSelection(batchMoveSourceChannel.members.filter((member) => !batchMoveMemberIds.includes(member.id)).map((member) => member.id))}>反选</button></div>
          <div className="voice-batch-move-members">{batchMovePageMembers.map((member) => <label className="voice-batch-move-member" key={member.id}><input type="checkbox" checked={batchMoveMemberIds.includes(member.id)} onChange={() => toggleBatchMoveMember(member.id)} /><AvatarMark initials={member.initials} size="sm" /><span><UserNameWithLevel name={member.name} identityId={member.id} /></span></label>)}</div>
          {batchMovePageCount > 1 && <nav className="voice-batch-move-pagination" aria-label="成员分页"><button type="button" className="client-button client-button--secondary" disabled={batchMoveMemberPage === 0} onClick={() => setBatchMoveMemberPage((page) => Math.max(0, page - 1))}>上一页</button><span>第 {batchMoveMemberPage + 1} / {batchMovePageCount} 页</span><button type="button" className="client-button client-button--secondary" disabled={batchMoveMemberPage >= batchMovePageCount - 1} onClick={() => setBatchMoveMemberPage((page) => Math.min(batchMovePageCount - 1, page + 1))}>下一页</button></nav>}
        </fieldset>
        <fieldset className="voice-batch-move-section">
          <legend>选择目标房间</legend>
          <VoiceDestinationCascade groups={batchMoveTargetGroups} selectedGroupId={batchMoveTargetRoomId} selectedChannelId={batchMoveTargetChannelId} onSelectGroup={(id) => { setBatchMoveTargetRoomId(id); setBatchMoveTargetChannelId('') }} onSelectChannel={setBatchMoveTargetChannelId} getUnavailableReason={batchMoveUnavailableReason} />
          {!batchMoveTargetGroups.length && <p className="voice-batch-move-empty">没有可移动到的其他房间。</p>}
        </fieldset>
      </div>
    </DialogPanel>}

    {deleteChannelId && <DialogPanel overlayId="delete-channel-dialog" title={`删除「${deletingChannel?.name ?? '房间'}」`} description="房间成员将返回其他房间。" onClose={() => setDeleteChannelId(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setDeleteChannelId(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { logic.deleteSubchannel(deleteChannelId); setDeleteChannelId(null) }} disabled={!canDeleteChannel}>删除房间</button></>}>{!canDeleteChannel && <p className="social-dialog-copy">其他房间剩余人数不足，无法删除。请先调整人数上限或移出成员。</p>}</DialogPanel>}

    {memberAction && <DialogPanel overlayId="voice-member-action-dialog" children={null} title={`确认${memberActionLabel}`} description={memberAction.type === 'block' ? `拉黑「${memberAction.member.name}」后，对方会从语音房成员中移除。` : memberAction.type === 'remove' ? `确定将「${memberAction.member.name}」移出当前语音房吗？` : memberAction.type === 'role' ? memberAction.member.role === 'admin' ? `确定撤销「${memberAction.member.name}」的管理员身份吗？` : `确定将「${memberAction.member.name}」设为管理员吗？` : `确定${memberActionLabel}「${memberAction.member.name}」吗？`} onClose={() => setMemberAction(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setMemberAction(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={confirmMemberAction}>{`确认${memberActionLabel}`}</button></>} /> }

    {clubSupportSelectionOpen && roomClub && <ClubSupportSelectionDialog onClose={() => setClubSupportSelectionOpen(false)} onConsult={onOpenClubSupport} />}
    {supportDialogOpen && <DialogPanel overlayId="voice-customer-support-queue" title="呼叫客服" onClose={() => setSupportDialogOpen(false)} width={500} footer={supportQueued ? <><button type="button" className="client-button client-button--secondary" onClick={() => setSupportQueued(false)}>取消呼叫</button><button type="button" className="client-button client-button--primary" onClick={() => setSupportDialogOpen(false)}>完成</button></> : <><button type="button" className="client-button client-button--secondary" onClick={() => setSupportDialogOpen(false)}>暂不呼叫</button><button type="button" className="client-button client-button--primary" onClick={() => setSupportQueued(true)}>确认呼叫</button></>}>
      <div className="support-queue-summary"><Headphones size={18} /><strong>{supportQueued ? `正在排队 · 第 ${initialSupportQueue.length + 1} 位` : `当前 ${initialSupportQueue.length} 人排队`}</strong>{!supportQueued && <span>预计排在第 {initialSupportQueue.length + 1} 位</span>}</div>
      <div className="support-queue-list" aria-label="客服排队列表">{initialSupportQueue.map((person, index) => <div className="support-queue-row" key={person.id}><AvatarMark initials={person.initials} size="sm" /><strong><UserNameWithLevel name={person.name} identityId={person.name} /></strong><span>第 {index + 1} 位</span></div>)}{supportQueued && <div className="support-queue-row is-self"><AvatarMark initials={currentSocialUser.initials} size="sm" /><strong><UserNameWithLevel name={`${currentSocialUser.name}（我）`} identityId={currentSocialUser.profileId} /></strong><span>第 {initialSupportQueue.length + 1} 位</span></div>}</div>
    </DialogPanel>}
    {inviteDialog && <DialogPanel overlayId="invite-friends-dialog" title="邀请好友进入语音房" description={`邀请好友加入「${inviteTargetChannel?.roomName ?? room?.name ?? ''} · ${inviteTargetChannel?.channelName ?? channel?.name ?? ''}」。`} onClose={() => { setInviteDialog(false); setInviteTargetChannel(null) }} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => { setInviteDialog(false); setInviteTargetChannel(null) }}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveInvites} disabled={!invitees.length}>发送邀请（{invitees.length}）</button></>}>
      <div className="social-select-friends">{socialFriends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={invitees.includes(friend.id)} onChange={() => toggleInvitee(friend.id)} /><AvatarMark initials={friend.initials} size="sm" /><span><strong><UserNameWithLevel name={friend.name} identityId={friend.profileId} /></strong><small>{friend.status}</small></span></label>)}</div>
    </DialogPanel>}
  </div>
}

export function ClubSupportSelectionDialog({ onClose, onConsult }: { onClose: () => void; onConsult: () => void }) {
  const [tab, setTab] = useState<'presale' | 'aftersale'>('presale')
  const [messageSentTo, setMessageSentTo] = useState<string | null>(null)
  const staffList = tab === 'presale' ? clubPresaleStaff : clubAftersaleStaff
  return <DialogPanel overlayId="club-support-selection" title="咨询客服" onClose={onClose} width={520} className="club-support-selection-dialog">
    <div className="club-support-tabs" role="tablist" aria-label="客服类型">
      <button type="button" role="tab" aria-selected={tab === 'presale'} className={tab === 'presale' ? 'is-active' : ''} onClick={() => setTab('presale')}>售前客服</button>
      <button type="button" role="tab" aria-selected={tab === 'aftersale'} className={tab === 'aftersale' ? 'is-active' : ''} onClick={() => setTab('aftersale')}>售后客服</button>
    </div>
    <div className="club-support-list" role="tabpanel" aria-label={tab === 'presale' ? '售前客服列表' : '售后客服列表'}>
      {staffList.map((staff) => <article className="club-support-staff" key={staff.id}>
        <AvatarMark initials={staff.initials} size="md" />
        <div className="club-support-staff__info"><strong>{staff.name}</strong><span>工作时间：{staff.hours}</span></div>
        {staff.available
          ? <button type="button" className="client-button client-button--secondary" onClick={() => { onClose(); onConsult() }}>咨询</button>
          : <button type="button" className="client-button client-button--secondary" disabled={messageSentTo === staff.id} onClick={() => setMessageSentTo(staff.id)}>{messageSentTo === staff.id ? '已留言' : '留言'}</button>}
      </article>)}
      {messageSentTo && <p className="club-support-message-status" role="status">已留言（仅演示）</p>}
    </div>
  </DialogPanel>
}

export function ClubSupportChatPanel({ conversation, orders, onClose, onSend, onSendOrder, onReview }: { conversation?: NonNullable<SocialLogic['selectedConversation']>; orders: ClientOrder[]; onClose: () => void; onSend: (kind: ChatMessageKind, content: string, duration?: number, replyTo?: SocialMessage['replyTo']) => void; onSendOrder: (order?: ClientOrder) => void; onReview: (messageId: string, rating: number, submitted: boolean) => void }) {
  const [draft, setDraft] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false)
  const [replyTarget, setReplyTarget] = useState<SocialMessage | null>(null)
  const [playingMessage, setPlayingMessage] = useState<string | null>(null)
  const [voiceRecordingOpen, setVoiceRecordingOpen] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)
  const draggablePanelRef = useRef<HTMLElement>(null)
  const dragStartRef = useRef<{ pointerId: number; pointerX: number; pointerY: number; rect: DOMRect; bounds: DOMRect; scaleX: number; scaleY: number; x: number; y: number } | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  useEffect(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight }, [conversation?.messages.length])
  if (!conversation) return null
  const submit = () => {
    if (!draft.trim()) return
    onSend('text', draft.trim(), undefined, replyTarget ? replySnapshot(replyTarget) : undefined)
    setDraft('')
    setReplyTarget(null)
  }
  const sendQuickReply = (content: string) => { onSend('text', content, undefined, replyTarget ? replySnapshot(replyTarget) : undefined); setReplyTarget(null); setQuickRepliesOpen(false) }
  const handleEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }
  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button, input, textarea, a, select, [data-no-drag]')) return
    const panel = draggablePanelRef.current
    const bounds = panel?.closest<HTMLElement>('.game-companion-client') ?? panel?.parentElement
    if (!panel || !bounds) return
    const boundsRect = bounds.getBoundingClientRect()
    const rect = panel.getBoundingClientRect()
    const scaleX = bounds.offsetWidth ? boundsRect.width / bounds.offsetWidth : 1
    const scaleY = bounds.offsetHeight ? boundsRect.height / bounds.offsetHeight : 1
    dragStartRef.current = { pointerId: event.pointerId, pointerX: event.clientX, pointerY: event.clientY, rect, bounds: boundsRect, scaleX: scaleX || 1, scaleY: scaleY || 1, ...dragPosition }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }
  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const start = dragStartRef.current
    if (!start || start.pointerId !== event.pointerId) return
    const left = Math.min(Math.max(start.rect.left + event.clientX - start.pointerX, start.bounds.left), start.bounds.right - start.rect.width)
    const top = Math.min(Math.max(start.rect.top + event.clientY - start.pointerY, start.bounds.top), start.bounds.bottom - start.rect.height)
    setDragPosition({ x: start.x + (left - start.rect.left) / start.scaleX, y: start.y + (top - start.rect.top) / start.scaleY })
  }
  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragStartRef.current?.pointerId !== event.pointerId) return
    dragStartRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return <section ref={draggablePanelRef} className="club-support-chat" style={{ transform: `translate3d(${dragPosition.x}px, ${dragPosition.y}px, 0)` }} aria-label={`${conversation.title}聊天窗口`} role="region">
    <header className="chat-panel__header is-draggable" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><div className="chat-panel__identity"><AvatarMark initials={conversation.initials} size="md" /><div><h2>{conversation.title}</h2></div></div><button type="button" className="windows-icon-button" onClick={onClose} aria-label={`关闭与${conversation.title}的聊天`}><X size={17} /></button></header>
    <div className="chat-message-list" ref={messagesRef} aria-live="polite">{conversation.messages.map((message) => <ChatMessage key={message.id} message={message} selfId={conversation.self?.id} onReviewChange={(rating, submitted) => onReview(message.id, rating, submitted)} playing={playingMessage === message.id} onTogglePlay={() => setPlayingMessage(playingMessage === message.id ? null : message.id)} />)}</div>
    <div className="chat-composer">
      {conversation.supportAction && <div className="chat-support-actions"><button type="button" className="client-button client-button--secondary client-button--small" onClick={() => { if (conversation.supportAction === 'order') { setSelectedOrderId(''); setOrderDialogOpen(true) } else onSendOrder() }}>{conversation.supportAction === 'order' ? <ReceiptText size={15} /> : <Star size={15} />}{conversation.supportAction === 'order' ? '发送订单' : '评价'}</button></div>}
      {replyTarget && <ReplyPreview message={replyTarget} onCancel={() => setReplyTarget(null)} />}
      {quickRepliesOpen && <QuickReplyMenu className="chat-quick-replies" onSelect={sendQuickReply} />}
      {voiceRecordingOpen && <VoiceRecordingPanel onCancel={() => setVoiceRecordingOpen(false)} onSendVoice={(duration) => { onSend('voice', '语音消息', duration, replyTarget ? replySnapshot(replyTarget) : undefined); setReplyTarget(null); setVoiceRecordingOpen(false) }} onTranscribe={() => { setDraft((value) => `${value}${value ? '\n' : ''}这是一段语音转文字示例。`); setVoiceRecordingOpen(false) }} />}
      {emojiOpen && <div className="emoji-picker" role="group" aria-label="选择表情">{['😀', '😊', '😂', '👍', '🎮', '🎉', '❤️', '🙌'].map((emoji) => <button type="button" key={emoji} onClick={() => { onSend('emoji', emoji); setEmojiOpen(false) }} aria-label={`发送${emoji}`}>{emoji}</button>)}</div>}
      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleEnter} placeholder={`发送消息给 ${conversation.title}…`} aria-label={`发送给${conversation.title}的消息内容`} />
      <div className="chat-composer__toolbar"><div className="chat-composer__tools"><button type="button" className="windows-icon-button" aria-label="表情" aria-expanded={emojiOpen} onClick={() => { setQuickRepliesOpen(false); setEmojiOpen((value) => !value) }}><Smile size={18} /></button><button type="button" className="windows-icon-button" aria-label="发送示例图片" title="发送示例图片" onClick={() => onSend('image', '战绩截图 · 示例图片')}><ImagePlus size={18} /></button><button type="button" className="windows-icon-button" aria-label="录制语音" title="录制语音" aria-expanded={voiceRecordingOpen} onClick={() => { setEmojiOpen(false); setQuickRepliesOpen(false); setVoiceRecordingOpen(true) }}><Mic size={18} /></button><button type="button" className="windows-icon-button" aria-label="快捷回复" title="快捷回复" aria-expanded={quickRepliesOpen} onClick={() => { setEmojiOpen(false); setQuickRepliesOpen((open) => !open) }}><MessageSquareText size={17} /></button></div><button type="button" className="client-button client-button--primary chat-send-button" onClick={submit} disabled={!draft.trim()}><Send size={15} />发送</button></div>
    </div>
    {orderDialogOpen && <DialogPanel overlayId="send-club-support-order" title="选择订单" width={460} className="chat-order-dialog" onClose={() => setOrderDialogOpen(false)} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setOrderDialogOpen(false)}>取消</button><button type="button" className="client-button client-button--primary" disabled={!orders.some((order) => order.id === selectedOrderId)} onClick={() => { const order = orders.find((item) => item.id === selectedOrderId); if (order) { onSendOrder(order); setOrderDialogOpen(false) } }}>发送订单</button></>}><div className="chat-order-options" role="radiogroup" aria-label="选择要发送的订单">{orders.length ? orders.map((order) => <label className={`chat-order-option${selectedOrderId === order.id ? ' is-selected' : ''}`} key={order.id}><input type="radio" name="club-support-order" value={order.id} checked={selectedOrderId === order.id} onChange={() => setSelectedOrderId(order.id)} /><span><strong>{order.gameName} · {order.serviceName}</strong><span><UserNameWithLevel name={order.companionName} identityId={order.companionId} /> · {order.duration} {order.durationUnit} · {order.amount} 钻石</span><small>{order.id}</small></span><span>{order.status}</span></label>) : <p>暂无订单</p>}</div></DialogPanel>}
  </section>
}

function RoomChatPanel({ messages, onSend, onRecallMessage, hidden = false, collapsed = false, onToggleCollapsed, onOpenProfile, onAvatarContextMenu, onOpenGift, members = [] }: { messages: SocialMessage[]; onRecallMessage: (messageId: string) => boolean; onSend: (kind: ChatMessageKind, content: string, duration?: number, replyTo?: SocialMessage['replyTo']) => boolean; hidden?: boolean; collapsed?: boolean; onToggleCollapsed?: () => void; onOpenProfile?: (memberId: string) => void; onAvatarContextMenu?: (event: ReactMouseEvent, member: VoiceMember) => void; onOpenGift: (anchor: HTMLButtonElement) => void; members?: VoiceMember[] }) {
  const [draft, setDraft] = useState('')
  const [playingMessage, setPlayingMessage] = useState<string | null>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false)
  const [replyTarget, setReplyTarget] = useState<SocialMessage | null>(null)
  const [contextMessage, setContextMessage] = useState<SocialMessage | null>(null)
  const [contextPoint, setContextPoint] = useState({ x: 0, y: 0 })
  const [reportTarget, setReportTarget] = useState<SocialMessage | null>(null)
  const [feedback, setFeedback] = useState('')
  const submitMessage = (kind: ChatMessageKind, content: string, duration?: number, replyTo?: SocialMessage['replyTo']) => {
    const sent = onSend(kind, content, duration, replyTo)
    setFeedback(sent ? '' : '手速太快了～让消息飞一会儿，稍等继续')
    return sent
  }
  const send = () => { if (draft.trim() && submitMessage('text', draft.trim(), undefined, replyTarget ? replySnapshot(replyTarget) : undefined)) { setDraft(''); setReplyTarget(null) } }
  const sendQuickReply = (text: string) => { if (submitMessage('text', text, undefined, replyTarget ? replySnapshot(replyTarget) : undefined)) { setReplyTarget(null); setQuickRepliesOpen(false) } }
  const enter = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }
  return <section className={`room-chat-panel${collapsed ? ' is-collapsed' : ''}`} aria-label="房间聊天" hidden={hidden}>
    <header><div><h2><MessageCircle size={16} />房间聊天</h2></div><button type="button" className="windows-icon-button" onClick={onToggleCollapsed} aria-label={collapsed ? "展开聊天面板" : "折叠聊天面板"} title={collapsed ? "展开聊天面板" : "折叠聊天面板"}>{collapsed ? <PanelRightOpen size={17} /> : <PanelRightClose size={17} />}</button></header>
    <div className="room-chat-panel__announcement" role="note">官方倡导绿色互动，请勿发布违法、低俗、暴力、广告等内容，禁止违规交易，违规者将被封禁帐号。</div>
    <div className="room-chat-panel__messages">{messages.map((message) => {
      if (message.systemNotice) return <div className="room-chat-system-notice" role="status" key={message.id}>{message.content}</div>
      const member = members.find((item) => item.id === message.senderId) ?? (message.senderId === currentSocialUser.id ? { ...currentSocialUser, role: 'member' as const, micOn: false, muted: false } : socialFriends.find((friend) => friend.id === message.senderId) ? { ...socialFriends.find((friend) => friend.id === message.senderId)!, role: 'member' as const, micOn: false, muted: false } : undefined)
      return <ChatMessage key={message.id} message={message} selfId={currentSocialUser.id} playing={playingMessage === message.id} onTogglePlay={() => setPlayingMessage(playingMessage === message.id ? null : message.id)} onAvatarClick={() => onOpenProfile?.(message.senderId)} onAvatarContextMenu={member && member.id !== currentSocialUser.id ? (event) => onAvatarContextMenu?.(event, member) : undefined} onContextMenu={(event) => openMessageMenu(event, message, setContextMessage, setContextPoint)} />
    })}</div>
    <div className="room-chat-composer">{replyTarget && <ReplyPreview message={replyTarget} onCancel={() => setReplyTarget(null)} />}{feedback && <div className="social-inline-feedback" role="status">{feedback}<button type="button" onClick={() => setFeedback('')} aria-label="关闭提示"><X size={14} /></button></div>}{quickRepliesOpen && <QuickReplyMenu className="room-quick-replies" onSelect={sendQuickReply} />}{emojiOpen && <div className="emoji-picker room-emoji-picker" role="group" aria-label="选择房间表情">{['😀', '😊', '😂', '👍', '🎮', '🎉', '❤️', '🙌'].map((emoji) => <button type="button" key={emoji} onClick={() => { if (submitMessage('emoji', emoji)) setEmojiOpen(false) }} aria-label={`发送${emoji}`}>{emoji}</button>)}</div>}<textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={enter} placeholder="发送房间消息…" aria-label="房间消息内容" /><div className="room-chat-composer__tools"><button type="button" className="windows-icon-button" aria-label="表情" aria-expanded={emojiOpen} onClick={() => { setQuickRepliesOpen(false); setEmojiOpen((value) => !value) }}><Smile size={16} /></button><button type="button" className="windows-icon-button" aria-label="发送示例图片" title="发送示例图片" onClick={() => submitMessage('image', '房间图片 · 示例图片')}><ImagePlus size={16} /></button><button type="button" className="windows-icon-button" aria-label="送礼" title="送礼" onClick={(event) => onOpenGift(event.currentTarget)}><Gift size={16} /></button><button type="button" className="windows-icon-button" aria-label="快捷回复" title="快捷回复" aria-expanded={quickRepliesOpen} onClick={() => { setEmojiOpen(false); setQuickRepliesOpen((open) => !open) }}><MessageSquareText size={15} /></button><button type="button" className="room-chat-send" aria-label="发送消息" onClick={send} disabled={!draft.trim()}><Send size={16} /></button></div></div>
    {contextMessage && <MessageContextMenu point={contextPoint} canRecall={contextMessage.senderId === currentSocialUser.id && !contextMessage.recalled} canReport={contextMessage.senderId !== currentSocialUser.id} onClose={() => setContextMessage(null)} onReply={() => { setReplyTarget(contextMessage); setContextMessage(null) }} onCopy={() => copyMessage(contextMessage, setFeedback, () => setContextMessage(null))} onRecall={() => { onRecallMessage(contextMessage.id); setContextMessage(null) }} onReport={() => { setReportTarget(contextMessage); setContextMessage(null) }} />}
    {reportTarget && <UserReportDialog overlayId="report-room-message" onClose={() => setReportTarget(null)} onSubmit={() => { setFeedback('举报已提交（仅演示）'); setReportTarget(null) }} />}
  </section>
}

function ChatMessage({ message, selfId = currentSocialUser.id, onReviewChange, playing, onTogglePlay, onAvatarClick, onAvatarContextMenu, onContextMenu }: { message: SocialMessage; selfId?: string; onReviewChange?: (rating: number, submitted: boolean) => void; playing: boolean; onTogglePlay: () => void; onAvatarClick?: () => void; onAvatarContextMenu?: (event: ReactMouseEvent<HTMLButtonElement>) => void; onContextMenu?: (event: ReactMouseEvent<HTMLElement>) => void }) {
  const isSelf = message.senderId === selfId
  return <article className={`social-message${isSelf ? ' is-self' : ''}${message.recalled ? ' is-recalled' : ''}`} onContextMenu={message.recalled ? undefined : onContextMenu}>
    <button type="button" className="social-message__avatar" onClick={onAvatarClick} onContextMenu={(event) => { if (onAvatarContextMenu) { event.preventDefault(); event.stopPropagation(); onAvatarContextMenu(event) } }} disabled={!onAvatarClick} aria-label={`查看${message.senderName}陪玩详情`}><AvatarMark initials={message.initials} size="sm" /></button>
    <div className="social-message__body"><div className="social-message__meta"><strong><UserNameWithLevel name={message.senderName} identityId={message.senderId} /></strong><time>{message.time}</time></div>
      {!message.recalled && message.replyTo && <div className="social-message__reply"><strong>回复 <UserNameWithLevel name={message.replyTo.senderName} identityId={message.replyTo.senderName} /></strong><span>{message.replyTo.kind === 'image' ? '[图片]' : message.replyTo.kind === 'voice' ? '[语音消息]' : message.replyTo.content}</span></div>}
      {!message.recalled && message.kind === 'companion-share' && message.companionShare && <a className="social-message-card companion-share-message" href={`#page=talents&club=${message.companionShare.clubId}&companion=${message.companionShare.id}`} aria-label={`查看${message.companionShare.name}陪玩详情`}><header><AvatarMark initials={message.companionShare.initials} size="sm" /><strong><UserNameWithLevel name={message.companionShare.name} identityId={message.companionShare.id} /></strong></header><div className="social-message-card__content"><span className="companion-share-message__facts" aria-label={`${message.companionShare.gender}，${message.companionShare.age}岁`}>{message.companionShare.gender === '女' ? '♀' : '♂'}{message.companionShare.age}</span><p>{message.companionShare.intro}</p></div></a>}
      {message.kind === 'order' && message.order && <div className="social-message-card" aria-label="订单消息"><header><ReceiptText size={17} /><strong>订单信息</strong><span>{message.order.status}</span></header><div className="social-message-card__content"><strong>{message.order.service}</strong><p>{message.order.companion} · {message.order.duration}</p><b>{message.order.amount} 钻石</b></div><footer>订单号 {message.order.id}</footer></div>}
      {message.kind === 'support-review' && message.review && <div className="social-message-card" aria-label="客服评价消息"><header><Star size={17} /><strong>客服评价</strong>{message.review.submitted && <span>已评价</span>}</header><div className="social-message-card__content"><strong>{message.review.support}</strong><div className="social-message-card__stars" role="group" aria-label="客服评分">{Array.from({ length: 5 }, (_, index) => <button type="button" key={index} disabled={message.review!.submitted || !onReviewChange} aria-label={`${index + 1} 星`} aria-pressed={index < message.review!.rating} onClick={() => onReviewChange?.(index + 1, false)}><Star size={22} fill={index < message.review!.rating ? 'currentColor' : 'none'} /></button>)}{message.review.rating > 0 && <span>{message.review.rating} 分</span>}</div>{message.review.submitted ? <p role="status">评价完成，感谢您的反馈</p> : message.review.rating > 0 && <button type="button" className="client-button client-button--primary" onClick={() => onReviewChange?.(message.review!.rating, true)}>确认评价</button>}</div></div>}
      {message.recalled ? <p className="social-message__text social-message__text--recalled" role="status">消息已撤回</p> : message.kind === 'text'  && <p className="social-message__text">{message.content}</p>}
      {message.kind === 'emoji' && <p className="social-message__emoji" aria-label="表情消息">{message.content}</p>}
      {message.kind === 'image' && <div className="social-message__image"><ImagePlus size={20} /><span>{message.content}</span></div>}
      {message.kind === 'voice' && <button type="button" className="social-message__voice" onClick={onTogglePlay} aria-label={`${playing ? '暂停' : '播放'}语音消息`}><span>{playing ? <VolumeX size={16} /> : <Play size={15} />}</span><i className={playing ? 'is-playing' : ''} /><b>{message.duration ?? 5}″</b><small>{playing ? '播放中' : '语音消息'}</small></button>}
    </div>
  </article>
}

function openMessageMenu(event: ReactMouseEvent<HTMLElement>, message: SocialMessage, setMessage: (message: SocialMessage | null) => void, setPoint: (point: { x: number; y: number }) => void) {
  event.preventDefault()
  setPoint(getMessageMenuPoint(event))
  setMessage(message)
}

function getMessageMenuPoint(event: ReactMouseEvent<HTMLElement>, menuWidth = 176, menuHeight = 174) {
  let fixedContainer: HTMLElement | null = event.currentTarget
  while (fixedContainer) {
    const style = window.getComputedStyle(fixedContainer)
    if (style.transform !== 'none' || style.perspective !== 'none' || style.filter !== 'none' || style.contain.includes('paint')) break
    fixedContainer = fixedContainer.parentElement
  }
  const bounds = fixedContainer?.getBoundingClientRect()
  const scaleX = bounds && fixedContainer ? bounds.width / fixedContainer.offsetWidth || 1 : 1
  const scaleY = bounds && fixedContainer ? bounds.height / fixedContainer.offsetHeight || 1 : 1
  const localX = bounds ? (event.clientX - bounds.left) / scaleX : event.clientX
  const localY = bounds ? (event.clientY - bounds.top) / scaleY : event.clientY
  const width = fixedContainer?.offsetWidth ?? window.innerWidth
  const height = fixedContainer?.offsetHeight ?? window.innerHeight
  return { x: Math.max(8, Math.min(localX, width - menuWidth)), y: Math.max(8, Math.min(localY, height - menuHeight)) }
}

function replySnapshot(message: SocialMessage): NonNullable<SocialMessage['replyTo']> {
  return { senderName: message.senderName, content: message.content, kind: message.kind }
}

async function copyMessage(message: SocialMessage, setFeedback: (value: string) => void, close: () => void) {
  try {
    await navigator.clipboard.writeText(message.content)
    setFeedback('消息内容已复制')
  } catch {
    setFeedback('当前环境无法访问剪贴板')
  }
  close()
}

function ReplyPreview({ message, onCancel }: { message: SocialMessage; onCancel: () => void }) {
  const preview = message.kind === 'image' ? '[图片]' : message.kind === 'voice' ? '[语音消息]' : message.content
  return <div className="message-reply-preview"><div><strong>回复 <UserNameWithLevel name={message.senderName} identityId={message.senderName} /></strong><span>{preview}</span></div><button type="button" aria-label="取消回复" onClick={onCancel}><X size={15} /></button></div>
}

function MessageContextMenu({ point, canRecall = false, canReport = true, onClose, onReply, onCopy, onRecall, onReport }: { point: { x: number; y: number }; canRecall?: boolean; canReport?: boolean; onClose: () => void; onReply: () => void; onCopy: () => void; onRecall?: () => void; onReport: () => void }) {
  return <><button type="button" className="message-context-backdrop" aria-label="关闭消息菜单" onClick={onClose} /><div className="message-context-menu" role="menu" style={{ left: point.x, top: point.y }} onContextMenu={(event) => event.preventDefault()}>
    <button type="button" role="menuitem" onClick={onReply}><Reply size={15} />回复</button>
    <button type="button" role="menuitem" onClick={onCopy}><Clipboard size={15} />复制</button>
    {canRecall && onRecall && <button type="button" role="menuitem" onClick={onRecall}><Undo2 size={15} />撤回</button>}
    {canReport && <><span className="message-context-menu__divider" /><button type="button" role="menuitem" className="is-danger" onClick={onReport}><Flag size={15} />举报</button></>}
  </div></>
}

function ConversationContextMenu({ conversation, point, onClose, onAction }: { conversation: NonNullable<SocialLogic['selectedConversation']>; point: { x: number; y: number }; onClose: () => void; onAction: (action: ConversationActionType) => void }) {
  return <><button type="button" className="message-context-backdrop" aria-label="关闭会话菜单" onClick={onClose} /><div className="message-context-menu conversation-context-menu" role="menu" aria-label={`${conversation.title}会话操作`} style={{ left: point.x, top: point.y }} onContextMenu={(event) => event.preventDefault()}>
    <button type="button" role="menuitem" onClick={() => onAction('pin')}><Pin size={15} />{conversation.pinned ? '取消置顶' : '置顶'}</button>
    <button type="button" role="menuitem" onClick={() => onAction('read')}><CheckCheck size={15} />标为已读</button>
    <span className="message-context-menu__divider" />
    <button type="button" role="menuitem" onClick={() => onAction('clear')}><Eraser size={15} />清空消息</button>
    <button type="button" role="menuitem" className="is-danger" onClick={() => onAction('delete')}><Trash2 size={15} />删除聊天</button>
  </div></>
}

function messagePreview(message: SocialMessage) {
  if (message.kind === 'image') return '[图片]'
  if (message.kind === 'voice') return '[语音消息]'
  return message.content
}

function roleLabel(role: Exclude<VoiceRole, 'member'>) {
  if (role === 'owner') return '房主'
  return '管理员'
}
