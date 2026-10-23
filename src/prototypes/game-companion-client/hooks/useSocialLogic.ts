import { useMemo, useState } from 'react'
import {
  currentSocialUser,
  initialConversations,
  initialRoomMessagesByRoom,
  initialVoiceInvitations,
  initialVoiceRooms,
  socialFriends,
  type ChatMessageKind,
  type SocialConversation,
  type SocialMessage,
  type VoiceInvitation,
  type VoiceMember,
  type VoiceRole,
  type VoiceRoom,
} from '../data/socialMockData'
import { companions } from '../data/mockData'

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`

export function useSocialLogic() {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversations[0].id)
  const [activeMessagesTab, setActiveMessagesTab] = useState<'messages' | 'friends'>('messages')
  const [chatSearch, setChatSearch] = useState('')
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [voiceRooms, setVoiceRooms] = useState(initialVoiceRooms)
  const [activeVoiceRoomId, setActiveVoiceRoomId] = useState(initialVoiceRooms[0].id)
  const [activeSubchannelId, setActiveSubchannelId] = useState(initialVoiceRooms[0].channels[0].id)
  const [roomMessagesByRoom, setRoomMessagesByRoom] = useState(initialRoomMessagesByRoom)
  const [voiceInvitations, setVoiceInvitations] = useState(initialVoiceInvitations)
  const [roomSearch, setRoomSearch] = useState('')
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null)

  const selectedConversation = conversations.find((item) => item.id === selectedConversationId) ?? conversations[0]
  const selectedFriend = socialFriends.find((friend) => friend.id === selectedFriendId) ?? null
  const selectedProfile = selectedProfileId === currentSocialUser.id
    ? { ...currentSocialUser, status: '在线', online: true }
    : socialFriends.find((friend) => friend.id === selectedProfileId) ?? null
  const visibleConversations = useMemo(() => {
    const query = chatSearch.trim().toLocaleLowerCase()
    return conversations.filter((item) => !query || item.title.toLocaleLowerCase().includes(query))
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
    const query = roomSearch.trim().toLocaleLowerCase()
    return voiceRooms.filter((room) => {
      const isMember = room.channels.some((channel) => channel.members.some((member) => member.id === currentSocialUser.id))
      const hasInvitation = voiceInvitations.some((invitation) => invitation.roomId === room.id)
      const canDiscover = room.privacy === '公开' || isMember || hasInvitation
      return canDiscover && (!query || room.name.toLocaleLowerCase().includes(query))
    })
  }, [roomSearch, voiceRooms, voiceInvitations])
  const totalUnread = conversations.reduce((sum, item) => sum + item.unread, 0)

  const updateMessages = (conversationId: string, makeMessage: (id: string, time: string) => SocialMessage) => {
    const id = createId('message')
    setConversations((items) => items.map((conversation) => conversation.id === conversationId
      ? { ...conversation, unread: 0, messages: [...conversation.messages, makeMessage(id, '现在')] }
      : conversation))
  }

  const openConversation = (conversation: SocialConversation) => {
    setSelectedConversationId(conversation.id)
    setSelectedFriendId(null)
    setConversations((items) => items.map((item) => item.id === conversation.id ? { ...item, unread: 0 } : item))
  }

  const startDirectMessage = (friendId: string) => {
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

  const startDirectMessageWithCompanion = (companionId: string) => {
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
      id: createId('group'), kind: 'group', title: name.trim(), initials: name.trim().slice(0, 1) || '群', members, unread: 0,
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
    setConversations((items) => items.map((conversation) => conversation.id === conversationId && conversation.kind === 'group'
      ? { ...conversation, title, initials: title.slice(0, 1) }
      : conversation))
  }

  const sendChatMessage = (kind: ChatMessageKind, content: string, duration?: number) => {
    if (!selectedConversation || !content.trim()) return
    updateMessages(selectedConversation.id, (id, time) => ({ id, senderId: currentSocialUser.id, senderName: currentSocialUser.name, initials: currentSocialUser.initials, time, kind, content, duration }))
  }

  const sendRoomMessage = (kind: ChatMessageKind, content: string, duration?: number) => {
    if (!content.trim()) return
    setRoomMessagesByRoom((items) => ({ ...items, [activeVoiceRoomId]: [...(items[activeVoiceRoomId] ?? []), { id: createId('room-message'), senderId: currentSocialUser.id, senderName: currentSocialUser.name, initials: currentSocialUser.initials, time: '现在', kind, content, duration }] }))
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
      if (!sourceChannel || !targetChannel || sourceChannel.id === targetChannelId || targetChannel.members.length >= 8) return room
      const member = sourceChannel.members.find((item) => item.id === memberId)
      if (!member) return room
      return { ...room, channels: room.channels.map((channel) => channel.id === sourceChannel.id
        ? { ...channel, members: channel.members.filter((item) => item.id !== memberId) }
        : channel.id === targetChannelId ? { ...channel, members: [...channel.members, member] } : channel) }
    }))
  }

  const switchSubchannel = (channelId: string) => {
    if (!activeVoiceRoom) return
    const target = activeVoiceRoom.channels.find((item) => item.id === channelId)
    const current = activeVoiceRoom.channels.find((channel) => channel.members.some((member) => member.id === currentSocialUser.id))
    if (current && target && current.id !== target.id && target.members.length < 8) moveMember(currentSocialUser.id, target.id)
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
    if (activeSubchannel.members.length >= 8) return
    const self: VoiceMember = { ...currentSocialUser, role: activeVoiceRoom.currentRole, micOn: true, muted: false }
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoom.id ? room : { ...room, channels: room.channels.map((channel) => channel.id === activeSubchannel.id ? { ...channel, members: [...channel.members, self] } : channel) }))
  }

  const leaveVoice = () => {
    if (!activeVoiceRoom) return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoom.id ? room : { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.filter((member) => member.id !== currentSocialUser.id) })) }))
  }

  const toggleMic = () => {
    if (!isInVoice) return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.map((member) => member.id === currentSocialUser.id ? { ...member, micOn: !member.micOn } : member) })) }))
  }

  const toggleSelfMute = () => {
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => ({ ...channel, members: channel.members.map((member) => member.id === currentSocialUser.id ? { ...member, muted: !member.muted } : member) })) }))
  }

  const createVoiceRoom = (name: string, privacy: VoiceRoom['privacy']) => {
    const roomId = createId('room')
    const channelId = createId('channel')
    const room: VoiceRoom = { id: roomId, name: name.trim(), privacy, currentRole: 'owner', channels: [{ id: channelId, name: '主频道', members: [{ ...currentSocialUser, role: 'owner', micOn: true, muted: false }] }] }
    setVoiceRooms((items) => [room, ...items])
    setActiveVoiceRoomId(roomId)
    setActiveSubchannelId(channelId)
  }

  const renameVoiceRoom = (name: string) => setVoiceRooms((rooms) => rooms.map((room) => room.id === activeVoiceRoomId ? { ...room, name: name.trim() } : room))

  const updateVoiceRoom = (name: string, privacy: VoiceRoom['privacy']) => setVoiceRooms((rooms) => rooms.map((room) => room.id === activeVoiceRoomId ? { ...room, name: name.trim(), privacy } : room))

  const createSubchannel = (name: string, roomId?: string) => {
    const targetRoomId = roomId ?? activeVoiceRoomId
    const targetRoom = voiceRooms.find((room) => room.id === targetRoomId)
    if (!targetRoom || targetRoom.currentRole !== 'owner') return
    const channelId = createId('channel')
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== targetRoomId ? room : { ...room, channels: [...room.channels, { id: channelId, name: name.trim(), members: [] }] }))
    setActiveVoiceRoomId(targetRoomId)
    setActiveSubchannelId(channelId)
  }

  const renameSubchannel = (channelId: string, name: string) => {
    if (activeVoiceRoom?.currentRole === 'member') return
    setVoiceRooms((rooms) => rooms.map((room) => room.id !== activeVoiceRoomId ? room : { ...room, channels: room.channels.map((channel) => channel.id === channelId ? { ...channel, name: name.trim() } : channel) }))
  }

  const deleteSubchannel = (channelId: string) => {
    if (!activeVoiceRoom || activeVoiceRoom.currentRole === 'member' || activeVoiceRoom.channels.length <= 1) return false
    setVoiceRooms((rooms) => rooms.map((room) => {
      if (room.id !== activeVoiceRoomId) return room
      const removed = room.channels.find((channel) => channel.id === channelId)
      const remaining = room.channels.filter((channel) => channel.id !== channelId).map((channel) => ({ ...channel, members: [...channel.members] }))
      for (const member of removed?.members ?? []) {
        const target = remaining.find((channel) => channel.members.length < 8)
        if (target) target.members.push(member)
      }
      return { ...room, channels: remaining }
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
    if (!room) return
    const channel = room.channels[0]
    if (channel.members.length < 8 && !room.channels.some((item) => item.members.some((member) => member.id === currentSocialUser.id))) {
      const self: VoiceMember = { ...currentSocialUser, role: 'member', micOn: false, muted: false }
      setVoiceRooms((rooms) => rooms.map((item) => item.id !== room.id ? item : { ...item, channels: item.channels.map((subchannel) => subchannel.id === channel.id ? { ...subchannel, members: [...subchannel.members, self] } : subchannel) }))
    }
    setActiveVoiceRoomId(room.id)
    setActiveSubchannelId(channel.id)
    setVoiceInvitations((items) => items.filter((item) => item.id !== invitation.id))
  }

  const ignoreVoiceInvitation = (invitationId: string) => setVoiceInvitations((items) => items.filter((item) => item.id !== invitationId))

  return {
    conversations, selectedConversation, selectedFriend, selectedProfile, visibleConversations, visibleFriends,
    activeMessagesTab, setActiveMessagesTab, chatSearch, setChatSearch, selectedFriendId, setSelectedFriendId,
    selectedProfileId, setSelectedProfileId, openConversation, startDirectMessage, startDirectMessageWithCompanion, createGroup, inviteFriendsToGroup, renameGroup, sendChatMessage,
    voiceRooms, activeVoiceRoom, activeSubchannel, activeVoiceRoomId, activeSubchannelId, visibleVoiceRooms,
    roomSearch, setRoomSearch, roomMessages, voiceInvitations, totalUnread, isMicOn, isSelfMuted, isInVoice,
    setActiveSubchannelId: switchSubchannel, selectVoiceRoom, selectVoiceSubchannel, sendRoomMessage, moveMember, setDraggedMemberId, draggedMemberId,
    joinVoice, leaveVoice, toggleMic, toggleSelfMute, createVoiceRoom, renameVoiceRoom, updateVoiceRoom, createSubchannel, renameSubchannel,
    deleteSubchannel, removeVoiceMember, setVoiceMemberMuted, setVoiceMemberRole, inviteFriendsToRoom,
    acceptVoiceInvitation, ignoreVoiceInvitation,
  }
}
