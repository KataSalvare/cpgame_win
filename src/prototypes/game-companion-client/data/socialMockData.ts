export type ChatMessageKind = 'text' | 'emoji' | 'image' | 'voice'

export interface SocialFriend {
  id: string
  name: string
  initials: string
  status: string
  online: boolean
  role?: string
  companionId?: string
  gender: '女' | '男'
  age: number
  profileId: string
  rating: number
  tags: string[]
  intro: string
}

export interface SocialMessage {
  id: string
  senderId: string
  senderName: string
  initials: string
  time: string
  kind: ChatMessageKind
  content: string
  duration?: number
  replyTo?: { senderName: string; content: string; kind: ChatMessageKind }
}

export interface SocialConversation {
  id: string
  kind: 'direct' | 'group'
  title: string
  initials: string
  members: string[]
  unread: number
  messages: SocialMessage[]
  clubGroupId?: string
  ownerId?: string
  adminIds?: string[]
  joinApprovalRequired?: boolean
}

export type VoiceRole = 'owner' | 'admin' | 'member'
export const MAX_VOICE_CHANNEL_MEMBERS = 8

export interface VoiceMember {
  id: string
  name: string
  initials: string
  role: VoiceRole
  micOn: boolean
  muted: boolean
}

export interface VoiceSubchannel {
  id: string
  name: string
  capacity: number
  privacy: '公开' | '私密'
  password: string
  members: VoiceMember[]
}

export interface VoiceRoom {
  id: string
  name: string
  privacy: '公开' | '私密'
  currentRole: VoiceRole
  channels: VoiceSubchannel[]
}

export interface VoiceInvitation {
  id: string
  roomId: string
  roomName: string
  inviter: string
  time: string
}

export const currentSocialUser = { id: 'player', name: '林小满', initials: '满', gender: '女' as const, age: 24, profileId: 'P-102860', rating: 4.96, tags: ['稳定在线', '团队协作'], intro: '喜欢和熟悉的队友一起开黑，沟通配合，享受每一局。', status: '在线', online: true }

export const socialFriends: SocialFriend[] = [
  { id: 'friend-1', companionId: 'companion-001', name: '晚风', initials: '风', status: '正在玩《星域突围》', online: true, role: '好友', gender: '女', age: 24, profileId: 'P-102861', rating: 4.99, tags: ['战术指挥', '稳定在线'], intro: '擅长信息沟通和团队配合，节奏清晰，交流轻松。' },
  { id: 'friend-2', companionId: 'companion-004', name: '青柠汽水', initials: '柠', status: '在线', online: true, role: '好友', gender: '女', age: 22, profileId: 'P-102862', rating: 4.97, tags: ['轻松聊天', '新手友好'], intro: '喜欢轻松开黑，也乐于陪队友熟悉玩法。' },
  { id: 'friend-3', companionId: 'companion-002', name: '北岸', initials: '北', status: '组队中', online: true, role: '好友', gender: '男', age: 27, profileId: 'P-102863', rating: 4.96, tags: ['团队协作', '思路清晰'], intro: '熟悉地图点位，重视沟通和团队配合。' },
  { id: 'friend-4', companionId: 'companion-007', name: '一颗糖', initials: '糖', status: '2 小时前在线', online: false, role: '好友', gender: '女', age: 23, profileId: 'P-102864', rating: 4.93, tags: ['周末组队', '轻松娱乐'], intro: '喜欢探索新玩法，周末经常和好友组队。' },
  { id: 'friend-5', companionId: 'companion-008', name: '小熊饼干', initials: '熊', status: '在线', online: true, role: '好友', gender: '女', age: 25, profileId: 'P-102865', rating: 4.98, tags: ['耐心教学', '稳定在线'], intro: '愿意分享游戏经验，喜欢默契配合的队伍。' },
  { id: 'friend-6', companionId: 'companion-005', name: '阿澈', initials: '澈', status: '昨天在线', online: false, role: '好友', gender: '男', age: 26, profileId: 'P-102866', rating: 4.92, tags: ['娱乐开黑', '声音好听'], intro: '主打轻松氛围和稳定配合。' },
]

const seedMessages: SocialMessage[] = [
  { id: 'msg-1', senderId: 'friend-1', senderName: '晚风', initials: '风', time: '19:42', kind: 'text', content: '今晚要不要一起打排位？' },
  { id: 'msg-2', senderId: 'player', senderName: '林小满', initials: '满', time: '19:43', kind: 'text', content: '好呀，我刚好有空。' },
  { id: 'msg-3', senderId: 'friend-1', senderName: '晚风', initials: '风', time: '19:43', kind: 'emoji', content: '收到，房间里见' },
  { id: 'msg-4', senderId: 'friend-1', senderName: '晚风', initials: '风', time: '19:44', kind: 'voice', content: '语音消息', duration: 8 },
]

