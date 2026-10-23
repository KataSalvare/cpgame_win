import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react'
import {
  Check, ChevronDown, ChevronRight, Circle, Clipboard, Flag, Globe2, Headphones,
  ImagePlus, LockKeyhole, MessageCircle, Mic, MicOff, MonitorUp, MoreHorizontal, Music2, Pencil,
  PhoneOff, Play, Plus, Reply, Search, Send, SlidersHorizontal, Smile, Trash2, UserPlus, Users,
  Volume2, VolumeX, X,
} from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import { currentSocialUser, MAX_VOICE_CHANNEL_MEMBERS, socialFriends, type ChatMessageKind, type SocialMessage, type VoiceMember, type VoiceRole, type VoiceRoom, type VoiceSubchannel } from '../data/socialMockData'
import { companions } from '../data/mockData'
import { PageStatePanel } from '../components/PageStatePanel'
import type { useSocialLogic } from '../hooks/useSocialLogic'
import { AvatarMark } from '../components/AvatarMark'
import { CompanionProfileCard } from '../components/CompanionProfileCard'
import type { ProfileCardData } from '../components/profileCardData'
import { CompanionDetailPage } from './CompanionDetailPage'
import '../social.css'

type SocialLogic = ReturnType<typeof useSocialLogic>
type VoiceMemberAction = 'mute' | 'remove' | 'block' | 'role'
type VoiceMode = '自由模式' | '主持人模式' | '麦序模式'
type PageState = 'normal' | 'loading' | 'empty' | 'error'
type PageStateProps = { pageState: PageState; onRetry: () => void }

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

