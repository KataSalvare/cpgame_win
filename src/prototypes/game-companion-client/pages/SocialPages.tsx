import { useState, type KeyboardEvent } from 'react'
import {
  Check, ChevronRight, Globe2, Headphones,
  ImagePlus, LockKeyhole, MessageCircle, Mic, MicOff, MoreHorizontal, Pencil,
  PhoneOff, Play, Plus, Search, Send, Smile, Trash2, UserPlus, Users,
  Volume2, VolumeX, X,
} from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import { currentSocialUser, socialFriends, type ChatMessageKind, type SocialMessage, type VoiceMember, type VoiceRole, type VoiceRoom } from '../data/socialMockData'
import { companions } from '../data/mockData'
import { PageStatePanel } from '../components/PageStatePanel'
import type { useSocialLogic } from '../hooks/useSocialLogic'
import { AvatarMark } from '../components/AvatarMark'
import { CompanionProfileCard } from '../components/CompanionProfileCard'
import type { ProfileCardData } from '../components/profileCardData'
import { CompanionDetailPage } from './CompanionDetailPage'
import '../social.css'

type SocialLogic = ReturnType<typeof useSocialLogic>
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
    logic.sendChatMessage('text', draft.trim())
    setDraft('')
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
          {conversation.messages.map((message) => <ChatMessage key={message.id} message={message} playing={playingMessage === message.id} onTogglePlay={() => setPlayingMessage(playingMessage === message.id ? null : message.id)} onAvatarClick={() => message.senderId !== currentSocialUser.id && showFriendProfile(message.senderId)} />)}
        </div>
        <div className="chat-composer">
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