export const initialConversations: SocialConversation[] = [
  { id: 'direct-friend-1', kind: 'direct', title: '晚风', initials: '风', members: ['friend-1'], unread: 2, messages: seedMessages },
  {
    id: 'group-squad', kind: 'group', title: '周末五排小队', initials: '五', members: ['friend-1', 'friend-2', 'friend-3', 'friend-5'], unread: 1, ownerId: 'player', adminIds: ['friend-1'], joinApprovalRequired: true,
    messages: [
      { id: 'gmsg-1', senderId: 'friend-2', senderName: '青柠汽水', initials: '柠', time: '18:26', kind: 'text', content: '我拉了一个新房间，大家到了说一声。' },
      { id: 'gmsg-2', senderId: 'friend-3', senderName: '北岸', initials: '北', time: '18:31', kind: 'image', content: '战绩截图' },
      { id: 'gmsg-3', senderId: 'friend-5', senderName: '小熊饼干', initials: '熊', time: '18:32', kind: 'text', content: '这把阵容不错！' },
    ],
  },
  { id: 'direct-friend-2', kind: 'direct', title: '青柠汽水', initials: '柠', members: ['friend-2'], unread: 0, messages: [{ id: 'cmsg-1', senderId: 'friend-2', senderName: '青柠汽水', initials: '柠', time: '昨天', kind: 'text', content: '下次一起玩呀。' }] },
]

const voiceMember = (friend: SocialFriend, role: VoiceRole = 'member'): VoiceMember => ({ ...friend, role, micOn: true, muted: false })

export const initialVoiceRooms: VoiceRoom[] = [
  {
    id: 'room-ranked', name: '分组A', privacy: '公开', currentRole: 'owner',
    channels: [
      { id: 'channel-main', name: '房间A', capacity: MAX_VOICE_CHANNEL_MEMBERS, privacy: '公开', password: '', members: [{ id: 'player', name: '林小满', initials: '满', role: 'owner', micOn: true, muted: false }, voiceMember(socialFriends[0], 'admin'), voiceMember(socialFriends[2]), voiceMember(socialFriends[4])] },
      { id: 'channel-warmup', name: '房间B', capacity: MAX_VOICE_CHANNEL_MEMBERS, privacy: '公开', password: '', members: [voiceMember(socialFriends[1]), voiceMember(socialFriends[3])] },
    ],
  },
  {
    id: 'room-weekend', name: '分组B', privacy: '公开', currentRole: 'admin',
    channels: [{ id: 'channel-weekend', name: '房间A', capacity: MAX_VOICE_CHANNEL_MEMBERS, privacy: '公开', password: '', members: [voiceMember(socialFriends[0], 'owner'), { id: 'player', name: '林小满', initials: '满', role: 'admin', micOn: true, muted: false }, voiceMember(socialFriends[2]), voiceMember(socialFriends[5])] }],
  },
  {
    id: 'room-friends', name: '分组C', privacy: '私密', currentRole: 'member',
    channels: [{ id: 'channel-friends', name: '房间A', capacity: MAX_VOICE_CHANNEL_MEMBERS, privacy: '私密', password: '', members: [voiceMember(socialFriends[1], 'owner'), voiceMember(socialFriends[3], 'admin')] }],
  },
]

export const initialRoomMessages: SocialMessage[] = [
  { id: 'room-msg-1', senderId: 'friend-1', senderName: '晚风', initials: '风', time: '20:06', kind: 'text', content: '我先去房间B调一下灵敏度。' },
  { id: 'room-msg-2', senderId: 'player', senderName: '林小满', initials: '满', time: '20:07', kind: 'text', content: '好，等大家齐了就开。' },
  { id: 'room-msg-3', senderId: 'friend-3', senderName: '北岸', initials: '北', time: '20:08', kind: 'text', content: '收到，等我整理一下装备。' },
]

export const initialRoomMessagesByRoom: Record<string, SocialMessage[]> = {
  'room-ranked': initialRoomMessages,
  'room-weekend': [{ id: 'weekend-msg-1', senderId: 'friend-3', senderName: '北岸', initials: '北', time: '19:58', kind: 'text', content: '先在这里等两位队友。' }],
  'room-friends': [{ id: 'friends-msg-1', senderId: 'friend-2', senderName: '青柠汽水', initials: '柠', time: '20:02', kind: 'text', content: '进来后去房间A吧。' }],
}

export const initialVoiceInvitations: VoiceInvitation[] = [
  { id: 'invite-1', roomId: 'room-friends', roomName: '分组C', inviter: '青柠汽水', time: '刚刚' },
]