export function MessagesPage({ logic, pageState, onRetry, onOrder }: PageStateProps & { logic: SocialLogic; onOrder: (serviceId: string, companionId: string) => void }) {
  const [kindFilter, setKindFilter] = useState<'all' | 'direct' | 'group'>('all')
  const [groupDialog, setGroupDialog] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupMembers, setGroupMembers] = useState<string[]>([])
  const [groupInviteOpen, setGroupInviteOpen] = useState(false)
  const [groupInvitees, setGroupInvitees] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [playingMessage, setPlayingMessage] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false)
  const [replyTarget, setReplyTarget] = useState<SocialMessage | null>(null)
  const [contextMessage, setContextMessage] = useState<SocialMessage | null>(null)
  const [contextPoint, setContextPoint] = useState({ x: 0, y: 0 })
  const [reportTarget, setReportTarget] = useState<SocialMessage | null>(null)
  const [reportReason, setReportReason] = useState('骚扰或辱骂')

  if (pageState !== 'normal') return <NonNormalPageState pageState={pageState} onRetry={onRetry} />

  const conversation = logic.selectedConversation
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
  const sendText = () => {
    if (!draft.trim()) return
    logic.sendChatMessage('text', draft.trim(), undefined, replyTarget ? replySnapshot(replyTarget) : undefined)
    setDraft('')
    setReplyTarget(null)
    setEmojiOpen(false)
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

  return <div className="social-page messages-page">
    <div className={`messages-layout${logic.selectedProfile || (groupSettingsOpen && conversation?.kind === 'group') ? ' messages-layout--profile-open' : ''}`}>
      <aside className="messages-list-panel" aria-label="会话和好友">
        <div className="social-segmented" role="tablist" aria-label="消息内容">
          <button type="button" role="tab" aria-selected={logic.activeMessagesTab === 'messages'} className={logic.activeMessagesTab === 'messages' ? 'is-active' : ''} onClick={() => { logic.setActiveMessagesTab('messages'); logic.setSelectedFriendId(null) }}>会话{logic.totalUnread > 0 && <span className="social-unread-count">{logic.totalUnread}</span>}</button>
          <button type="button" role="tab" aria-selected={logic.activeMessagesTab === 'friends'} className={logic.activeMessagesTab === 'friends' ? 'is-active' : ''} onClick={() => { logic.setActiveMessagesTab('friends'); setGroupSettingsOpen(false) }}>好友</button>
        </div>
        <label className="social-search"><Search size={16} /><input value={logic.chatSearch} onChange={(event) => logic.setChatSearch(event.target.value)} placeholder={logic.activeMessagesTab === 'friends' ? '搜索好友' : '搜索会话'} aria-label={logic.activeMessagesTab === 'friends' ? '搜索好友' : '搜索会话'} /></label>
        {logic.activeMessagesTab === 'messages' ? <>
          <div className="conversation-filter" aria-label="会话类型">
            {(['all', 'direct', 'group'] as const).map((filter) => <button type="button" key={filter} className={kindFilter === filter ? 'is-active' : ''} onClick={() => setKindFilter(filter)}>{filter === 'all' ? '全部' : filter === 'direct' ? '私聊' : '群聊'}</button>)}
          </div>
          {kindFilter === 'group' && <button type="button" className="conversation-create-group" onClick={() => { setGroupDialog(true); setFeedback('') }}><Users size={15} />创建群聊</button>}
          <div className="conversation-list">
            {filteredConversations.map((item) => {
              const last = item.messages[item.messages.length - 1]
              return <button type="button" className={`conversation-row${conversation?.id === item.id ? ' is-active' : ''}`} key={item.id} onClick={() => { logic.openConversation(item); logic.setSelectedProfileId(null); if (item.kind !== 'group') setGroupSettingsOpen(false) }}>
                <AvatarMark initials={item.initials} size="md" />
                <span className="conversation-row__copy"><strong>{item.title}</strong><small>{last ? messagePreview(last) : '开始一段新对话'}</small></span>
                <span className="conversation-row__meta"><small>{last?.time}</small>{item.unread > 0 && <span className="social-unread-count">{item.unread}</span>}</span>
              </button>
            })}
            {filteredConversations.length === 0 && <div className="social-empty-inline">没有匹配的会话</div>}
          </div>
        </> : <div className="social-friend-list">
          <div className="social-list-caption">好友 · {logic.visibleFriends.length}</div>
          {logic.visibleFriends.map((friend) => <div className={`social-friend-row${logic.selectedFriendId === friend.id ? ' is-active' : ''}`} key={friend.id}>
            <button type="button" className="social-friend-identity" onClick={() => { logic.startDirectMessage(friend.id); logic.setSelectedProfileId(friend.id); setGroupSettingsOpen(false) }} aria-label={`打开与${friend.name}的聊天和资料`}><span className="social-avatar-wrap"><AvatarMark initials={friend.initials} size="md" /><i className={friend.online ? 'is-online' : ''} /></span><span><strong>{friend.name}</strong><small>{friend.status}</small></span></button>
            <button type="button" className="windows-icon-button" aria-label={`查看${friend.name}资料`} onClick={() => showFriendProfile(friend.id)}><MoreHorizontal size={18} /></button>
          </div>)}
        </div>}
      </aside>

      {logic.activeMessagesTab === 'friends' ? logic.selectedFriend ? <FriendPreview
        friend={logic.selectedFriend}
        onMessage={() => logic.startDirectMessage(logic.selectedFriend!.id)}
        onOpenProfile={() => showFriendProfile(logic.selectedFriend!.id)}
      /> : <section className="chat-empty-state"><Users size={28} /><h2>选择一位好友</h2><p>打开好友资料，或直接发起私聊。</p></section> : conversation ? <section className="chat-panel" aria-label={`${conversation.title}聊天`}>
        <header className="chat-panel__header">
          <div className="chat-panel__identity">
            <button type="button" className="chat-avatar-trigger" aria-expanded={conversation.kind === 'group' ? groupSettingsOpen : Boolean(logic.selectedProfile)} onClick={() => conversation.kind === 'direct' ? showFriendProfile(conversation.members[0]) : openGroupSettings()} aria-label={conversation.kind === 'group' ? `打开${conversation.title}群设置` : `查看${conversation.title}资料`}><AvatarMark initials={conversation.initials} size="md" /></button>
            <div><h2>{conversation.title}</h2><small>{conversation.kind === 'group' ? `${conversation.members.length + 1} 位成员` : '好友 · 资料卡可从头像打开'}</small></div>
          </div>
          {conversation.kind === 'group' && <div className="chat-member-stack" aria-label="群成员">
            {conversation.members.slice(0, 4).map((id) => {
              const friend = socialFriends.find((item) => item.id === id)
              return friend ? <button type="button" key={id} onClick={() => showFriendProfile(id)} aria-label={`查看${friend.name}资料`}><AvatarMark initials={friend.initials} size="sm" /></button> : null
            })}
            <button type="button" className="chat-add-member" onClick={() => { setGroupInviteOpen(true); setFeedback('') }} aria-label="邀请群成员"><UserPlus size={16} /></button>
          </div>}
        </header>
        <div className="chat-message-list" aria-live="polite">
          <div className="chat-history-note">以下是最近的聊天记录</div>
          {conversation.messages.map((message) => <ChatMessage key={message.id} message={message} playing={playingMessage === message.id} onTogglePlay={() => setPlayingMessage(playingMessage === message.id ? null : message.id)} onAvatarClick={() => message.senderId !== currentSocialUser.id && showFriendProfile(message.senderId)} onContextMenu={(event) => openMessageMenu(event, message, setContextMessage, setContextPoint)} />)}
        </div>
        <div className="chat-composer">
          {replyTarget && <ReplyPreview message={replyTarget} onCancel={() => setReplyTarget(null)} />}
          {emojiOpen && <div className="emoji-picker" role="group" aria-label="选择表情">{['😀', '😊', '😂', '👍', '🎮', '🎉', '❤️', '🙌'].map((emoji) => <button type="button" key={emoji} onClick={() => logic.sendChatMessage('emoji', emoji)} aria-label={`发送${emoji}`}>{emoji}</button>)}</div>}
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleEnter} placeholder={`发送消息给 ${conversation.title}…`} aria-label="消息内容" />
          <div className="chat-composer__toolbar">
            <div className="chat-composer__tools">
              <button type="button" className="windows-icon-button" aria-label="表情" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((value) => !value)}><Smile size={18} /></button>
              <button type="button" className="windows-icon-button" aria-label="发送示例图片" onClick={() => logic.sendChatMessage('image', '战绩截图 · 示例图片')}><ImagePlus size={18} /></button>
              <button type="button" className="windows-icon-button" aria-label="发送示例语音" onClick={() => logic.sendChatMessage('voice', '语音消息', 6)}><Mic size={18} /></button>
            </div>
            <button type="button" className="client-button client-button--primary chat-send-button" onClick={sendText} disabled={!draft.trim()}><Send size={15} />发送</button>
          </div>
          {feedback && <div className="social-inline-feedback" role="status">{feedback}<button type="button" onClick={() => setFeedback('')} aria-label="关闭提示"><X size={14} /></button></div>}
        </div>
      </section> : <section className="chat-empty-state"><MessageCircle size={28} /><h2>选择一个会话</h2><p>从左侧会话或好友列表开始聊天。</p></section>}

      {selectedProfile && <aside className="social-profile-panel" aria-label={`${selectedProfile.name}资料`}>
        <header><h2>{selectedProfile.name}</h2><button type="button" className="windows-icon-button" aria-label="关闭资料" onClick={() => logic.setSelectedProfileId(null)}><X size={17} /></button></header>
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
          onToggleFollow={() => logic.toggleProfileFollow(linkedCompanion.id)}
          onBlock={() => logic.blockProfile(linkedCompanion.id)}
          onChat={selectedProfile.id === currentSocialUser.id ? undefined : () => logic.startDirectMessage(selectedProfile.id)}
        /> : selectedProfileCard ? <CompanionProfileCard profile={selectedProfileCard} /> : null}
      </aside>}
      {!logic.selectedProfile && groupSettingsOpen && conversation?.kind === 'group' && <GroupSettingsPanel
        key={conversation.id}
        conversation={conversation}
        onClose={() => setGroupSettingsOpen(false)}
        onInvite={() => { setGroupInviteOpen(true); setFeedback('') }}
        onRename={(name) => logic.renameGroup(conversation.id, name)}
        onOpenProfile={showFriendProfile}
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
    {contextMessage && <MessageContextMenu point={contextPoint} onClose={() => setContextMessage(null)} onReply={() => { setReplyTarget(contextMessage); setContextMessage(null) }} onCopy={() => copyMessage(contextMessage, setFeedback, () => setContextMessage(null))} onReport={() => { setReportTarget(contextMessage); setReportReason('骚扰或辱骂'); setContextMessage(null) }} />}
    {reportTarget && <DialogPanel overlayId="report-chat-message" title="举报消息" description={`举报来自「${reportTarget.senderName}」的消息。请选择举报原因。`} onClose={() => setReportTarget(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setReportTarget(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { setFeedback('举报已提交（仅演示）'); setReportTarget(null) }}>提交举报</button></>}><ReportReasons value={reportReason} onChange={setReportReason} /></DialogPanel>}
  </div>
}

function FriendPreview({ friend, onMessage, onOpenProfile }: { friend: (typeof socialFriends)[number]; onMessage: () => void; onOpenProfile: () => void }) {
  return <section className="friend-preview"><button type="button" className="friend-preview__avatar" onClick={onOpenProfile} aria-label={`查看${friend.name}资料`}><AvatarMark initials={friend.initials} size="lg" /></button><h2>{friend.name}</h2><span>{friend.status}</span><div className="friend-preview__actions"><button type="button" className="client-button client-button--primary" onClick={onMessage}><MessageCircle size={15} />发起私聊</button><button type="button" className="client-button client-button--secondary" onClick={onOpenProfile}>查看资料</button></div></section>
}

function GroupSettingsPanel({ conversation, onClose, onInvite, onRename, onOpenProfile }: {
  conversation: NonNullable<SocialLogic['selectedConversation']>
  onClose: () => void
  onInvite: () => void
  onRename: (name: string) => void
  onOpenProfile: (id: string) => void
}) {
  const [name, setName] = useState(conversation.title)
  const [isEditingName, setIsEditingName] = useState(false)
  const members = conversation.members.map((id) => socialFriends.find((friend) => friend.id === id)).filter((friend): friend is (typeof socialFriends)[number] => Boolean(friend))

  return <aside className="group-settings-panel" aria-label="群聊设置">
    <header><div><h2>群聊设置</h2><small>{conversation.members.length + 1} 位成员</small></div><button type="button" className="windows-icon-button" aria-label="关闭群聊设置" onClick={onClose}><X size={17} /></button></header>
    <section className="group-settings-identity">
      <AvatarMark initials={conversation.initials} size="lg" />
      {isEditingName ? <form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; onRename(name); setIsEditingName(false) }}>
        <input value={name} onChange={(event) => setName(event.target.value)} aria-label="群名称" maxLength={24} />
        <button type="submit" className="client-button client-button--primary client-button--small" disabled={!name.trim()}>保存</button>
        <button type="button" className="client-button client-button--secondary client-button--small" onClick={() => { setName(conversation.title); setIsEditingName(false) }}>取消</button>
      </form> : <div><h3>{conversation.title}</h3><button type="button" className="group-settings-edit-name" onClick={() => setIsEditingName(true)}><Pencil size={13} />修改群名称</button></div>}
    </section>
    <section className="group-settings-members" aria-label="群成员列表">
      <div className="group-settings-section-heading"><strong>群成员</strong><span>{conversation.members.length + 1}</span></div>
      <button type="button" className="group-settings-member" onClick={() => onOpenProfile(currentSocialUser.id)}><AvatarMark initials={currentSocialUser.initials} size="sm" /><span><strong>{currentSocialUser.name}（我）</strong><small>当前账号</small></span></button>
      {members.map((friend) => <button type="button" className="group-settings-member" key={friend.id} onClick={() => onOpenProfile(friend.id)}><AvatarMark initials={friend.initials} size="sm" /><span><strong>{friend.name}</strong><small>{friend.status}</small></span></button>)}
      <button type="button" className="group-settings-invite" onClick={onInvite}><UserPlus size={15} />邀请好友入群</button>
    </section>
  </aside>
}