export function VoiceRoomsPage({ logic, pageState, onRetry }: PageStateProps & { logic: SocialLogic }) {
  const [roomDialog, setRoomDialog] = useState<'create' | 'edit' | null>(null)
  const [roomName, setRoomName] = useState('')
  const [roomPrivacy, setRoomPrivacy] = useState<VoiceRoom['privacy']>('公开')
  const [channelDialog, setChannelDialog] = useState<{ mode: 'create' | 'rename'; id?: string; roomId?: string } | null>(null)
  const [channelName, setChannelName] = useState('')
  const [inviteDialog, setInviteDialog] = useState(false)
  const [invitees, setInvitees] = useState<string[]>([])
  const [deleteChannelId, setDeleteChannelId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [collapsedRoomIds, setCollapsedRoomIds] = useState<string[]>([])
  const [collapsedChannelIds, setCollapsedChannelIds] = useState<string[]>([])

  if (pageState !== 'normal') return <NonNormalPageState pageState={pageState} onRetry={onRetry} />

  const room = logic.activeVoiceRoom
  const channel = logic.activeSubchannel
  const members = channel?.members ?? []
  const canManage = room?.currentRole !== 'member'
  const isOwner = room?.currentRole === 'owner'
  const openCreateRoom = () => { setRoomName(''); setRoomPrivacy('公开'); setRoomDialog('create') }
  const openEditRoom = () => { if (!room) return; setRoomName(room.name); setRoomPrivacy(room.privacy); setRoomDialog('edit') }
  const saveRoom = () => {
    if (!roomName.trim()) return
    if (roomDialog === 'create') logic.createVoiceRoom(roomName, roomPrivacy)
    else logic.updateVoiceRoom(roomName, roomPrivacy)
    setRoomDialog(null)
  }
  const openChannelDialog = (mode: 'create' | 'rename', id?: string, roomId = room?.id) => {
    const targetRoom = logic.voiceRooms.find((item) => item.id === roomId)
    if (mode === 'create' && targetRoom) logic.selectVoiceRoom(targetRoom.id)
    setChannelName(mode === 'rename' ? targetRoom?.channels.find((item) => item.id === id)?.name ?? '' : '')
    setChannelDialog({ mode, id, roomId })
  }
  const saveChannel = () => {
    if (!channelName.trim() || !channelDialog) return
    if (channelDialog.mode === 'create') logic.createSubchannel(channelName, channelDialog.roomId)
    else if (channelDialog.id) logic.renameSubchannel(channelDialog.id, channelName)
    setChannelDialog(null)
  }
  const saveInvites = () => {
    if (!invitees.length) return
    const count = logic.inviteFriendsToRoom(invitees)
    setFeedback(`已向 ${count} 位好友发送语音房邀请（仅演示）。`)
    setInviteDialog(false)
    setInvitees([])
  }
  const toggleInvitee = (id: string) => setInvitees((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const onDropMember = (targetChannelId: string) => {
    if (!logic.draggedMemberId) return
    logic.moveMember(logic.draggedMemberId, targetChannelId)
    setFeedback('已将成员移动到目标子频道。')
    logic.setDraggedMemberId(null)
  }
  const toggleRole = (member: VoiceMember) => logic.setVoiceMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')

  return <div className="social-page voice-page">
    <div className="voice-workspace">
      <aside className="voice-room-tree" aria-label="语音房与子频道">
        <label className="social-search"><Search size={16} /><input value={logic.roomSearch} onChange={(event) => logic.setRoomSearch(event.target.value)} placeholder="搜索语音房" aria-label="搜索语音房" /></label>
        <button type="button" className="voice-invite-entry" onClick={() => setInviteDialog(true)} disabled={!room}><UserPlus size={15} />邀请好友{logic.voiceInvitations.length > 0 && <span className="social-unread-count">{logic.voiceInvitations.length}</span>}</button>
        {logic.voiceInvitations.length > 0 && <section className="voice-invites-section">
          <div className="voice-tree-section-title"><span>房间邀请</span><span className="social-unread-count">{logic.voiceInvitations.length}</span></div>
          {logic.voiceInvitations.map((invite) => <div className="voice-invite-card" key={invite.id}><div><strong>{invite.roomName}</strong><small>{invite.inviter} 邀请你 · {invite.time}</small></div><div className="voice-invite-card__actions"><button type="button" onClick={() => logic.ignoreVoiceInvitation(invite.id)}>忽略</button><button type="button" onClick={() => logic.acceptVoiceInvitation(invite)} aria-label={`接受加入${invite.roomName}`}><Check size={15} />加入</button></div></div>)}
        </section>}
        <div className="voice-tree-section-title"><span>语音分组</span><button type="button" className="voice-create-group-entry" onClick={openCreateRoom}><Plus size={14} />创建分组</button></div>
        <div className="voice-room-list">{logic.visibleVoiceRooms.map((item) => <section className={`voice-room-group${room?.id === item.id ? ' is-active' : ''}`} key={item.id}>
          <div className="voice-room-heading-row">
            <button type="button" className="voice-room-heading" aria-expanded={!collapsedRoomIds.includes(item.id)} onClick={() => { logic.selectVoiceRoom(item.id); setCollapsedRoomIds((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]) }}><ChevronRight size={14} className={`voice-room-chevron${collapsedRoomIds.includes(item.id) ? '' : ' is-expanded'}`} /><span>{item.privacy === '私密' ? <LockKeyhole size={15} /> : <Globe2 size={15} />}</span><strong>{item.name}</strong><small>{item.channels.reduce((sum, sub) => sum + sub.members.length, 0)}</small></button>
            {item.currentRole === 'owner' && <button type="button" className="voice-create-child-channel" aria-label={`在${item.name}创建子频道`} title="创建子频道" onClick={() => openChannelDialog('create', undefined, item.id)}><Plus size={13} /></button>}
            {room?.id === item.id && canManage && <button type="button" className="windows-icon-button voice-tree-manage" aria-label="编辑房间设置" onClick={openEditRoom}><Pencil size={13} /></button>}
          </div>
          {!collapsedRoomIds.includes(item.id) && <div className="voice-subchannel-list">{item.channels.map((subchannel) => <div className={`voice-subchannel${channel?.id === subchannel.id && room?.id === item.id ? ' is-active' : ''}${logic.draggedMemberId && room?.id === item.id && logic.draggedMemberId !== currentSocialUser.id ? ' is-drop-target' : ''}`} key={subchannel.id} onDragOver={(event) => { if (room?.id === item.id && canManage) event.preventDefault() }} onDrop={(event) => { event.preventDefault(); if (room?.id === item.id) onDropMember(subchannel.id) }}>
            <div className="voice-subchannel__heading-row">
              <button type="button" className="voice-subchannel__heading" onClick={() => logic.selectVoiceSubchannel(item.id, subchannel.id)}><Volume2 size={14} /><span>{subchannel.name}</span><small>{subchannel.members.length}/8</small></button>
              <button type="button" className="voice-subchannel__collapse" aria-label={`${collapsedChannelIds.includes(subchannel.id) ? '展开' : '折叠'}${subchannel.name}成员`} aria-expanded={!collapsedChannelIds.includes(subchannel.id)} onClick={() => setCollapsedChannelIds((ids) => ids.includes(subchannel.id) ? ids.filter((id) => id !== subchannel.id) : [...ids, subchannel.id])}><ChevronRight size={13} className={`voice-room-chevron${collapsedChannelIds.includes(subchannel.id) ? '' : ' is-expanded'}`} /></button>
            </div>
            {!collapsedChannelIds.includes(subchannel.id) && <div className="voice-channel-members">{subchannel.members.map((member) => <span className={`voice-channel-member${member.id === currentSocialUser.id ? ' is-self' : ''}`} key={member.id} draggable={room?.id === item.id && canManage && member.id !== currentSocialUser.id} onDragStart={() => logic.setDraggedMemberId(member.id)} onDragEnd={() => logic.setDraggedMemberId(null)} title={canManage ? '拖动到其他子频道' : member.name}><AvatarMark initials={member.initials} size="sm" /><span>{member.name}</span>{member.muted && <MicOff size={12} />}</span>)}</div>}
          </div>)}
        </div>}
        </section>)}
          {logic.visibleVoiceRooms.length === 0 && <div className="social-empty-inline">没有匹配的语音房</div>}
        </div>
      </aside>

      <section className="voice-stage" aria-label="语音房麦位">
        <header className="voice-stage__header">
          <div><div className="voice-stage__breadcrumbs"><span>{room?.name}</span><ChevronRight size={14} /><strong>{channel?.name}</strong></div><small>{members.length}/8 人 · {room?.privacy}房间</small></div>
          <div className="voice-stage__header-actions">{isOwner && channel && <><button type="button" className="windows-icon-button" onClick={() => openChannelDialog('rename', channel.id)} aria-label="重命名子频道"><Pencil size={15} /></button><button type="button" className="windows-icon-button" onClick={() => setDeleteChannelId(channel.id)} aria-label="删除子频道" disabled={(room?.channels.length ?? 0) <= 1}><Trash2 size={15} /></button></>}</div>
        </header>
        <div className="voice-member-grid">{Array.from({ length: 8 }, (_, index) => {
          const member = members[index]
          return <div className={`voice-seat${member ? ' is-occupied' : ''}${member?.micOn && !member.muted ? ' is-speaking' : ''}`} key={member?.id ?? `seat-${index}`}>
            {member ? <>
              <button type="button" className="voice-seat__avatar" aria-label={`${member.name}资料`}><AvatarMark initials={member.initials} size="lg" />{member.muted ? <span className="voice-seat__mic"><MicOff size={14} /></span> : member.micOn ? <span className="voice-seat__mic"><Mic size={14} /></span> : <span className="voice-seat__mic"><VolumeX size={14} /></span>}</button>
              <strong>{member.name}{member.id === currentSocialUser.id ? '（我）' : ''}</strong>
              <span className="voice-role-label">{roleLabel(member.role)}</span>
              {canManage && member.id !== currentSocialUser.id && <div className="voice-seat__management"><button type="button" onClick={() => logic.setVoiceMemberMuted(member.id)}>{member.muted ? '解除禁言' : '禁言'}</button><button type="button" onClick={() => logic.removeVoiceMember(member.id)}>移出</button>{isOwner && member.role !== 'owner' && <><button type="button" onClick={() => toggleRole(member)}>{member.role === 'admin' ? '撤销管理' : '设为管理员'}</button><button type="button" onClick={() => logic.setVoiceMemberRole(member.id, 'owner')}>转让房主</button></>}</div>}
            </> : <><span className="voice-seat__empty"><Mic size={18} /></span><span>空麦位 {index + 1}</span></>}
          </div>
        })}</div>
        <footer className="voice-control-bar">
          <div className="voice-control-bar__status"><span className="voice-status-dot" />正在{logic.isInVoice ? '语音房' : '浏览房间'}<small>{room?.name} / {channel?.name}</small></div>
          <div className="voice-control-bar__actions">
            {logic.isInVoice && <button type="button" className={`client-button client-button--secondary${logic.isSelfMuted ? ' is-pressed' : ''}`} onClick={logic.toggleSelfMute}><VolumeX size={16} />{logic.isSelfMuted ? '取消静音' : '静音'}</button>}
            <button type="button" className="client-button client-button--primary" onClick={logic.isInVoice ? logic.toggleMic : logic.joinVoice} disabled={!logic.isInVoice && members.length >= 8}>{logic.isInVoice ? logic.isMicOn ? <><MicOff size={16} />下麦</> : <><Mic size={16} />上麦</> : <><Headphones size={16} />加入语音</>}</button>
            {logic.isInVoice && <button type="button" className="client-button client-button--secondary" onClick={logic.leaveVoice}><PhoneOff size={16} />离开房间</button>}
          </div>
        </footer>
      </section>

      <RoomChatPanel messages={logic.roomMessages} onSend={(kind, text, duration) => logic.sendRoomMessage(kind, text, duration)} />
    </div>
    {feedback && <div className="social-toast" role="status">{feedback}<button type="button" className="windows-icon-button" onClick={() => setFeedback('')} aria-label="关闭通知"><X size={15} /></button></div>}

    {roomDialog && <DialogPanel overlayId="voice-room-dialog" title={roomDialog === 'create' ? '创建语音分组' : '编辑房间设置'} description={roomDialog === 'create' ? '创建分组后会自动添加主频道。' : '设置房间名称与可见范围。'} onClose={() => setRoomDialog(null)} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setRoomDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveRoom} disabled={!roomName.trim()}>{roomDialog === 'create' ? '创建分组' : '保存设置'}</button></>}>
      <label className="social-form-field">房间名称<input value={roomName} onChange={(event) => setRoomName(event.target.value)} maxLength={24} placeholder="输入房间名称" /></label>
      <fieldset className="voice-privacy-choice"><legend>房间权限</legend><label><input type="radio" name="roomPrivacy" checked={roomPrivacy === '公开'} onChange={() => setRoomPrivacy('公开')} /><Globe2 size={17} /><span><strong>公开房间</strong><small>好友和玩家都可以浏览并加入</small></span></label><label><input type="radio" name="roomPrivacy" checked={roomPrivacy === '私密'} onChange={() => setRoomPrivacy('私密')} /><LockKeyhole size={17} /><span><strong>私密房间</strong><small>仅通过邀请加入</small></span></label></fieldset>
    </DialogPanel>}

    {channelDialog && <DialogPanel overlayId="voice-channel-dialog" title={channelDialog.mode === 'create' ? '创建子频道' : '重命名子频道'} description={channelDialog.mode === 'create' ? `将在「${logic.voiceRooms.find((item) => item.id === channelDialog.roomId)?.name ?? ''}」下创建。` : undefined} onClose={() => setChannelDialog(null)} width={460} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setChannelDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveChannel} disabled={!channelName.trim()}>{channelDialog.mode === 'create' ? '创建子频道' : '保存'}</button></>}><label className="social-form-field">子频道名称<input value={channelName} onChange={(event) => setChannelName(event.target.value)} maxLength={20} placeholder="例如：战术讨论" /></label></DialogPanel>}

    {deleteChannelId && <DialogPanel overlayId="delete-channel-dialog" title="删除子频道" description="删除后，该子频道成员将返回主频道。" onClose={() => setDeleteChannelId(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setDeleteChannelId(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { logic.deleteSubchannel(deleteChannelId); setDeleteChannelId(null) }}>删除子频道</button></>}><p className="social-dialog-copy">确定删除“{room?.channels.find((item) => item.id === deleteChannelId)?.name}”吗？</p></DialogPanel>}

    {inviteDialog && <DialogPanel overlayId="invite-friends-dialog" title="邀请好友进入语音房" description={`邀请好友加入「${room?.name ?? ''}」。`} onClose={() => setInviteDialog(false)} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setInviteDialog(false)}>取消</button><button type="button" className="client-button client-button--primary" onClick={saveInvites} disabled={!invitees.length}>发送邀请（{invitees.length}）</button></>}>
      <div className="social-select-friends">{socialFriends.map((friend) => <label className="social-select-friend" key={friend.id}><input type="checkbox" checked={invitees.includes(friend.id)} onChange={() => toggleInvitee(friend.id)} /><AvatarMark initials={friend.initials} size="sm" /><span><strong>{friend.name}</strong><small>{friend.status}</small></span></label>)}</div>
    </DialogPanel>}
  </div>
}

