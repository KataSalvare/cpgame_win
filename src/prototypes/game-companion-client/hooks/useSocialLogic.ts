import type { ClientOrder } from '../data/accountMockData'
import { useMemo, useRef, useState } from 'react'
import {
  currentSocialUser,
  initialBlockedProfileIds,
  initialConversations,
  initialGroupJoinRequests,
  type FixedMessageFeed,
  orderMessageFromOrder,
  supportReviewSample,
  initialRoomMessagesByRoom,
  initialVoiceInvitations,
  initialVoiceRooms,
  MAX_VOICE_CHANNEL_MEMBERS,
  DEFAULT_VOICE_GROUP_CAPACITY,
  MAX_VOICE_GROUP_MEMBERS,
  UNASSIGNED_VOICE_ROOM_ID,
  socialFriends,
  type ChatMessageKind,
  type SocialConversation,
  type SocialMessage,
  type VoiceInvitation,
  type VoiceMember,
  type VoiceRole,
  type VoiceRoom,
  type VoiceSubchannel,
} from '../data/socialMockData'
import { clubs, companions } from '../data/mockData'
import { clubGroups as initialClubGroups } from '../data/clubGroupMockData'

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`
const voiceRoomMemberCount = (room: VoiceRoom) => room.channels.reduce((total, channel) => total + channel.members.length, 0)
const createUnassignedVoiceRoom = (): VoiceRoom => ({ id: UNASSIGNED_VOICE_ROOM_ID, name: '未分组', capacity: Number.MAX_SAFE_INTEGER, currentRole: 'owner', isUngrouped: true, channels: [] })
const getNextVoiceChannelName = (rooms: VoiceRoom[]) => {
  const usedNames = new Set(rooms.flatMap((room) => room.channels.map((channel) => channel.name)))
  for (let index = 0; ; index += 1) {
    let value = index + 1
    let suffix = ''
    while (value > 0) {
      value -= 1
      suffix = String.fromCharCode(65 + value % 26) + suffix
      value = Math.floor(value / 26)
    }
    const name = `房间${suffix}`
    if (!usedNames.has(name)) return name
  }
}
const updateMicQueue = (channel: VoiceSubchannel, memberId: string, micOn: boolean): VoiceSubchannel => {
  const currentQueue = channel.micQueueMemberIds ?? channel.members.filter((member) => member.micOn).map((member) => member.id)
  const micQueueMemberIds = micOn
    ? [...currentQueue.filter((id) => id !== memberId), memberId]
    : currentQueue.filter((id) => id !== memberId)
  return { ...channel, micQueueMemberIds, members: channel.members.map((member) => member.id === memberId ? { ...member, micOn } : member) }
}

export function useSocialLogic() {
  const [activeFixedFeed, setActiveFixedFeed] = useState<FixedMessageFeed | null>(null)
  const [groupJoinRequests, setGroupJoinRequests] = useState(initialGroupJoinRequests)
  const resolveGroupJoinRequest = (requestId: string, status: 'approved' | 'rejected') => {
    const request = groupJoinRequests.find((item) => item.id === requestId)
    const target = conversations.find((item) => item.id === request?.conversationId)
    if (!request || request.status !== 'pending' || !target || target.ownerId !== currentSocialUser.id) return
    setGroupJoinRequests((items) => items.map((item) => item.id === requestId ? { ...item, status } : item))
    if (status === 'approved') setConversations((items) => items.map((item) => item.id !== request.conversationId || item.members.includes(request.applicantId) ? item : { ...item, members: [...item.members, request.applicantId] }))
  }
  const [conversations, setConversations] = useState(initialConversations)
  const [clubGroups, setClubGroups] = useState(initialClubGroups)
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversations[0].id)
  const [activeMessagesTab, setActiveMessagesTab] = useState<'messages' | 'friends'>('messages')
  const [chatSearch, setChatSearch] = useState('')
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [voiceRooms, setVoiceRooms] = useState(initialVoiceRooms)
  const [blockedVoiceMemberIds, setBlockedVoiceMemberIds] = useState<string[]>([])
  const [followedProfileIds, setFollowedProfileIds] = useState<string[]>([])
  const [followedClubIds, setFollowedClubIds] = useState<string[]>(() => clubs.filter((club) => club.followed).map((club) => club.id))
  const [followedChannelIds, setFollowedChannelIds] = useState<string[]>([])
  const toggleClubFollow = (clubId: string) => setFollowedClubIds((ids) => ids.includes(clubId) ? ids.filter((id) => id !== clubId) : [...ids, clubId])
  const toggleChannelFollow = (channelId: string) => setFollowedChannelIds((ids) => ids.includes(channelId) ? ids.filter((id) => id !== channelId) : [...ids, channelId])
  const [blockedProfileIds, setBlockedProfileIds] = useState<string[]>(initialBlockedProfileIds)
  const [profileNotes, setProfileNotes] = useState<Record<string, string>>({})
  const setProfileNote = (profileId: string, note: string) => setProfileNotes((items) => ({ ...items, [profileId]: note }))
  const [activeVoiceRoomId, setActiveVoiceRoomId] = useState(initialVoiceRooms[0].id)
  const [activeSubchannelId, setActiveSubchannelId] = useState(initialVoiceRooms[0].channels[0].id)
  const [roomMessagesByRoom, setRoomMessagesByRoom] = useState(initialRoomMessagesByRoom)
  const roomMessageLastSentAt = useRef<Record<string, number>>({})
  const [voiceInvitations, setVoiceInvitations] = useState(initialVoiceInvitations)
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null)

  const selectedConversation = conversations.find((item) => item.id === selectedConversationId) ?? conversations[0]
  const selectedFriend = socialFriends.find((friend) => friend.id === selectedFriendId) ?? null
  const selectedProfile = selectedProfileId === currentSocialUser.id
    ? { ...currentSocialUser, status: '在线', online: true }
    : socialFriends.find((friend) => friend.id === selectedProfileId) ?? null
  const visibleConversations = useMemo(() => {
    const query = chatSearch.trim().toLocaleLowerCase()
    return conversations.filter((item) => !query || item.title.toLocaleLowerCase().includes(query))
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
  }, [chatSearch, conversations])
  const visibleFriends = useMemo(() => {
    const query = chatSearch.trim().toLocaleLowerCase()
    return socialFriends.filter((friend) => !query || friend.name.toLocaleLowerCase().includes(query))
  }, [chatSearch])
  const activeVoiceRoom = voiceRooms.find((room) => room.id === activeVoiceRoomId) ?? voiceRooms[0]
  const activeSubchannel = activeVoiceRoom?.channels.find((channel) => channel.id === activeSubchannelId) ?? activeVoiceRoom?.channels[0]
  const roomMessages = roomMessagesByRoom[activeVoiceRoomId] ?? []
  const selfVoiceMember = activeSubchannel?.members.find((member) => member.id === currentSocialUser.id)
  const isInVoice = Boolean(selfVoiceMember)
  const isMicOn = selfVoiceMember?.micOn ?? false
  const isSelfMuted = selfVoiceMember?.muted ?? false
  const visibleVoiceRooms = useMemo(() => {
    return voiceRooms.filter((room) => {
      const isMember = room.channels.some((channel) => channel.members.some((member) => member.id === currentSocialUser.id))
      const hasInvitation = voiceInvitations.some((invitation) => invitation.roomId === room.id)
      const canDiscover = room.currentRole === 'owner' || room.channels.some((channel) => channel.privacy === '公开') || isMember || hasInvitation
      return canDiscover
    })
  }, [voiceRooms, voiceInvitations])
  const totalUnread = conversations.reduce((sum, item) => sum + item.unread, 0)

  const updateMessages = (conversationId: string, makeMessage: (id: string, time: string) => SocialMessage) => {
    const id = createId('message')
    setConversations((items) => items.map((conversation) => conversation.id === conversationId
      ? { ...conversation, unread: 0, messages: [...conversation.messages, makeMessage(id, '现在')] }
      : conversation))
  }

  const openConversation = (conversation: SocialConversation) => {
    setActiveFixedFeed(null)
    setSelectedConversationId(conversation.id)
    setSelectedFriendId(null)
    setConversations((items) => items.map((item) => item.id === conversation.id ? { ...item, unread: 0 } : item))
  }

  const setConversationPinned = (conversationId: string, pinned: boolean) => {
    setConversations((items) => items.map((item) => item.id === conversationId ? { ...item, pinned } : item))
  }

  const markConversationRead = (conversationId: string) => {
    setConversations((items) => items.map((item) => item.id === conversationId ? { ...item, unread: 0 } : item))
  }

  const clearConversationMessages = (conversationId: string) => {
    setConversations((items) => items.map((item) => item.id === conversationId ? { ...item, messages: [], unread: 0 } : item))
  }

  const deleteConversation = (conversationId: string) => {
    const remaining = conversations.filter((item) => item.id !== conversationId)
    setConversations(remaining)
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(remaining[0]?.id ?? '')
      setSelectedFriendId(null)
      setSelectedProfileId(null)
    }
  }

  const startDirectMessage = (friendId: string) => {
    setActiveFixedFeed(null)
    const friend = socialFriends.find((item) => item.id === friendId)
    if (!friend) return
    const existing = conversations.find((item) => item.kind === 'direct' && item.members[0] === friendId)
    if (existing) openConversation(existing)
    else {
      const conversation: SocialConversation = { id: createId('direct'), kind: 'direct', title: friend.name, initials: friend.initials, members: [friendId], unread: 0, messages: [] }
      setConversations((items) => [conversation, ...items])
      setSelectedConversationId(conversation.id)
    }
    setActiveMessagesTab('messages')
    setSelectedFriendId(null)
  }

  const startDirectMessageToUser = (userId: string, name: string, initials: string) => {
    setActiveFixedFeed(null)
    const existing = conversations.find((item) => item.kind === 'direct' && item.members[0] === userId)
    if (existing) openConversation(existing)
    else {
      const conversation: SocialConversation = {
        id: createId('direct'), kind: 'direct', title: name, initials, members: [userId], unread: 0,
        messages: [{ id: createId('message'), senderId: userId, senderName: name, initials, time: '14:20', kind: 'text', content: '你好，我想和你确认一下这笔订单。' }],
      }
      setConversations((items) => [conversation, ...items])
      setSelectedConversationId(conversation.id)
    }
    setActiveMessagesTab('messages')
    setSelectedFriendId(null)
  }

  const shareCompanionToFriends = (companionId: string, friendIds: string[]) => {
    const companion = companions.find((item) => item.id === companionId)
    if (!companion) return
    const recipients = socialFriends.filter((friend) => friendIds.includes(friend.id))
    setConversations((items) => {
      let next = [...items]
      recipients.forEach((friend) => {
        const message: SocialMessage = { id: createId('companion-share'), senderId: currentSocialUser.id, senderName: currentSocialUser.name, initials: currentSocialUser.initials, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), kind: 'companion-share', content: `[陪玩名片] ${companion.name}`, companionShare: { id: companion.id, clubId: companion.clubId, name: companion.name, initials: companion.initials, gender: companion.gender, age: companion.age, intro: companion.intro } }
        const existing = next.find((item) => item.kind === 'direct' && !item.self && item.members.length === 1 && item.members[0] === friend.id)
        if (existing) next = next.map((item) => item.id === existing.id ? { ...item, messages: [...item.messages, message] } : item)
        else next = [{ id: createId('direct'), kind: 'direct', title: friend.name, initials: friend.initials, members: [friend.id], unread: 0, messages: [message] }, ...next]
      })
      return next
    })
  }

  const startDirectMessageWithCompanion = (companionId: string) => {
    setActiveFixedFeed(null)
    const friend = socialFriends.find((item) => item.companionId === companionId)
    if (friend) {
      startDirectMessage(friend.id)
      return
    }
    const companion = companions.find((item) => item.id === companionId)
    if (!companion) return
    const existing = conversations.find((item) => item.kind === 'direct' && item.members[0] === companionId)
    if (existing) openConversation(existing)
    else {
      const conversation: SocialConversation = { id: createId('direct'), kind: 'direct', title: companion.name, initials: companion.initials, members: [companionId], unread: 0, messages: [] }
      setConversations((items) => [conversation, ...items])
      setSelectedConversationId(conversation.id)
    }
    setActiveMessagesTab('messages')
    setSelectedFriendId(null)
  }

  const createGroup = (name: string, friendIds: string[]) => {
    const members = [...new Set(friendIds)]
    const conversation: SocialConversation = {
      id: createId('group'), kind: 'group', title: name.trim(), initials: name.trim().slice(0, 1) || '群', members, unread: 0, ownerId: currentSocialUser.id, adminIds: [], joinApprovalRequired: false,
      messages: [{ id: createId('message'), senderId: 'system', senderName: '系统', initials: '系', time: '现在', kind: 'text', content: `你创建了群聊，并邀请 ${members.length} 位好友加入。` }],
    }
    setConversations((items) => [conversation, ...items])
    setSelectedConversationId(conversation.id)
    setSelectedFriendId(null)
    setActiveMessagesTab('messages')
  }

  const inviteFriendsToGroup = (conversationId: string, friendIds: string[]) => {
    const ids = [...new Set(friendIds)]
    if (!ids.length) return
    const invitedNames = ids.map((id) => socialFriends.find((friend) => friend.id === id)?.name).filter(Boolean).join('、')
    setConversations((items) => items.map((conversation) => conversation.id !== conversationId || conversation.kind !== 'group' ? conversation : {
      ...conversation,
      members: [...new Set([...conversation.members, ...ids])],
      messages: [...conversation.messages, { id: createId('message'), senderId: 'system', senderName: '系统', initials: '系', time: '现在', kind: 'text', content: `你邀请了 ${invitedNames} 加入群聊。` }],
    }))
  }

  const renameGroup = (conversationId: string, name: string) => {
    const title = name.trim()
    if (!title) return
    setConversations((items) => items.map((conversation) => conversation.id === conversationId && conversation.kind === 'group' && conversation.ownerId === currentSocialUser.id
      ? { ...conversation, title, initials: title.slice(0, 1) }
      : conversation))
  }

  const updateGroupAvatar = (conversationId: string, avatarDataUrl: string) => {
    setConversations((items) => items.map((conversation) => conversation.id === conversationId && conversation.kind === 'group' && conversation.ownerId === currentSocialUser.id
      ? { ...conversation, avatarDataUrl }
      : conversation))
  }

  const setGroupAdmin = (conversationId: string, memberId: string, isAdmin: boolean) => {
    setConversations((items) => items.map((conversation) => {
      if (conversation.id !== conversationId || conversation.kind !== 'group' || conversation.ownerId !== currentSocialUser.id || !conversation.members.includes(memberId)) return conversation
      const adminIds = new Set(conversation.adminIds ?? [])
      if (isAdmin) adminIds.add(memberId)
      else adminIds.delete(memberId)
      return { ...conversation, adminIds: [...adminIds] }
    }))
  }

  const removeGroupMember = (conversationId: string, memberId: string) => {
    const friend = socialFriends.find((item) => item.id === memberId)
    if (!friend) return
    setConversations((items) => items.map((conversation) => {
      if (conversation.id !== conversationId || conversation.kind !== 'group' || conversation.ownerId !== currentSocialUser.id || !conversation.members.includes(memberId)) return conversation
      return {
        ...conversation,
        members: conversation.members.filter((id) => id !== memberId),
        adminIds: (conversation.adminIds ?? []).filter((id) => id !== memberId),
        messages: [...conversation.messages, { id: createId('message'), senderId: 'system', senderName: '系统', initials: '系', time: '现在', kind: 'text', content: `已将 ${friend.name} 移出群聊。` }],
      }
    }))
  }

  const setGroupJoinApproval = (conversationId: string, required: boolean) => {
    setConversations((items) => items.map((conversation) => conversation.id === conversationId && conversation.kind === 'group' && conversation.ownerId === currentSocialUser.id
      ? { ...conversation, joinApprovalRequired: required }
      : conversation))
  }

  const setGroupMuted = (conversationId: string, muted: boolean) => {
    setConversations((items) => items.map((conversation) => conversation.id === conversationId && conversation.kind === 'group'
      ? { ...conversation, muted }
      : conversation))
  }

  const dissolveGroup = (conversationId: string) => {
    const target = conversations.find((conversation) => conversation.id === conversationId)
    if (!target || target.kind !== 'group' || target.ownerId !== currentSocialUser.id) return
    const remaining = conversations.filter((conversation) => conversation.id !== conversationId)
    setConversations(remaining)
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(remaining[0]?.id ?? '')
      setSelectedFriendId(null)
      setSelectedProfileId(null)
    }
  }

  const leaveGroup = (conversationId: string) => {
    const target = conversations.find((conversation) => conversation.id === conversationId)
    if (!target || target.kind !== 'group' || target.ownerId === currentSocialUser.id) return
    const remaining = conversations.filter((conversation) => conversation.id !== conversationId)
    setConversations(remaining)
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(remaining[0]?.id ?? '')
      setSelectedFriendId(null)
      setSelectedProfileId(null)
    }
  }

  const applyToClubGroup = (groupId: string, reason: string) => {
    if (!reason.trim()) return
    setClubGroups((items) => items.map((group) => group.id === groupId && group.membership === 'not-joined' ? { ...group, membership: 'pending', applicationReason: reason.trim() } : group))
  }

  const openClubGroupChat = (groupId: string) => {
    const group = clubGroups.find((item) => item.id === groupId)
    if (!group || group.membership !== 'joined') return
    const existing = conversations.find((item) => item.clubGroupId === groupId)
    if (existing) {
      openConversation(existing)
    } else {
      const conversation: SocialConversation = { id: `club-group-${groupId}`, kind: 'group', clubGroupId: groupId, title: group.name, initials: group.initials, members: [], unread: 0, messages: [], ownerId: currentSocialUser.id, adminIds: [], joinApprovalRequired: false }
      setConversations((items) => [conversation, ...items])
      setSelectedConversationId(conversation.id)
      setSelectedFriendId(null)
      setActiveMessagesTab('messages')
    }
  }

  const sendChatMessage = (kind: ChatMessageKind, content: string, duration?: number, replyTo?: SocialMessage['replyTo']) => {
    if (!selectedConversation || !content.trim()) return
    const self = selectedConversation.self ?? currentSocialUser
    updateMessages(selectedConversation.id, (id, time) => ({ id, senderId: self.id, senderName: self.name, initials: self.initials, time, kind, content, duration, replyTo }))
  }

  const sendChatMessageToConversation = (conversationId: string, kind: ChatMessageKind, content: string, duration?: number, replyTo?: SocialMessage['replyTo']) => {
    const target = conversations.find((item) => item.id === conversationId)
    if (!target || !content.trim()) return
    const self = target.self ?? currentSocialUser
    updateMessages(conversationId, (id, time) => ({ id, senderId: self.id, senderName: self.name, initials: self.initials, time, kind, content, duration, replyTo }))
  }

  const recallChatMessage = (conversationId: string, messageId: string) => {
    const target = conversations.find((item) => item.id === conversationId)
    if (!target || !target.messages.some((message) => message.id === messageId && message.senderId === (target.self?.id ?? currentSocialUser.id))) return false
    setConversations((items) => items.map((conversation) => conversation.id !== conversationId ? conversation : {
      ...conversation,
      messages: conversation.messages.map((message) => message.id !== messageId ? message : { ...message, kind: 'text', content: '消息已撤回', recalled: true, order: undefined, review: undefined, duration: undefined, replyTo: undefined }),
    }))
    return true
  }

  const sendSupportCardToConversation = (conversationId: string, order?: ClientOrder) => {
    const target = conversations.find((item) => item.id === conversationId)
    if (!target?.supportAction || (target.supportAction === 'order' && !order)) return
    const self = target.self ?? currentSocialUser
    const sample = target.supportAction === 'order' ? orderMessageFromOrder(order!) : supportReviewSample
    updateMessages(conversationId, (id, time) => ({ id, senderId: self.id, senderName: self.name, initials: self.initials, time, ...sample }))
  }

  const sendSupportCard = (order?: ClientOrder) => {
    if (!selectedConversation?.supportAction) return
    const self = selectedConversation.self ?? currentSocialUser
    if (selectedConversation.supportAction === 'order' && !order) return
    const sample = selectedConversation.supportAction === 'order' ? orderMessageFromOrder(order!) : supportReviewSample
    updateMessages(selectedConversation.id, (id, time) => ({ id, senderId: self.id, senderName: self.name, initials: self.initials, time, ...sample }))
  }

  const updateSupportReview = (messageId: string, rating: number, submitted = false) => {
    if (!selectedConversation || !Number.isInteger(rating) || rating < 1 || rating > 5) return
    setConversations((items) => items.map((conversation) => conversation.id !== selectedConversation.id ? conversation : {
      ...conversation, messages: conversation.messages.map((message) => message.id !== messageId || !message.review || message.review.submitted ? message : {
        ...message, content: submitted ? `[客服评价] ${rating} 分 · 已评价` : '[客服评价] 待评价', review: { ...message.review, rating, submitted },
      }),
    }))
  }

  const updateSupportReviewInConversation = (conversationId: string, messageId: string, rating: number, submitted = false) => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return
    setConversations((items) => items.map((conversation) => conversation.id !== conversationId ? conversation : {
      ...conversation, messages: conversation.messages.map((message) => message.id !== messageId || !message.review || message.review.submitted ? message : {
        ...message, content: submitted ? `[客服评价] ${rating} 分 · 已评价` : '[客服评价] 待评价', review: { ...message.review, rating, submitted },
      }),
    }))
  }

  const sendRoomMessage = (kind: ChatMessageKind, content: string, duration?: number, replyTo?: SocialMessage['replyTo']) => {
    if (!content.trim() || !activeVoiceRoom || !activeSubchannel) return false
    const interval = activeSubchannel.messageFrequencySeconds
    const lastSentAt = roomMessageLastSentAt.current[activeSubchannel.id] ?? 0
    if (interval > 0 && Date.now() - lastSentAt < interval * 1000) return false
    roomMessageLastSentAt.current[activeSubchannel.id] = Date.now()
    setRoomMessagesByRoom((items) => ({ ...items, [activeVoiceRoomId]: [...(items[activeVoiceRoomId] ?? []), { id: createId('room-message'), senderId: currentSocialUser.id, senderName: currentSocialUser.name, initials: currentSocialUser.initials, time: '现在', kind, content, duration, replyTo }] }))
    return true
  }

  const recallRoomMessage = (messageId: string) => {
    const messages = roomMessagesByRoom[activeVoiceRoomId] ?? []
    if (!messages.some((message) => message.id === messageId && message.senderId === currentSocialUser.id && !message.recalled)) return false
    setRoomMessagesByRoom((items) => ({
      ...items,
      [activeVoiceRoomId]: (items[activeVoiceRoomId] ?? []).map((message) => message.id !== messageId ? message : { ...message, kind: 'text', content: '消息已撤回', recalled: true, order: undefined, review: undefined, duration: undefined, replyTo: undefined }),
    }))
    return true
  }

  const selectVoiceRoom = (roomId: string) => {
    const room = voiceRooms.find((item) => item.id === roomId)
    if (!room) return
    if (activeVoiceRoomId !== roomId) {
      setVoiceRooms((rooms) => rooms.map((item) => item.id !== activeVoiceRoomId ? item : { ...item, channels: item.channels.map((channel) => ({ ...channel, members: channel.members.filter((member) => member.id !== currentSocialUser.id) })) }))
    }
    const occupiedChannel = room.channels.find((channel) => channel.members.some((member) => member.id === currentSocialUser.id))
    const targetChannel = occupiedChannel ?? room.channels[0]
    setActiveVoiceRoomId(roomId)
    setActiveSubchannelId(targetChannel?.id ?? '')
  }

  const moveMember = (memberId: string, targetChannelId: string) => {
    if (!activeVoiceRoom || (activeVoiceRoom.currentRole === 'member' && memberId !== currentSocialUser.id)) return
    setVoiceRooms((rooms) => rooms.map((room) => {
      if (room.id !== activeVoiceRoom.id) return room
      const sourceChannel = room.channels.find((channel) => channel.members.some((member) => member.id === memberId))
      const targetChannel = room.channels.find((channel) => channel.id === targetChannelId)
      if (!sourceChannel || !targetChannel || sourceChannel.id === targetChannelId || targetChannel.members.length >= targetChannel.capacity) return room
      const member = sourceChannel.members.find((item) => item.id === memberId)
      if (!member) return room
      return { ...room, channels: room.channels.map((channel) => channel.id === sourceChannel.id
        ? { ...channel, members: channel.members.filter((item) => item.id !== memberId) }
        : channel.id === targetChannelId ? { ...channel, members: [...channel.members, member] } : channel) }
    }))
  }

  const moveVoiceMember = (memberId: string, targetRoomId: string, targetChannelId: string) => {
    if (!activeVoiceRoom || activeVoiceRoom.currentRole === 'member' || memberId === currentSocialUser.id) return false
    const sourceChannel = activeVoiceRoom.channels.find((channel) => channel.members.some((member) => member.id === memberId))
    const targetRoom = voiceRooms.find((room) => room.id === targetRoomId)
    const targetChannel = targetRoom?.channels.find((channel) => channel.id === targetChannelId)
    const member = sourceChannel?.members.find((item) => item.id === memberId)
    if (!sourceChannel || !targetRoom || !targetChannel || !member || sourceChannel.id === targetChannel.id) return false
    const alreadyInTargetRoom = targetRoom.channels.some((channel) => channel.id !== sourceChannel.id && channel.members.some((item) => item.id === memberId))
    if (alreadyInTargetRoom || targetChannel.members.length >= targetChannel.capacity) return false
    if (targetRoom.id !== activeVoiceRoom.id && voiceRoomMemberCount(targetRoom) >= targetRoom.capacity) return false
    setVoiceRooms((rooms) => rooms.map((room) => {
      if (room.id === activeVoiceRoom.id && room.id === targetRoomId) return { ...room, channels: room.channels.map((channel) => channel.id === sourceChannel.id
        ? { ...channel, members: channel.members.filter((item) => item.id !== memberId) }
        : channel.id === targetChannelId ? { ...channel, members: [...channel.members, member] } : channel) }
      if (room.id === activeVoiceRoom.id) return { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.filter((item) => item.id !== memberId) })) }
      if (room.id === targetRoomId) return { ...room, channels: room.channels.map((channel) => channel.id === targetChannelId ? { ...channel, members: [...channel.members, member] } : channel) }
      return room
    }))
    return true
  }

  const moveMembers = (sourceRoomId: string, sourceChannelId: string, memberIds: string[], targetRoomId: string, targetChannelId: string) => {
    const sourceRoom = voiceRooms.find((item) => item.id === sourceRoomId)
    const source = sourceRoom?.channels.find((channel) => channel.id === sourceChannelId)
    const targetRoom = voiceRooms.find((item) => item.id === targetRoomId)
    const target = targetRoom?.channels.find((channel) => channel.id === targetChannelId)
    if (!sourceRoom || !source || !targetRoom || !target || sourceRoom.currentRole === 'member' || (sourceRoomId === targetRoomId && sourceChannelId === targetChannelId)) return 0
    const memberIdSet = new Set(memberIds)
    const moving = source.members.filter((member) => memberIdSet.has(member.id))
    if (moving.length > target.capacity - target.members.length) return 0
    if (sourceRoomId !== targetRoomId && moving.length > targetRoom.capacity - voiceRoomMemberCount(targetRoom)) return 0
    if (targetRoom.channels.some((channel) => (targetRoomId !== sourceRoomId || channel.id !== sourceChannelId) && channel.members.some((member) => memberIdSet.has(member.id)))) return 0
    if (!moving.length) return 0
    const movingIdSet = new Set(moving.map((member) => member.id))
    setVoiceRooms((rooms) => rooms.map((item) => {
      if (item.id === sourceRoomId && item.id === targetRoomId) return { ...item, channels: item.channels.map((channel) => channel.id === sourceChannelId
        ? { ...channel, members: channel.members.filter((member) => !movingIdSet.has(member.id)) }
        : channel.id === targetChannelId ? { ...channel, members: [...channel.members, ...moving] } : channel) }
      if (item.id === sourceRoomId) return { ...item, channels: item.channels.map((channel) => ({ ...channel, members: channel.members.filter((member) => !movingIdSet.has(member.id)) })) }
      if (item.id === targetRoomId) return { ...item, channels: item.channels.map((channel) => channel.id === targetChannelId ? { ...channel, members: [...channel.members, ...moving] } : channel) }
      return item
    }))
    return moving.length
  }

  const switchSubchannel = (channelId: string) => {
    if (!activeVoiceRoom) return
    const target = activeVoiceRoom.channels.find((item) => item.id === channelId)
    const current = activeVoiceRoom.channels.find((channel) => channel.members.some((member) => member.id === currentSocialUser.id))
    if (current && target && current.id !== target.id && target.members.length < target.capacity) moveMember(currentSocialUser.id, target.id)
    setActiveSubchannelId(channelId)
  }

  const selectVoiceSubchannel = (roomId: string, channelId: string) => {
    if (roomId === activeVoiceRoomId) {
      switchSubchannel(channelId)
      return
    }
    const room = voiceRooms.find((item) => item.id === roomId)
    const target = room?.channels.find((item) => item.id === channelId)
    if (!room || !target) return
    if (activeVoiceRoomId !== roomId) {
      setVoiceRooms((rooms) => rooms.map((item) => item.id !== activeVoiceRoomId ? item : { ...item, channels: item.channels.map((channel) => ({ ...channel, members: channel.members.filter((member) => member.id !== currentSocialUser.id) })) }))
    }
    setActiveVoiceRoomId(roomId)
    setActiveSubchannelId(channelId)
  }

  const joinVoice = () => {
    if (!activeVoiceRoom || !activeSubchannel) return
    if (activeVoiceRoom.channels.some((channel) => channel.members.some((member) => member.id === currentSocialUser.id))) return
    if (activeSubchannel.members.length >= activeSubchannel.capacity || voiceRoomMemberCount(activeVoiceRoom) >= activeVoiceRoom.capacity) return
    const self: VoiceMember = { ...currentSocialUser, role: activeVoiceRoom.currentRole, micOn: true, muted: false }
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoom.id ? room : { ...room, channels: room.channels.map((channel) => channel.id === activeSubchannel.id ? { ...channel, members: [...channel.members, self], micQueueMemberIds: [...(channel.micQueueMemberIds ?? channel.members.filter((member) => member.micOn).map((member) => member.id)), self.id] } : channel) }))
  }

  const leaveVoice = () => {
    if (!activeVoiceRoom) return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoom.id ? room : { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.filter((member) => member.id !== currentSocialUser.id) })) }))
  }

  const disconnectVoiceAndSelectSubchannel = (roomId: string, channelId: string) => {
    if (!voiceRooms.some((room) => room.id === roomId && room.channels.some((channel) => channel.id === channelId))) return false
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.filter((member) => member.id !== currentSocialUser.id) })) }))
    setActiveVoiceRoomId(roomId)
    setActiveSubchannelId(channelId)
    return true
  }

  const toggleMic = () => {
    if (!isInVoice) return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => {
      if (!channel.members.some((member) => member.id === currentSocialUser.id)) return channel
      const self = channel.members.find((member) => member.id === currentSocialUser.id)!
      return updateMicQueue(channel, currentSocialUser.id, !self.micOn)
    }) }))
  }

  const setVoiceMemberMic = (memberId: string, micOn: boolean) => {
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => channel.id !== activeSubchannelId || !channel.members.some((member) => member.id === memberId) ? channel : updateMicQueue(channel, memberId, micOn)) }))
  }

  const toggleSelfMute = () => {
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.map((member) => member.id === currentSocialUser.id ? { ...member, muted: !member.muted } : member) })) }))
  }

  const createVoiceRoom = (name: string, capacity = DEFAULT_VOICE_GROUP_CAPACITY) => {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > MAX_VOICE_GROUP_MEMBERS) return
    const roomId = createId('room')
    const channelId = createId('channel')
    const room: VoiceRoom = { id: roomId, name: name.trim(), capacity, currentRole: 'owner', channels: [{ id: channelId, name: getNextVoiceChannelName(voiceRooms), isDefault: !voiceRooms.some((item) => item.channels.some((channel) => channel.isDefault)), capacity: Math.min(MAX_VOICE_CHANNEL_MEMBERS, capacity), messageFrequencySeconds: 5, micQueueDurationSeconds: 60, privacy: '公开', password: '', members: [{ ...currentSocialUser, role: 'owner', micOn: true, muted: false }] }] }
    setVoiceRooms((items) => [room, ...items])
    setActiveVoiceRoomId(roomId)
    setActiveSubchannelId(channelId)
  }

  const renameVoiceRoom = (name: string) => setVoiceRooms((rooms) => rooms.map((room) => room.id === activeVoiceRoomId ? { ...room, name: name.trim() } : room))

  const updateVoiceRoom = (name: string, roomId = activeVoiceRoomId, capacity?: number) => setVoiceRooms((rooms) => rooms.map((room) => {
    if (room.id !== roomId) return room
    const nextCapacity = capacity ?? room.capacity
    if (!Number.isInteger(nextCapacity) || nextCapacity < Math.max(voiceRoomMemberCount(room), ...room.channels.map((channel) => channel.capacity)) || nextCapacity > MAX_VOICE_GROUP_MEMBERS) return room
    return { ...room, name: name.trim(), capacity: nextCapacity }
  }))

  const moveVoiceRoom = (sourceRoomId: string, targetRoomId: string, insertAfter: boolean) => {
    const sourceRoom = voiceRooms.find((room) => room.id === sourceRoomId)
    const targetRoom = voiceRooms.find((room) => room.id === targetRoomId)
    if (!sourceRoom || !targetRoom || sourceRoomId === targetRoomId || sourceRoom.isUngrouped || targetRoom.isUngrouped || sourceRoom.currentRole === 'member' || targetRoom.currentRole === 'member') return false
    setVoiceRooms((rooms) => {
      const groups = rooms.filter((room) => !room.isUngrouped)
      const ungrouped = rooms.filter((room) => room.isUngrouped)
      const sourceIndex = groups.findIndex((room) => room.id === sourceRoomId)
      const targetIndex = groups.findIndex((room) => room.id === targetRoomId)
      if (sourceIndex < 0 || targetIndex < 0) return rooms
      const [source] = groups.splice(sourceIndex, 1)
      const adjustedTargetIndex = groups.findIndex((room) => room.id === targetRoomId)
      groups.splice(adjustedTargetIndex + (insertAfter ? 1 : 0), 0, source)
      return [...groups, ...ungrouped]
    })
    return true
  }

  const setDefaultVoiceSubchannel = (roomId: string, channelId: string) => {
    if (!voiceRooms.some((room) => room.id === roomId && room.channels.some((channel) => channel.id === channelId))) return false
    setVoiceRooms((rooms) => rooms.map((room) => ({ ...room, channels: room.channels.map((channel) => ({ ...channel, isDefault: room.id === roomId && channel.id === channelId })) })))
    return true
  }

  const moveVoiceSubchannel = (sourceRoomId: string, channelId: string, targetRoomId: string, beforeChannelId?: string) => {
    const sourceRoom = voiceRooms.find((room) => room.id === sourceRoomId)
    const targetRoom = voiceRooms.find((room) => room.id === targetRoomId)
    const sourceChannel = sourceRoom?.channels.find((channel) => channel.id === channelId)
    if (!sourceRoom || !targetRoom || !sourceChannel || sourceRoom.currentRole === 'member' || targetRoom.currentRole === 'member') return false
    if (beforeChannelId === channelId) return false
    const targetChannel = beforeChannelId ? targetRoom.channels.find((channel) => channel.id === beforeChannelId) : undefined
    if (beforeChannelId && !targetChannel) return false
    if (sourceRoomId !== targetRoomId && (sourceChannel.members.length + voiceRoomMemberCount(targetRoom) > targetRoom.capacity || sourceChannel.capacity > targetRoom.capacity)) return false

    if (sourceRoomId === targetRoomId) {
      const remaining = sourceRoom.channels.filter((channel) => channel.id !== channelId)
      const insertIndex = targetChannel ? remaining.findIndex((channel) => channel.id === targetChannel.id) : remaining.length
      remaining.splice(insertIndex < 0 ? remaining.length : insertIndex, 0, sourceChannel)
      setVoiceRooms((rooms) => rooms.map((room) => room.id === sourceRoomId ? { ...room, channels: remaining } : room))
      return true
    }

    const movedChannel = sourceChannel
    setVoiceRooms((rooms) => rooms.map((room) => {
      if (room.id === sourceRoomId) return { ...room, channels: room.channels.filter((channel) => channel.id !== channelId) }
      if (room.id !== targetRoomId) return room
      const channels = [...room.channels]
      const insertIndex = targetChannel ? channels.findIndex((channel) => channel.id === targetChannel.id) : channels.length
      channels.splice(insertIndex < 0 ? channels.length : insertIndex, 0, movedChannel)
      return { ...room, channels }
    }))
    if (activeSubchannelId === channelId) setActiveVoiceRoomId(targetRoomId)
    return true
  }

  const deleteVoiceRoom = (roomId: string, deleteChannels: boolean) => {
    const sourceRoom = voiceRooms.find((room) => room.id === roomId)
    let remainingRooms = voiceRooms.filter((room) => room.id !== roomId).map((room) => ({ ...room, channels: room.channels.map((channel) => ({ ...channel, members: [...channel.members] })) }))
    if (!sourceRoom || sourceRoom.isUngrouped || sourceRoom.currentRole !== 'owner') return false
    if (!remainingRooms.some((room) => room.isUngrouped)) remainingRooms.push(createUnassignedVoiceRoom())
    let activeRoomReplacement: VoiceRoom | undefined
    if (deleteChannels) {
      const members = sourceRoom.channels.flatMap((channel) => channel.members)
      for (const member of members) {
        const targetRoom = remainingRooms.find((room) => voiceRoomMemberCount(room) < room.capacity && room.channels.some((channel) => channel.members.length < channel.capacity))
        const targetChannel = targetRoom?.channels.find((channel) => channel.members.length < channel.capacity)
        if (!targetRoom || !targetChannel) return false
        targetChannel.members.push({ ...member, role: targetRoom.currentRole === 'owner' && member.id === currentSocialUser.id ? 'owner' : 'member' })
      }
      if (sourceRoom.channels.some((channel) => channel.isDefault)) {
        const fallbackDefaultId = remainingRooms.flatMap((room) => room.channels).find((channel) => !sourceRoom.channels.some((source) => source.id === channel.id))?.id
        remainingRooms = remainingRooms.map((room) => ({ ...room, channels: room.channels.map((channel) => ({ ...channel, isDefault: channel.id === fallbackDefaultId })) }))
      }
    } else {
      const unassignedRoom = remainingRooms.find((room) => room.isUngrouped)
      if (!unassignedRoom) return false
      for (const sourceChannel of sourceRoom.channels) {
        unassignedRoom.channels.push({ ...sourceChannel, members: [...sourceChannel.members] })
        if (sourceChannel.id === activeSubchannelId) activeRoomReplacement = unassignedRoom
      }
      activeRoomReplacement ??= unassignedRoom
    }
    setVoiceRooms(remainingRooms)
    if (activeVoiceRoomId === roomId) {
      const currentRoom = deleteChannels
        ? remainingRooms.find((room) => room.channels.some((channel) => channel.members.some((member) => member.id === currentSocialUser.id))) ?? remainingRooms[0]
        : activeRoomReplacement ?? remainingRooms[0]
      setActiveVoiceRoomId(currentRoom.id)
      setActiveSubchannelId(deleteChannels
        ? currentRoom.channels.find((channel) => channel.members.some((member) => member.id === currentSocialUser.id))?.id ?? currentRoom.channels[0]?.id ?? ''
        : currentRoom.channels.find((channel) => channel.id === activeSubchannelId)?.id ?? currentRoom.channels.find((channel) => channel.members.some((member) => member.id === currentSocialUser.id))?.id ?? currentRoom.channels[0]?.id ?? '')
    }
    return true
  }

  const createSubchannel = (details: Omit<VoiceSubchannel, 'id' | 'members'>, roomId?: string) => {
    const targetRoomId = roomId ?? activeVoiceRoomId
    const isUngrouped = targetRoomId === UNASSIGNED_VOICE_ROOM_ID
    const targetRoom = voiceRooms.find((room) => room.id === targetRoomId) ?? (isUngrouped ? createUnassignedVoiceRoom() : undefined)
    const capacityLimit = isUngrouped ? MAX_VOICE_CHANNEL_MEMBERS : targetRoom?.capacity ?? 0
    if (!targetRoom || !Number.isInteger(details.capacity) || details.capacity < 1 || details.capacity > capacityLimit || !Number.isSafeInteger(details.messageFrequencySeconds) || details.messageFrequencySeconds < 0 || !Number.isSafeInteger(details.micQueueDurationSeconds) || details.micQueueDurationSeconds < 1) return
    const channelId = createId('channel')
    const newChannel = { ...details, id: channelId, name: details.name.trim(), isDefault: !voiceRooms.some((room) => room.channels.some((channel) => channel.isDefault)), password: details.privacy === '私密' ? details.password : '', members: [] }
    setVoiceRooms((rooms) => rooms.some((room) => room.id === targetRoomId)
      ? rooms.map((room) => room.id !== targetRoomId ? room : { ...room, channels: [...room.channels, newChannel] })
      : [...rooms, { ...createUnassignedVoiceRoom(), channels: [newChannel] }])
    setActiveVoiceRoomId(targetRoomId)
    setActiveSubchannelId(channelId)
  }

  const updateSubchannel = (roomId: string | undefined, channelId: string, details: Omit<VoiceSubchannel, 'id' | 'members'>) => {
    const targetRoom = voiceRooms.find((item) => item.id === (roomId ?? activeVoiceRoomId))
    if (!targetRoom || !Number.isInteger(details.capacity) || details.capacity < 1 || details.capacity > targetRoom.capacity || !Number.isSafeInteger(details.messageFrequencySeconds) || details.messageFrequencySeconds < 0 || !Number.isSafeInteger(details.micQueueDurationSeconds) || details.micQueueDurationSeconds < 1) return
    const targetChannel = targetRoom.channels.find((item) => item.id === channelId)
    if (!targetChannel || details.capacity < targetChannel.members.length) return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== targetRoom.id ? room : { ...room, channels: room.channels.map((channel) => channel.id === channelId ? { ...channel, ...details, name: details.name.trim(), password: details.privacy === '私密' ? details.password : '' } : channel) }))
  }

  const deleteSubchannel = (channelId: string) => {
    if (!activeVoiceRoom || activeVoiceRoom.currentRole === 'member' || activeVoiceRoom.channels.length <= 1) return false
    const removedChannel = activeVoiceRoom.channels.find((channel) => channel.id === channelId)
    const availableCapacity = activeVoiceRoom.channels
      .filter((channel) => channel.id !== channelId)
      .reduce((total, channel) => total + channel.capacity - channel.members.length, 0)
    if (!removedChannel || removedChannel.members.length > availableCapacity) return false
    const nextDefaultId = removedChannel?.isDefault ? activeVoiceRoom.channels.find((channel) => channel.id !== channelId)?.id : undefined
    setVoiceRooms((rooms) => rooms.map((room) => {
      if (room.id !== activeVoiceRoomId) return room
      const removed = room.channels.find((channel) => channel.id === channelId)
      const remaining = room.channels.filter((channel) => channel.id !== channelId).map((channel) => ({ ...channel, members: [...channel.members] }))
      for (const member of removed?.members ?? []) {
        const target = remaining.find((channel) => channel.members.length < channel.capacity)
        if (target) target.members.push(member)
      }
      return { ...room, channels: remaining.map((channel) => removedChannel?.isDefault ? { ...channel, isDefault: channel.id === nextDefaultId } : channel) }
    }))
    if (activeSubchannelId === channelId) {
      const next = activeVoiceRoom.channels.find((channel) => channel.id !== channelId)
      setActiveSubchannelId(next?.id ?? '')
    }
    return true
  }

  const removeVoiceMember = (memberId: string) => {
    if (activeVoiceRoom?.currentRole === 'member' || memberId === currentSocialUser.id) return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.filter((member) => member.id !== memberId) })) }))
  }

  const setVoiceMemberMuted = (memberId: string) => {
    if (activeVoiceRoom?.currentRole === 'member' || memberId === currentSocialUser.id) return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.map((member) => member.id === memberId ? { ...member, muted: !member.muted } : member) })) }))
  }

  const blockVoiceMember = (memberId: string) => {
    if (activeVoiceRoom?.currentRole === 'member' || memberId === currentSocialUser.id || blockedVoiceMemberIds.includes(memberId)) return
    setBlockedVoiceMemberIds((ids) => [...ids, memberId])
    setVoiceRooms((rooms) => rooms.map((room) => ({
      ...room,
      channels: room.channels.map((channel) => ({ ...channel, members: channel.members.filter((member) => member.id !== memberId) })),
    })))
  }

  const setVoiceMemberRole = (memberId: string, role: VoiceRole) => {
    if (activeVoiceRoom?.currentRole !== 'owner') return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : {
      ...room,
      currentRole: role === 'owner' && memberId !== currentSocialUser.id ? 'member' : room.currentRole,
      channels: room.channels.map((channel) => ({ ...channel, members: channel.members.map((member) => member.id === memberId ? { ...member, role } : role === 'owner' && member.id === currentSocialUser.id ? { ...member, role: 'member' } : member) })),
    }))
  }

  const inviteFriendsToRoom = (friendIds: string[]) => friendIds.length

  const acceptVoiceInvitation = (invitation: VoiceInvitation) => {
    const room = voiceRooms.find((item) => item.id === invitation.roomId)
    if (!room) return false
    const channel = room.channels.find((item) => item.id === invitation.channelId) ?? room.channels[0]
    if (!channel) return false
    const existingRoomChannel = room.channels.find((item) => item.members.some((member) => member.id === currentSocialUser.id))
    const isAlreadyInTarget = existingRoomChannel?.id === channel.id
    const isAlreadyInTargetRoom = Boolean(existingRoomChannel)
    if (!isAlreadyInTarget && (channel.members.length >= channel.capacity || (!isAlreadyInTargetRoom && voiceRoomMemberCount(room) >= room.capacity))) return false
    const self: VoiceMember = { ...currentSocialUser, role: 'member', micOn: false, muted: false }
    setVoiceRooms((rooms) => rooms.map((item) => ({
      ...item,
      channels: item.channels.map((subchannel) => {
        if (item.id === room.id && subchannel.id === channel.id && isAlreadyInTarget) return subchannel
        const members = subchannel.members.filter((member) => member.id !== currentSocialUser.id)
        return item.id === room.id && subchannel.id === channel.id && !isAlreadyInTarget
          ? { ...subchannel, members: [...members, self] }
          : { ...subchannel, members }
      }),
    })))
    setActiveVoiceRoomId(room.id)
    setActiveSubchannelId(channel.id)
    setVoiceInvitations((items) => items.filter((item) => item.id !== invitation.id))
    return true
  }

  const ignoreVoiceInvitation = (invitationId: string) => setVoiceInvitations((items) => items.filter((item) => item.id !== invitationId))
  const toggleProfileFollow = (profileId: string) => setFollowedProfileIds((items) => items.includes(profileId) ? items.filter((id) => id !== profileId) : [...items, profileId])
  const blockProfile = (profileId: string) => setBlockedProfileIds((items) => items.includes(profileId) ? items : [...items, profileId])
  const unblockProfile = (profileId: string) => setBlockedProfileIds((items) => items.filter((id) => id !== profileId))

  return {
    shareCompanionToFriends,
    followedClubIds, toggleClubFollow, followedChannelIds, toggleChannelFollow,
    conversations, selectedConversation, selectedFriend, selectedProfile, visibleConversations, visibleFriends, clubGroups,
    followedProfileIds, blockedProfileIds, toggleProfileFollow, blockProfile, unblockProfile, profileNotes, setProfileNote,
    activeMessagesTab, setActiveMessagesTab, chatSearch, setChatSearch, selectedFriendId, setSelectedFriendId,
    activeFixedFeed, setActiveFixedFeed, groupJoinRequests, resolveGroupJoinRequest,
    selectedProfileId, setSelectedProfileId, openConversation, setConversationPinned, markConversationRead, clearConversationMessages, deleteConversation, startDirectMessage, startDirectMessageToUser, startDirectMessageWithCompanion, createGroup, inviteFriendsToGroup, renameGroup, updateGroupAvatar, setGroupAdmin, removeGroupMember, setGroupJoinApproval, setGroupMuted, leaveGroup, dissolveGroup, sendChatMessage, sendChatMessageToConversation, recallChatMessage, sendSupportCard, sendSupportCardToConversation, updateSupportReview, updateSupportReviewInConversation, applyToClubGroup, openClubGroupChat,
    voiceRooms, activeVoiceRoom, activeSubchannel, activeVoiceRoomId, activeSubchannelId, visibleVoiceRooms, nextVoiceChannelName: getNextVoiceChannelName(voiceRooms),
    roomMessages, voiceInvitations, totalUnread, isMicOn, isSelfMuted, isInVoice,
    setActiveSubchannelId: switchSubchannel, selectVoiceRoom, selectVoiceSubchannel, sendRoomMessage, recallRoomMessage, moveMember, moveVoiceMember, moveMembers, setDraggedMemberId, draggedMemberId,
    joinVoice, leaveVoice, disconnectVoiceAndSelectSubchannel, toggleMic, setVoiceMemberMic, toggleSelfMute, createVoiceRoom, renameVoiceRoom, updateVoiceRoom, moveVoiceRoom, setDefaultVoiceSubchannel, moveVoiceSubchannel, deleteVoiceRoom, createSubchannel,
    deleteSubchannel, removeVoiceMember, setVoiceMemberMuted, blockVoiceMember, setVoiceMemberRole, inviteFriendsToRoom,
    updateSubchannel,
    acceptVoiceInvitation, ignoreVoiceInvitation,
  }
}