function GroupCreateDialog({ name, members, onNameChange, onToggle, onClose, onSubmit }: { name: string; members: string[]; onNameChange: (value: string) => void; onToggle: (id: string) => void; onClose: () => void; onSubmit: () => void }) {
  return <DialogPanel overlayId="create-group" title="创建群聊" description="填写群名称并选择至少两位好友。" onClose={onClose} width={520} footer={<><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" onClick={onSubmit} disabled={!name.trim() || members.length < 2}>创建群聊</button></>}>
    <label className="social-form-field">群名称<input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="例如：周末开黑小队" maxLength={24} /></label>
    <div className="social-dialog-section-title">选择好友 <span>已选 {members.length} 位</span></div>
    <div className="social-select-friends">{socialFriends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={members.includes(friend.id)} onChange={() => onToggle(friend.id)} /><AvatarMark initials={friend.initials} size="sm" /><span><strong>{friend.name}</strong><small>{friend.status}</small></span></label>)}</div>
  </DialogPanel>
}

function GroupInviteDialog({ friends, selected, onToggle, onClose, onSubmit }: { friends: typeof socialFriends; selected: string[]; onToggle: (id: string) => void; onClose: () => void; onSubmit: () => void }) {
  return <DialogPanel overlayId="invite-group-members" title="邀请好友入群" description="选择要加入当前群聊的好友。" onClose={onClose} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" onClick={onSubmit} disabled={!selected.length}>邀请（{selected.length}）</button></>}>
    {friends.length ? <div className="social-select-friends">{friends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={selected.includes(friend.id)} onChange={() => onToggle(friend.id)} /><AvatarMark initials={friend.initials} size="sm" /><span><strong>{friend.name}</strong><small>{friend.status}</small></span></label>)}</div> : <p className="social-dialog-copy">所有好友都已在群聊中。</p>}
  </DialogPanel>
}