function RoomChatPanel({ messages, onSend }: { messages: SocialMessage[]; onSend: (kind: ChatMessageKind, content: string, duration?: number) => void }) {
  const [draft, setDraft] = useState('')
  const [playingMessage, setPlayingMessage] = useState<string | null>(null)
  const send = () => { if (draft.trim()) { onSend('text', draft.trim()); setDraft('') } }
  const enter = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }
  return <section className="room-chat-panel" aria-label="房间文字聊天">
    <header><div><h2><MessageCircle size={16} />{`# ${'房间聊天'}`}</h2><small>仅当前语音房成员可见，与 IM 会话隔离</small></div><button type="button" className="windows-icon-button" aria-label="更多房间聊天选项"><MoreHorizontal size={18} /></button></header>
    <div className="room-chat-panel__messages">{messages.map((message) => <ChatMessage key={message.id} message={message} playing={playingMessage === message.id} onTogglePlay={() => setPlayingMessage(playingMessage === message.id ? null : message.id)} />)}</div>
    <div className="room-chat-composer"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={enter} placeholder="发送房间消息…" aria-label="房间消息内容" /><div><button type="button" className="room-chat-send" aria-label="发送消息" onClick={send} disabled={!draft.trim()}><Send size={16} /></button></div></div>
  </section>
}