export function VoiceRoomsPage({ logic, pageState, onRetry, onOrder }: PageStateProps & { logic: SocialLogic; onOrder: (serviceId: string, companionId: string) => void }) {
  const voicePageRef = useRef<HTMLDivElement>(null)
  const channelMenuRef = useRef<HTMLDivElement>(null)
  const memberMenuRef = useRef<HTMLDivElement>(null)
  const voiceModeMenuRef = useRef<HTMLDivElement>(null)
  const [roomDialog, setRoomDialog] = useState<'create' | 'edit' | null>(null)
  const [roomDialogTargetId, setRoomDialogTargetId] = useState<string | undefined>()
  const [roomName, setRoomName] = useState('')
  const [roomPrivacy, setRoomPrivacy] = useState<VoiceRoom['privacy']>('公开')
  const [channelDialog, setChannelDialog] = useState<{ mode: 'create' | 'edit'; id?: string; roomId?: string } | null>(null)
  const [channelName, setChannelName] = useState('')
  const [channelCapacity, setChannelCapacity] = useState(MAX_VOICE_CHANNEL_MEMBERS)
  const [channelPrivacy, setChannelPrivacy] = useState<VoiceSubchannel['privacy']>('公开')
  const [channelPassword, setChannelPassword] = useState('')
  const [inviteDialog, setInviteDialog] = useState(false)
  const [inviteTargetChannel, setInviteTargetChannel] = useState<{ roomName: string; channelName: string } | null>(null)
  const [invitees, setInvitees] = useState<string[]>([])
  const [deleteChannelId, setDeleteChannelId] = useState<string | null>(null)
  const [memberAction, setMemberAction] = useState<{ type: VoiceMemberAction; member: VoiceMember } | null>(null)
  const [memberContextMenu, setMemberContextMenu] = useState<{ member: VoiceMember; x: number; y: number; moveOpen: boolean } | null>(null)
  const [voiceProfileId, setVoiceProfileId] = useState<string | null>(null)
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [voiceModes, setVoiceModes] = useState<Record<string, VoiceMode>>({})
  const [voiceModeOpen, setVoiceModeOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [collapsedRoomIds, setCollapsedRoomIds] = useState<string[]>([])
  const [collapsedChannelIds, setCollapsedChannelIds] = useState<string[]>([])
  const [channelContextMenu, setChannelContextMenu] = useState<{ roomId: string; channelId: string; x: number; y: number; moveOpen: boolean } | null>(null)
  const [screenSharing, setScreenSharing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [ambienceOn, setAmbienceOn] = useState(false)
  const [micMode, setMicMode] = useState('语音感应')
  const [outputVolume, setOutputVolume] = useState(70)

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

  if (pageState !== 'normal') return <NonNormalPageState pageState={pageState} onRetry={onRetry} />

  const room = logic.activeVoiceRoom
  const channel = logic.activeSubchannel
  const members = channel?.members ?? []
  const voiceMode = channel ? voiceModes[channel.id] ?? '自由模式' : '自由模式'
  const normalizedMemberSearch = memberSearch.trim().toLocaleLowerCase()
  const filteredMembers = members.filter((member) => member.name.toLocaleLowerCase().includes(normalizedMemberSearch))
  const contextRoom = channelContextMenu ? logic.voiceRooms.find((item) => item.id === channelContextMenu.roomId) : undefined
  const contextChannel = contextRoom?.channels.find((item) => item.id === channelContextMenu?.channelId)
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
  const openCreateRoom = () => { setRoomName(''); setRoomPrivacy('公开'); setRoomDialogTargetId(undefined); setRoomDialog('create') }
  const openEditRoom = (targetRoom = room) => { if (!targetRoom) return; setRoomName(targetRoom.name); setRoomPrivacy(targetRoom.privacy); setRoomDialogTargetId(targetRoom.id); setRoomDialog('edit') }
  const saveRoom = () => {
    if (!roomName.trim()) return
    if (roomDialog === 'create') logic.createVoiceRoom(roomName)
    else logic.updateVoiceRoom(roomName, roomPrivacy, roomDialogTargetId)
    setRoomDialog(null)
  }
  const openChannelDialog = (mode: 'create' | 'edit', id?: string, roomId = room?.id) => {
    const targetRoom = logic.voiceRooms.find((item) => item.id === roomId)
    if (mode === 'create' && targetRoom) logic.selectVoiceRoom(targetRoom.id)
    const targetChannel = mode === 'edit' ? targetRoom?.channels.find((item) => item.id === id) : undefined
    setChannelName(targetChannel?.name ?? '')
    setChannelCapacity(targetChannel?.capacity ?? MAX_VOICE_CHANNEL_MEMBERS)
    setChannelPrivacy(targetChannel?.privacy ?? '公开')
    setChannelPassword(targetChannel?.password ?? '')
    setChannelDialog({ mode, id, roomId })
  }
  const saveChannel = () => {
    if (!channelName.trim() || !channelDialog) return
    const editingChannel = channelDialog.mode === 'edit'
      ? logic.voiceRooms.find((item) => item.id === channelDialog.roomId)?.channels.find((item) => item.id === channelDialog.id)
      : undefined
    if (channelCapacity < Math.max(1, editingChannel?.members.length ?? 1) || channelCapacity > MAX_VOICE_CHANNEL_MEMBERS) return
    const details = { name: channelName, capacity: channelCapacity, privacy: channelPrivacy, password: channelPassword }
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
    setFeedback('已将成员移动到目标子频道。')
    logic.setDraggedMemberId(null)
  }
  const toggleRole = (member: VoiceMember) => setMemberAction({ type: 'role', member })
  const memberActionLabel = !memberAction ? '' : memberAction.type === 'mute'
    ? memberAction.member.muted ? '解除禁言' : '禁言'
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
    setMemberContextMenu({ member, x: (event.clientX - bounds.left) / scale, y: (event.clientY - bounds.top) / scale, moveOpen: false })
  }

  const moveMemberToRoom = (targetRoomId: string, targetChannelId: string) => {
    if (!memberContextMenu) return
    const targetRoom = logic.voiceRooms.find((item) => item.id === targetRoomId)
    const targetChannel = targetRoom?.channels.find((item) => item.id === targetChannelId)
    const member = memberContextMenu.member
    const moved = logic.moveVoiceMember(member.id, targetRoomId, targetChannelId)
    setFeedback(moved && targetRoom && targetChannel
      ? `已将「${member.name}」移动到「${targetRoom.name} · ${targetChannel.name}」。`
      : '目标频道剩余人数不足，无法移动成员。')
    setMemberContextMenu(null)
  }

  const openChannelContextMenu = (event: ReactMouseEvent, roomId: string, channelId: string) => {
    event.preventDefault()
    event.stopPropagation()
    const root = voicePageRef.current
    if (!root) return
    const bounds = root.getBoundingClientRect()
    const scale = bounds.width / root.clientWidth || 1
    setChannelContextMenu({ roomId, channelId, x: (event.clientX - bounds.left) / scale, y: (event.clientY - bounds.top) / scale, moveOpen: false })
  }

  const collapseAllVoiceChannels = () => {
    setCollapsedRoomIds(logic.voiceRooms.map((item) => item.id))
    setCollapsedChannelIds(logic.voiceRooms.flatMap((item) => item.channels.map((subchannel) => subchannel.id)))
    setChannelContextMenu(null)
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

  const moveChannelMembers = (targetChannelId: string) => {
    if (!contextRoom || !contextChannel) return
    const movingIds = contextChannel.members.map((member) => member.id)
    const movedCount = logic.moveMembers(contextRoom.id, movingIds, targetChannelId)
    if (movingIds.includes(currentSocialUser.id)) logic.selectVoiceSubchannel(contextRoom.id, targetChannelId)
    setFeedback(movedCount ? `已将 ${movedCount} 位成员移动到其他子频道。` : '目标频道剩余人数不足。')
    setChannelContextMenu(null)
  }

  return <div className="social-page voice-page" ref={voicePageRef}>
    <div className="voice-workspace">
      <aside className="voice-room-tree" aria-label="语音房与子频道">
        <label className="social-search"><Search size={16} /><input value={logic.roomSearch} onChange={(event) => logic.setRoomSearch(event.target.value)} placeholder="搜索语音房" aria-label="搜索语音房" /></label>
        <button type="button" className="voice-invite-entry" onClick={() => room && openInviteForChannel(room.name, channel?.name ?? '主频道')} disabled={!room}><UserPlus size={15} />邀请好友{logic.voiceInvitations.length > 0 && <span className="social-unread-count">{logic.voiceInvitations.length}</span>}</button>
        {logic.voiceInvitations.length > 0 && <section className="voice-invites-section">
          <div className="voice-tree-section-title"><span>房间邀请</span><span className="social-unread-count">{logic.voiceInvitations.length}</span></div>
          {logic.voiceInvitations.map((invite) => <div className="voice-invite-card" key={invite.id}><div><strong>{invite.roomName}</strong><small>{invite.inviter} 邀请你 · {invite.time}</small></div><div className="voice-invite-card__actions"><button type="button" onClick={() => logic.ignoreVoiceInvitation(invite.id)}>忽略</button><button type="button" onClick={() => logic.acceptVoiceInvitation(invite)} aria-label={`接受加入${invite.roomName}`}><Check size={15} />加入</button></div></div>)}
        </section>}
        <div className="voice-tree-section-title"><span>语音分组</span><button type="button" className="voice-create-group-entry" onClick={openCreateRoom}><Plus size={14} />创建分组</button></div>
        <div className="voice-room-list">{logic.visibleVoiceRooms.map((item) => <section className={`voice-room-group${room?.id === item.id ? ' is-active' : ''}`} key={item.id}>
          <div className="voice-room-heading-row">
            <button type="button" className="voice-room-heading" aria-expanded={!collapsedRoomIds.includes(item.id)} onClick={() => { logic.selectVoiceRoom(item.id); setCollapsedRoomIds((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]) }}><ChevronRight size={14} className={`voice-room-chevron${collapsedRoomIds.includes(item.id) ? '' : ' is-expanded'}`} /><span>{item.privacy === '私密' ? <LockKeyhole size={15} /> : <Globe2 size={15} />}</span><strong>{item.name}</strong></button>
            {item.currentRole !== 'member' && <button type="button" className="voice-create-child-channel" aria-label={`在${item.name}创建子频道`} title="新增频道" onClick={() => openChannelDialog('create', undefined, item.id)}><Plus size={13} /></button>}
            {item.currentRole !== 'member' && <button type="button" className="windows-icon-button voice-tree-manage" aria-label={`编辑${item.name}分组`} title="编辑分组" onClick={() => openEditRoom(item)}><Pencil size={13} /></button>}
          </div>
          {!collapsedRoomIds.includes(item.id) && <div className="voice-subchannel-list">{item.channels.map((subchannel) => <div className={`voice-subchannel${channel?.id === subchannel.id && room?.id === item.id ? ' is-active' : ''}${logic.draggedMemberId && room?.id === item.id && logic.draggedMemberId !== currentSocialUser.id ? ' is-drop-target' : ''}`} key={subchannel.id} onContextMenu={(event) => openChannelContextMenu(event, item.id, subchannel.id)} onDragOver={(event) => { if (room?.id === item.id && canManage) event.preventDefault() }} onDrop={(event) => { event.preventDefault(); if (room?.id === item.id) onDropMember(subchannel.id) }}>
            <div className="voice-subchannel__heading-row">
              <button type="button" className="voice-subchannel__heading" onClick={() => logic.selectVoiceSubchannel(item.id, subchannel.id)}>{subchannel.privacy === '私密' ? <LockKeyhole size={14} /> : <Volume2 size={14} />}<span>{subchannel.name}</span><small>{subchannel.members.length}/{subchannel.capacity}</small></button>
              <div className="voice-subchannel__tools">
                <button type="button" className="voice-subchannel__action" aria-label={`邀请好友加入${item.name}的${subchannel.name}`} title="邀请好友" onClick={() => openInviteForChannel(item.name, subchannel.name)}><UserPlus size={13} /></button>
                {item.currentRole === 'owner' && <button type="button" className="voice-subchannel__action" aria-label={`编辑${subchannel.name}`} title="编辑频道" onClick={() => openChannelDialog('edit', subchannel.id, item.id)}><Pencil size={13} /></button>}
                <button type="button" className="voice-subchannel__collapse" aria-label={`${collapsedChannelIds.includes(subchannel.id) ? '展开' : '折叠'}${subchannel.name}成员`} aria-expanded={!collapsedChannelIds.includes(subchannel.id)} onClick={() => setCollapsedChannelIds((ids) => ids.includes(subchannel.id) ? ids.filter((id) => id !== subchannel.id) : [...ids, subchannel.id])}><ChevronRight size={13} className={`voice-room-chevron${collapsedChannelIds.includes(subchannel.id) ? '' : ' is-expanded'}`} /></button>
              </div>
            </div>
            {!collapsedChannelIds.includes(subchannel.id) && <div className="voice-channel-members">{subchannel.members.map((member) => <span className={`voice-channel-member${member.id === currentSocialUser.id ? ' is-self' : ''}`} data-voice-member-id={member.id} tabIndex={member.id === currentSocialUser.id ? -1 : undefined} key={member.id} draggable={room?.id === item.id && canManage && member.id !== currentSocialUser.id} onDragStart={() => logic.setDraggedMemberId(member.id)} onDragEnd={() => logic.setDraggedMemberId(null)} title={canManage ? '拖动到其他子频道' : member.name}><AvatarMark initials={member.initials} size="sm" /><span>{member.name}</span>{member.muted && <MicOff size={12} />}</span>)}</div>}
          </div>)}
        </div>}
        </section>)}
          {logic.visibleVoiceRooms.length === 0 && <div className="social-empty-inline">没有匹配的语音房</div>}
        </div>
        <section className="voice-device-panel" aria-label="语音设备控制">
          <div className="voice-device-panel__heading"><span><i className={`voice-status-dot${logic.isInVoice ? ' is-connected' : ''}`} />{room?.name ?? '未选择房间'}</span><button type="button" className="voice-leave-button" onClick={() => { logic.leaveVoice(); setFeedback('已离开语音房。') }} disabled={!logic.isInVoice} aria-label="退出房间" title="退出房间"><PhoneOff size={15} /></button></div>
          <div className="voice-quick-actions">
            <button type="button" className={`voice-quick-action voice-quick-action--share${screenSharing ? ' is-active' : ''}`} onClick={() => { setScreenSharing((value) => !value); setFeedback(screenSharing ? '已停止屏幕共享（仅演示）。' : '屏幕共享已开启（仅演示）。') }} disabled={!logic.isInVoice}><MonitorUp size={14} />屏幕共享</button>
            <button type="button" className={`voice-quick-action voice-quick-action--icon${recording ? ' is-active' : ''}`} onClick={() => { setRecording((value) => !value); setFeedback(recording ? '录音已停止（仅演示）。' : '录音已开始（仅演示）。') }} disabled={!logic.isInVoice} aria-label={recording ? '停止录音' : '录音'} title={recording ? '停止录音' : '录音'}><Circle size={15} />{recording && <i />}</button>
            <button type="button" className={`voice-quick-action voice-quick-action--icon${ambienceOn ? ' is-active' : ''}`} onClick={() => { setAmbienceOn((value) => !value); setFeedback(ambienceOn ? '氛围音已关闭（仅演示）。' : '氛围音已开启（仅演示）。') }} disabled={!logic.isInVoice} aria-label={ambienceOn ? '关闭氛围音' : '氛围音'} title={ambienceOn ? '关闭氛围音' : '氛围音'}><Music2 size={15} /></button>
          </div>
          <div className="voice-audio-controls">
            <label className="voice-mic-mode"><SlidersHorizontal size={14} /><select value={micMode} onChange={(event) => setMicMode(event.target.value)} aria-label="麦克风模式"><option>语音感应</option><option>按键说话</option><option>自由发言</option></select></label>
            <button type="button" className={`voice-audio-icon${logic.isInVoice && logic.isSelfMuted ? ' is-active' : ''}`} onClick={logic.toggleSelfMute} disabled={!logic.isInVoice} aria-label={logic.isSelfMuted ? '取消静音' : '静音'} title={logic.isSelfMuted ? '取消静音' : '静音'}>{logic.isSelfMuted ? <MicOff size={16} /> : <Mic size={16} />}</button>
            <label className="voice-volume-control"><Volume2 size={15} /><input type="range" min="0" max="100" value={outputVolume} onChange={(event) => setOutputVolume(Number(event.target.value))} aria-label="音量" /><span>{outputVolume}</span></label>
          </div>
          <div className="voice-device-panel__join"><span>{logic.isInVoice ? logic.isMicOn ? '麦克风已开启' : '当前在听' : '正在浏览房间'}</span><button type="button" onClick={logic.isInVoice ? logic.toggleMic : logic.joinVoice} disabled={!logic.isInVoice && members.length >= (channel?.capacity ?? MAX_VOICE_CHANNEL_MEMBERS)} aria-label={logic.isInVoice ? logic.isMicOn ? '下麦' : '上麦' : '加入语音'}>{logic.isInVoice ? logic.isMicOn ? <><MicOff size={14} />下麦</> : <><Mic size={14} />上麦</> : <><Headphones size={14} />加入语音</>}</button></div>
        </section>
      </aside>

      <section className="voice-stage" aria-label="语音房麦位">
        <header className="voice-stage__header">
          <div><div className="voice-stage__breadcrumbs"><span>{room?.name}</span><ChevronRight size={14} /><strong>{channel?.name}</strong></div><small>{members.length}/{channel?.capacity ?? MAX_VOICE_CHANNEL_MEMBERS} 人 · {channel?.privacy ?? room?.privacy}频道</small></div>
          <div className="voice-mode-control" ref={voiceModeMenuRef}>
            <button type="button" className="voice-mode-trigger" aria-haspopup="menu" aria-expanded={voiceModeOpen} onClick={() => setVoiceModeOpen((open) => !open)}><span>{voiceMode}</span><ChevronDown size={14} /></button>
            {voiceModeOpen && <div className="voice-mode-menu" role="menu" aria-label="选择频道模式">{(['自由模式', '主持人模式', '麦序模式'] as const).map((mode) => <button type="button" role="menuitemradio" aria-checked={voiceMode === mode} className={voiceMode === mode ? 'is-selected' : ''} key={mode} onClick={() => { if (channel) setVoiceModes((current) => ({ ...current, [channel.id]: mode })); setVoiceModeOpen(false) }}>{mode}{voiceMode === mode && <Check size={14} />}</button>)}</div>}
          </div>
        </header>
        <div className="voice-member-grid">{Array.from({ length: channel?.capacity ?? MAX_VOICE_CHANNEL_MEMBERS }, (_, index) => {
          const member = members[index]
          return <div className={`voice-seat${member ? ' is-occupied' : ''}${member?.micOn && !member.muted ? ' is-speaking' : ''}`} key={member?.id ?? `seat-${index}`}>
            {member ? <>
              <button type="button" className="voice-seat__avatar" aria-label={`${member.name}资料`}><AvatarMark initials={member.initials} size="lg" />{member.muted ? <span className="voice-seat__mic"><MicOff size={14} /></span> : member.micOn ? <span className="voice-seat__mic"><Mic size={14} /></span> : <span className="voice-seat__mic"><VolumeX size={14} /></span>}</button>
              <strong>{member.name}{member.id === currentSocialUser.id ? '（我）' : ''}</strong>
              <span className="voice-role-label">{roleLabel(member.role)}</span>
              {canManage && member.id !== currentSocialUser.id && <div className="voice-seat__management"><button type="button" onClick={() => setMemberAction({ type: 'mute', member })}>{member.muted ? '解除禁言' : '禁言'}</button><button type="button" onClick={() => setMemberAction({ type: 'remove', member })}>移出</button><button type="button" onClick={() => setMemberAction({ type: 'block', member })}>拉黑</button>{isOwner && member.role !== 'owner' && <button type="button" onClick={() => toggleRole(member)}>{member.role === 'admin' ? '撤销管理员' : '设为管理员'}</button>}</div>}
            </> : <><span className="voice-seat__empty"><Mic size={18} /></span><span>空麦位 {index + 1}</span></>}
          </div>
        })}</div>
        <footer className="voice-stage__footer"><button type="button" className="voice-members-entry" onClick={() => { setMemberSearch(''); setMembersDrawerOpen(true) }} aria-expanded={membersDrawerOpen} aria-controls="voice-members-drawer"><Users size={14} />全部成员<span>{members.length}</span></button></footer>
        {membersDrawerOpen && <>
          <button type="button" className="voice-members-backdrop" onClick={() => setMembersDrawerOpen(false)} aria-label="关闭全部成员面板" />
          <aside id="voice-members-drawer" className="voice-members-drawer" aria-label="频道全部成员">
            <header className="voice-members-drawer__header"><div><h2><Users size={16} />频道全部成员</h2><span>{members.length} 人</span></div><button type="button" className="windows-icon-button" onClick={() => setMembersDrawerOpen(false)} aria-label="关闭全部成员面板"><X size={17} /></button></header>
            <label className="voice-members-drawer__search"><Search size={15} /><input type="search" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="搜索当前频道成员" aria-label="搜索当前频道成员" /></label>
            <div className="voice-members-drawer__list">
              {filteredMembers.map((member) => <div className="voice-members-row" key={member.id} onContextMenu={(event) => openMemberContextMenu(event, member)}>
                <button type="button" className="voice-members-row__avatar" onClick={() => openMemberProfile(member.id)} onContextMenu={(event) => openMemberContextMenu(event, member)} aria-label={`查看${member.name}陪玩详情`}><AvatarMark initials={member.initials} size="sm" /></button>
                <button type="button" className="voice-members-row__name" onClick={() => openMemberProfile(member.id)} onContextMenu={(event) => openMemberContextMenu(event, member)}>{member.name}{member.id === currentSocialUser.id ? '（我）' : ''}</button>
                {member.role !== 'member' && <span className={`voice-members-row__role is-${member.role}`}>{roleLabel(member.role)}</span>}
                <span className="voice-members-row__mic" role="img" aria-label={member.muted || !member.micOn ? '麦克风已关闭' : '麦克风已开启'} title={member.muted || !member.micOn ? '麦克风已关闭' : '麦克风已开启'}>{member.muted || !member.micOn ? <MicOff size={14} /> : <Mic size={14} />}</span>
              </div>)}
              {!filteredMembers.length && <p className="voice-members-empty">{members.length ? '没有匹配的成员' : '当前频道暂无成员'}</p>}
            </div>
          </aside>
        </>}
      </section>

      <RoomChatPanel hidden={Boolean(selectedProfile)} messages={logic.roomMessages} onSend={(kind, text, duration, replyTo) => logic.sendRoomMessage(kind, text, duration, replyTo)} onOpenProfile={openMemberProfile} onAvatarContextMenu={openMemberContextMenu} members={room?.channels.flatMap((subchannel) => subchannel.members) ?? []} />
      {selectedProfile && <aside className="social-profile-panel voice-profile-panel" aria-label={`${selectedProfile.name}陪玩详情`}>
        <header><h2>{selectedProfile.name}</h2><button type="button" className="windows-icon-button" aria-label="关闭陪玩详情" onClick={() => setVoiceProfileId(null)}><X size={17} /></button></header>
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
          onToggleFollow={() => logic.toggleProfileFollow(linkedCompanion.id)}
          onBlock={() => logic.blockProfile(linkedCompanion.id)}
          onChat={() => logic.startDirectMessage(selectedProfile.id)}
        /> : selectedProfileCard ? <CompanionProfileCard profile={selectedProfileCard} /> : null}
      </aside>}
    </div>
    {feedback && <div className="social-toast" role="status">{feedback}<button type="button" className="windows-icon-button" onClick={() => setFeedback('')} aria-label="关闭通知"><X size={15} /></button></div>}

    {channelContextMenu && contextRoom && contextChannel && <div ref={channelMenuRef} className="voice-channel-context-menu" role="menu" aria-label={`${contextChannel.name}频道操作`} style={{ left: channelContextMenu.x, top: channelContextMenu.y }} onContextMenu={(event) => event.preventDefault()}>
      <button type="button" role="menuitem" onClick={() => { openInviteForChannel(contextRoom.name, contextChannel.name); setChannelContextMenu(null) }}><UserPlus size={15} />邀请</button>
      {contextRoom.currentRole !== 'member' && <>
        <button type="button" role="menuitem" className="has-submenu" aria-expanded={channelContextMenu.moveOpen} disabled={!contextChannel.members.length || !contextRoom.channels.some((item) => item.id !== contextChannel.id)} onClick={() => setChannelContextMenu((current) => current ? { ...current, moveOpen: !current.moveOpen } : null)}>批量移动用户至<ChevronRight size={14} /></button>
        {channelContextMenu.moveOpen && <div className="voice-channel-context-submenu" role="group" aria-label="选择目标子频道">{contextRoom.channels.filter((item) => item.id !== contextChannel.id).map((target) => {
          const fitsMembers = target.capacity - target.members.length >= contextChannel.members.length
          return <button type="button" key={target.id} disabled={!fitsMembers} title={fitsMembers ? `移动到${target.name}` : '目标频道剩余人数不足'} onClick={() => moveChannelMembers(target.id)}>{target.name}<small>{target.members.length}/{target.capacity}</small></button>
        })}</div>}
      </>}
      <button type="button" role="menuitemcheckbox" aria-checked={collapsedChannelIds.includes(contextChannel.id)} onClick={() => { setCollapsedChannelIds((ids) => ids.includes(contextChannel.id) ? ids.filter((id) => id !== contextChannel.id) : [...ids, contextChannel.id]); setChannelContextMenu(null) }}><span>收起该语音频道</span><i className={collapsedChannelIds.includes(contextChannel.id) ? 'is-checked' : ''} /></button>
      <button type="button" role="menuitem" onClick={collapseAllVoiceChannels}>收起所有频道</button>
      {contextRoom.currentRole === 'owner' && <>
        <div className="voice-channel-context-separator" />
        <button type="button" role="menuitem" onClick={() => { openChannelDialog('edit', contextChannel.id, contextRoom.id); setChannelPrivacy('私密'); setChannelContextMenu(null) }}><LockKeyhole size={15} />设置密码</button>
        <button type="button" role="menuitem" onClick={() => { openChannelDialog('edit', contextChannel.id, contextRoom.id); setChannelContextMenu(null) }}><Pencil size={15} />编辑频道</button>
        <div className="voice-channel-context-separator" />
        <button type="button" role="menuitem" className="is-danger" disabled={contextRoom.channels.length <= 1} onClick={() => { logic.selectVoiceRoom(contextRoom.id); setDeleteChannelId(contextChannel.id); setChannelContextMenu(null) }}><Trash2 size={15} />删除频道</button>
      </>}
      <div className="voice-channel-context-separator" />
      <button type="button" role="menuitem" onClick={locateMyVoicePosition}>定位我的位置</button>
    </div>}

    {roomDialog && <DialogPanel overlayId="voice-room-dialog" title={roomDialog === 'create' ? '创建语音分组' : '编辑房间设置'} description={roomDialog === 'create' ? '创建后默认为公开，并自动添加主频道。' : '设置房间名称与可见范围。'} onClose={() => setRoomDialog(null)} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setRoomDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveRoom} disabled={!roomName.trim()}>{roomDialog === 'create' ? '创建分组' : '保存设置'}</button></>}>
      <label className="social-form-field">房间名称<input value={roomName} onChange={(event) => setRoomName(event.target.value)} maxLength={24} placeholder="输入房间名称" /></label>
      {roomDialog === 'edit' && <fieldset className="voice-privacy-choice"><legend>房间权限</legend><label><input type="radio" name="roomPrivacy" checked={roomPrivacy === '公开'} onChange={() => setRoomPrivacy('公开')} /><Globe2 size={17} /><span><strong>公开房间</strong><small>好友和玩家都可以浏览并加入</small></span></label><label><input type="radio" name="roomPrivacy" checked={roomPrivacy === '私密'} onChange={() => setRoomPrivacy('私密')} /><LockKeyhole size={17} /><span><strong>私密房间</strong><small>仅通过邀请加入</small></span></label></fieldset>}
    </DialogPanel>}

    {memberContextMenu && <div ref={memberMenuRef} className="voice-channel-context-menu voice-member-context-menu" role="menu" aria-label={`${memberContextMenu.member.name}成员操作`} style={{ left: memberContextMenu.x, top: memberContextMenu.y }} onContextMenu={(event) => event.preventDefault()}>
      <div className="voice-member-context-menu__title"><AvatarMark initials={memberContextMenu.member.initials} size="sm" /><strong>{memberContextMenu.member.name}</strong></div>
      <button type="button" role="menuitem" disabled={!canManage || memberContextMenu.member.id === currentSocialUser.id} onClick={() => { setMemberAction({ type: 'mute', member: memberContextMenu.member }); setMemberContextMenu(null) }}><MicOff size={15} />{memberContextMenu.member.muted ? '解除禁言' : '静音'}</button>
      <button type="button" role="menuitem" disabled={!canManage || memberContextMenu.member.id === currentSocialUser.id} onClick={() => { setMemberAction({ type: 'remove', member: memberContextMenu.member }); setMemberContextMenu(null) }}><X size={15} />移出房间</button>
      <button type="button" role="menuitem" disabled={!canManage || memberContextMenu.member.id === currentSocialUser.id} onClick={() => { setMemberAction({ type: 'block', member: memberContextMenu.member }); setMemberContextMenu(null) }}><Flag size={15} />拉黑</button>
      {isOwner && memberContextMenu.member.id !== currentSocialUser.id && <button type="button" role="menuitem" onClick={() => { setMemberAction({ type: 'role', member: memberContextMenu.member }); setMemberContextMenu(null) }}><Users size={15} />{memberContextMenu.member.role === 'admin' ? '撤销管理员' : '设为管理员'}</button>}
      <div className="voice-channel-context-separator" />
      <button type="button" role="menuitem" className="has-submenu" aria-expanded={memberContextMenu.moveOpen} disabled={!canManage || memberContextMenu.member.id === currentSocialUser.id || !logic.voiceRooms.some((voiceRoom) => voiceRoom.id !== room?.id && voiceRoom.channels.length > 0)} onClick={() => setMemberContextMenu((current) => current ? { ...current, moveOpen: !current.moveOpen } : null)}>移动至其他房间<ChevronRight size={14} /></button>
      {memberContextMenu.moveOpen && <div className="voice-channel-context-submenu voice-member-context-submenu" role="group" aria-label="选择其他房间和频道">{logic.voiceRooms.filter((voiceRoom) => voiceRoom.id !== room?.id).flatMap((voiceRoom) => voiceRoom.channels.map((target) => {
        const alreadyJoined = target.members.some((member) => member.id === memberContextMenu.member.id)
        const alreadyInRoom = voiceRoom.channels.some((subchannel) => subchannel.members.some((member) => member.id === memberContextMenu.member.id))
        const alreadyInAnotherChannel = alreadyInRoom && !alreadyJoined
        const isFull = target.members.length >= target.capacity && !alreadyJoined
        return <button type="button" key={`${voiceRoom.id}-${target.id}`} disabled={isFull || alreadyInAnotherChannel} title={isFull ? '目标频道已满' : alreadyInAnotherChannel ? `成员已在${voiceRoom.name}的其他频道` : alreadyJoined ? `成员已在${voiceRoom.name} · ${target.name}，移动后将离开当前房间` : `移动至${voiceRoom.name} · ${target.name}`} onClick={() => moveMemberToRoom(voiceRoom.id, target.id)}><span>{voiceRoom.name} · {target.name}</span><small>{target.members.length}/{target.capacity}</small></button>
      }))}</div>}
    </div>}

    {channelDialog && <DialogPanel overlayId="voice-channel-dialog" title={channelDialog.mode === 'create' ? '创建子频道' : '编辑子频道'} description={channelDialog.mode === 'create' ? `将在「${logic.voiceRooms.find((item) => item.id === channelDialog.roomId)?.name ?? ''}」下创建。` : '调整频道名称、人数上限与访问设置。'} onClose={() => setChannelDialog(null)} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setChannelDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveChannel} disabled={!channelName.trim() || channelCapacity < Math.max(1, channelDialog.mode === 'edit' ? logic.voiceRooms.find((item) => item.id === channelDialog.roomId)?.channels.find((item) => item.id === channelDialog.id)?.members.length ?? 1 : 1) || channelCapacity > MAX_VOICE_CHANNEL_MEMBERS}>{channelDialog.mode === 'create' ? '创建子频道' : '保存'}</button></>}>
      <div className="voice-channel-form">
        <label className="social-form-field">频道名称<input value={channelName} onChange={(event) => setChannelName(event.target.value)} maxLength={20} placeholder="例如：战术讨论" /></label>
        <label className="social-form-field">人数上限<input type="number" min={1} max={MAX_VOICE_CHANNEL_MEMBERS} value={channelCapacity} onChange={(event) => setChannelCapacity(event.target.value === '' ? 0 : Number(event.target.value))} aria-label="人数上限" /><small>可设置 1–{MAX_VOICE_CHANNEL_MEMBERS} 人；不能低于当前频道人数。</small></label>
        <fieldset className="voice-privacy-choice"><legend>频道权限</legend><div className="voice-privacy-choice__options"><label><input type="radio" name="channelPrivacy" checked={channelPrivacy === '公开'} onChange={() => { setChannelPrivacy('公开'); setChannelPassword('') }} /><Globe2 size={17} /><span><strong>公开频道</strong><small>可在房间频道列表中浏览</small></span></label><label><input type="radio" name="channelPrivacy" checked={channelPrivacy === '私密'} onChange={() => setChannelPrivacy('私密')} /><LockKeyhole size={17} /><span><strong>私密频道</strong><small>可选设置进入密码</small></span></label></div></fieldset>
        {channelPrivacy === '私密' && <label className="social-form-field">频道密码<input type="password" value={channelPassword} onChange={(event) => setChannelPassword(event.target.value)} maxLength={32} placeholder="设置频道密码（可选）" autoComplete="new-password" /></label>}
      </div>
    </DialogPanel>}

    {deleteChannelId && <DialogPanel overlayId="delete-channel-dialog" title="删除子频道" description="删除后，该子频道成员将返回其他子频道。" onClose={() => setDeleteChannelId(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setDeleteChannelId(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { logic.deleteSubchannel(deleteChannelId); setDeleteChannelId(null) }} disabled={!canDeleteChannel}>删除子频道</button></>}><p className="social-dialog-copy">确定删除“{deletingChannel?.name}”吗？{!canDeleteChannel && ' 其他子频道剩余人数不足，请先调整人数上限或移出成员。'}</p></DialogPanel>}

    {memberAction && <DialogPanel overlayId="voice-member-action-dialog" title={`确认${memberActionLabel}`} description={memberAction.type === 'block' ? `拉黑「${memberAction.member.name}」后，对方会从语音房成员中移除。` : memberAction.type === 'remove' ? `确定将「${memberAction.member.name}」移出当前语音房吗？` : memberAction.type === 'role' ? memberAction.member.role === 'admin' ? `确定撤销「${memberAction.member.name}」的管理员身份吗？` : `确定将「${memberAction.member.name}」设为管理员吗？` : `确定${memberActionLabel}「${memberAction.member.name}」吗？`} onClose={() => setMemberAction(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setMemberAction(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={confirmMemberAction}>{`确认${memberActionLabel}`}</button></>}><p className="social-dialog-copy">此操作将立即更新房间成员状态。</p></DialogPanel>}

    {inviteDialog && <DialogPanel overlayId="invite-friends-dialog" title="邀请好友进入语音房" description={`邀请好友加入「${inviteTargetChannel?.roomName ?? room?.name ?? ''} · ${inviteTargetChannel?.channelName ?? channel?.name ?? ''}」。`} onClose={() => { setInviteDialog(false); setInviteTargetChannel(null) }} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => { setInviteDialog(false); setInviteTargetChannel(null) }}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveInvites} disabled={!invitees.length}>发送邀请（{invitees.length}）</button></>}>
      <div className="social-select-friends">{socialFriends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={invitees.includes(friend.id)} onChange={() => toggleInvitee(friend.id)} /><AvatarMark initials={friend.initials} size="sm" /><span><strong>{friend.name}</strong><small>{friend.status}</small></span></label>)}</div>
    </DialogPanel>}
  </div>
}

function RoomChatPanel({ messages, onSend, hidden = false, onOpenProfile, onAvatarContextMenu, members = [] }: { messages: SocialMessage[]; onSend: (kind: ChatMessageKind, content: string, duration?: number, replyTo?: SocialMessage['replyTo']) => void; hidden?: boolean; onOpenProfile?: (memberId: string) => void; onAvatarContextMenu?: (event: ReactMouseEvent, member: VoiceMember) => void; members?: VoiceMember[] }) {
  const [draft, setDraft] = useState('')
  const [playingMessage, setPlayingMessage] = useState<string | null>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [replyTarget, setReplyTarget] = useState<SocialMessage | null>(null)
  const [contextMessage, setContextMessage] = useState<SocialMessage | null>(null)
  const [contextPoint, setContextPoint] = useState({ x: 0, y: 0 })
  const [reportTarget, setReportTarget] = useState<SocialMessage | null>(null)
  const [reportReason, setReportReason] = useState('骚扰或辱骂')
  const [feedback, setFeedback] = useState('')
  const send = () => { if (draft.trim()) { onSend('text', draft.trim(), undefined, replyTarget ? replySnapshot(replyTarget) : undefined); setDraft(''); setReplyTarget(null) } }
  const enter = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }
  return <section className="room-chat-panel" aria-label="房间聊天" hidden={hidden}>
    <header><div><h2><MessageCircle size={16} />{`# ${'房间聊天'}`}</h2><small>仅当前语音房成员可见，与 IM 会话隔离</small></div><button type="button" className="windows-icon-button" aria-label="更多房间聊天选项"><MoreHorizontal size={18} /></button></header>
    <div className="room-chat-panel__messages">{messages.map((message) => {
      const member = members.find((item) => item.id === message.senderId) ?? (message.senderId === currentSocialUser.id ? { ...currentSocialUser, role: 'member' as const, micOn: false, muted: false } : socialFriends.find((friend) => friend.id === message.senderId) ? { ...socialFriends.find((friend) => friend.id === message.senderId)!, role: 'member' as const, micOn: false, muted: false } : undefined)
      return <ChatMessage key={message.id} message={message} playing={playingMessage === message.id} onTogglePlay={() => setPlayingMessage(playingMessage === message.id ? null : message.id)} onAvatarClick={() => onOpenProfile?.(message.senderId)} onAvatarContextMenu={member ? (event) => onAvatarContextMenu?.(event, member) : undefined} onContextMenu={(event) => openMessageMenu(event, message, setContextMessage, setContextPoint)} />
    })}</div>
    <div className="room-chat-composer">{replyTarget && <ReplyPreview message={replyTarget} onCancel={() => setReplyTarget(null)} />}{feedback && <div className="social-inline-feedback" role="status">{feedback}<button type="button" onClick={() => setFeedback('')} aria-label="关闭提示"><X size={14} /></button></div>}{emojiOpen && <div className="emoji-picker room-emoji-picker" role="group" aria-label="选择房间表情">{['😀', '😊', '😂', '👍', '🎮', '🎉', '❤️', '🙌'].map((emoji) => <button type="button" key={emoji} onClick={() => { onSend('emoji', emoji); setEmojiOpen(false) }} aria-label={`发送${emoji}`}>{emoji}</button>)}</div>}<textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={enter} placeholder="发送房间消息…" aria-label="房间消息内容" /><div className="room-chat-composer__tools"><button type="button" className="windows-icon-button" aria-label="表情" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((value) => !value)}><Smile size={16} /></button><button type="button" className="windows-icon-button" aria-label="发送示例图片" title="发送示例图片" onClick={() => onSend('image', '房间图片 · 示例图片')}><ImagePlus size={16} /></button><button type="button" className="room-chat-send" aria-label="发送消息" onClick={send} disabled={!draft.trim()}><Send size={16} /></button></div></div>
    {contextMessage && <MessageContextMenu point={contextPoint} onClose={() => setContextMessage(null)} onReply={() => { setReplyTarget(contextMessage); setContextMessage(null) }} onCopy={() => copyMessage(contextMessage, setFeedback, () => setContextMessage(null))} onReport={() => { setReportTarget(contextMessage); setReportReason('骚扰或辱骂'); setContextMessage(null) }} />}
    {reportTarget && <DialogPanel overlayId="report-room-message" title="举报消息" description={`举报来自「${reportTarget.senderName}」的房间消息。请选择举报原因。`} onClose={() => setReportTarget(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setReportTarget(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { setFeedback('举报已提交（仅演示）'); setReportTarget(null) }}>提交举报</button></>}><ReportReasons value={reportReason} onChange={setReportReason} /></DialogPanel>}
  </section>
}