function ChatMessage({ message, playing, onTogglePlay, onAvatarClick }: { message: SocialMessage; playing: boolean; onTogglePlay: () => void; onAvatarClick?: () => void }) {
  const isSelf = message.senderId === currentSocialUser.id
  return <article className={`social-message${isSelf ? ' is-self' : ''}`}>
    <button type="button" className="social-message__avatar" onClick={onAvatarClick} disabled={!onAvatarClick} aria-label={`查看${message.senderName}资料`}><AvatarMark initials={message.initials} size="sm" /></button>
    <div className="social-message__body"><div className="social-message__meta"><strong>{message.senderName}</strong><time>{message.time}</time></div>
      {message.kind === 'text' && <p className="social-message__text">{message.content}</p>}
      {message.kind === 'emoji' && <p className="social-message__emoji" aria-label="表情消息">{message.content}</p>}
      {message.kind === 'image' && <div className="social-message__image"><ImagePlus size={20} /><span>{message.content}</span><small>示例媒体 · 点击仅用于展示</small></div>}
      {message.kind === 'voice' && <button type="button" className="social-message__voice" onClick={onTogglePlay} aria-label={`${playing ? '暂停' : '播放'}语音消息`}><span>{playing ? <VolumeX size={16} /> : <Play size={15} />}</span><i className={playing ? 'is-playing' : ''} /><b>{message.duration ?? 5}″</b><small>{playing ? '播放中' : '语音消息'}</small></button>}
    </div>
  </article>
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