function ChatMessage({ message, playing, onTogglePlay, onAvatarClick, onAvatarContextMenu, onContextMenu }: { message: SocialMessage; playing: boolean; onTogglePlay: () => void; onAvatarClick?: () => void; onAvatarContextMenu?: (event: ReactMouseEvent<HTMLButtonElement>) => void; onContextMenu?: (event: ReactMouseEvent<HTMLElement>) => void }) {
  const isSelf = message.senderId === currentSocialUser.id
  return <article className={`social-message${isSelf ? ' is-self' : ''}`} onContextMenu={onContextMenu}>
    <button type="button" className="social-message__avatar" onClick={onAvatarClick} onContextMenu={(event) => { if (onAvatarContextMenu) { event.preventDefault(); event.stopPropagation(); onAvatarContextMenu(event) } }} disabled={!onAvatarClick} aria-label={`查看${message.senderName}陪玩详情`}><AvatarMark initials={message.initials} size="sm" /></button>
    <div className="social-message__body"><div className="social-message__meta"><strong>{message.senderName}</strong><time>{message.time}</time></div>
      {message.replyTo && <div className="social-message__reply"><strong>回复 {message.replyTo.senderName}</strong><span>{message.replyTo.kind === 'image' ? '[图片]' : message.replyTo.kind === 'voice' ? '[语音消息]' : message.replyTo.content}</span></div>}
      {message.kind === 'text' && <p className="social-message__text">{message.content}</p>}
      {message.kind === 'emoji' && <p className="social-message__emoji" aria-label="表情消息">{message.content}</p>}
      {message.kind === 'image' && <div className="social-message__image"><ImagePlus size={20} /><span>{message.content}</span><small>示例媒体 · 点击仅用于展示</small></div>}
      {message.kind === 'voice' && <button type="button" className="social-message__voice" onClick={onTogglePlay} aria-label={`${playing ? '暂停' : '播放'}语音消息`}><span>{playing ? <VolumeX size={16} /> : <Play size={15} />}</span><i className={playing ? 'is-playing' : ''} /><b>{message.duration ?? 5}″</b><small>{playing ? '播放中' : '语音消息'}</small></button>}
    </div>
  </article>
}

function openMessageMenu(event: ReactMouseEvent<HTMLElement>, message: SocialMessage, setMessage: (message: SocialMessage | null) => void, setPoint: (point: { x: number; y: number }) => void) {
  event.preventDefault()
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
  setPoint({ x: Math.max(8, Math.min(localX, width - 176)), y: Math.max(8, Math.min(localY, height - 142)) })
  setMessage(message)
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
  return <div className="message-reply-preview"><div><strong>回复 {message.senderName}</strong><span>{preview}</span></div><button type="button" aria-label="取消回复" onClick={onCancel}><X size={15} /></button></div>
}

function MessageContextMenu({ point, onClose, onReply, onCopy, onReport }: { point: { x: number; y: number }; onClose: () => void; onReply: () => void; onCopy: () => void; onReport: () => void }) {
  return <><button type="button" className="message-context-backdrop" aria-label="关闭消息菜单" onClick={onClose} /><div className="message-context-menu" role="menu" style={{ left: point.x, top: point.y }} onContextMenu={(event) => event.preventDefault()}>
    <button type="button" role="menuitem" onClick={onReply}><Reply size={15} />回复</button>
    <button type="button" role="menuitem" onClick={onCopy}><Clipboard size={15} />复制</button>
    <span className="message-context-menu__divider" />
    <button type="button" role="menuitem" className="is-danger" onClick={onReport}><Flag size={15} />举报</button>
  </div></>
}

function ReportReasons({ value, onChange }: { value: string; onChange: (reason: string) => void }) {
  return <div className="message-report-reasons">{['骚扰或辱骂', '垃圾或广告信息', '不当内容', '其他'].map((reason) => <label key={reason}><input type="radio" name="message-report-reason" checked={value === reason} onChange={() => onChange(reason)} /><span>{reason}</span></label>)}</div>
}

function messagePreview(message: SocialMessage) {
  if (message.kind === 'image') return '[图片]'
  if (message.kind === 'voice') return '[语音消息]'
  return message.content
}

function roleLabel(role: VoiceRole) {
  if (role === 'owner') return '房主'
  if (role === 'admin') return '管理员'
  return '成员'
}
