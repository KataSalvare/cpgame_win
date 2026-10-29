import { initialOrders, type ClientOrder } from './accountMockData'

export type ChatMessageKind = 'text' | 'emoji' | 'image' | 'voice' | 'order' | 'support-review'

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
  order?: { id: string; companion: string; service: string; duration: string; amount: number; status: string }
  review?: { support: string; rating: number; submitted: boolean }
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
  pinned?: boolean
  muted?: boolean
  avatarDataUrl?: string
  self?: { id: string; name: string; initials: string }
  supportAction?: 'order' | 'support-review'
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
  ownerType?: 'club' | 'personal'
  clubId?: string
  ownerId?: string
  channels: VoiceSubchannel[]
}

export interface VoiceInvitation {
  id: string
  roomId: string
  roomName: string
  channelId?: string
  channelName?: string
  inviter: string
  inviterInitials?: string
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

// 示例拉黑记录会在个人中心黑名单中展示，并同步影响对应陪玩资料卡。
export const initialBlockedProfileIds = ['companion-003', 'companion-006']

const seedMessages: SocialMessage[] = [
  { id: 'msg-1', senderId: 'friend-1', senderName: '晚风', initials: '风', time: '19:42', kind: 'text', content: '今晚要不要一起打排位？' },
  { id: 'msg-2', senderId: 'player', senderName: '林小满', initials: '满', time: '19:43', kind: 'text', content: '好呀，我刚好有空。' },
  { id: 'msg-3', senderId: 'friend-1', senderName: '晚风', initials: '风', time: '19:43', kind: 'emoji', content: '收到，房间里见' },
  { id: 'msg-4', senderId: 'friend-1', senderName: '晚风', initials: '风', time: '19:44', kind: 'voice', content: '语音消息', duration: 8 },
]

export const orderMessageFromOrder = (order: ClientOrder): Pick<SocialMessage, 'kind' | 'content' | 'order'> => ({
  kind: 'order', content: `[订单] ${order.gameName} · ${order.serviceName}`,
  order: { id: order.id, companion: order.companionName, service: `${order.gameName} · ${order.levelName} · ${order.serviceName}`, duration: `${order.duration} ${order.durationUnit}`, amount: order.amount, status: order.status },
})
export const supportOrderSample = orderMessageFromOrder(initialOrders[2])
export const supportReviewSample: Pick<SocialMessage, 'kind' | 'content' | 'review'> = {
  kind: 'support-review', content: '[客服评价] 待评价',
  review: { support: 'GM-客服', rating: 0, submitted: false },
}
const supportIdentity = { id: 'club-support', name: 'GM-客服', initials: 'GM' }
const customerIdentity = { id: 'customer-kata', name: '卡塔', initials: '卡' }

export const initialConversations: SocialConversation[] = [
  {
    id: 'direct-club-support', kind: 'direct', title: 'GM-客服-用户视角', initials: 'GM', members: ['club-support'], unread: 0, supportAction: 'order',
    messages: [
      { id: 'support-1', senderId: 'player', senderName: currentSocialUser.name, initials: currentSocialUser.initials, time: '14:20', kind: 'text', content: '你好，想咨询一下这笔订单。' },
      { id: 'support-2', senderId: 'club-support', senderName: 'GM-客服', initials: 'GM', time: '14:21', kind: 'text', content: '您好，请发送订单，我帮您查看。' },
      { id: 'support-3', senderId: 'player', senderName: currentSocialUser.name, initials: currentSocialUser.initials, time: '14:22', ...supportOrderSample },
      { id: 'support-4', senderId: 'club-support', senderName: 'GM-客服', initials: 'GM', time: '14:23', kind: 'text', content: '已为您核实，陪玩正在服务中，有其他问题随时联系我。' },
      { id: 'support-5', senderId: supportIdentity.id, senderName: supportIdentity.name, initials: supportIdentity.initials, time: '14:25', ...supportReviewSample },
    ],
  },
  {
    id: 'direct-customer-kata', kind: 'direct', title: '卡塔-客服视角', initials: '卡', members: ['customer-kata'], unread: 0, self: supportIdentity, supportAction: 'support-review',
    messages: [
      { id: 'kata-1', senderId: customerIdentity.id, senderName: '卡塔', initials: '卡', time: '15:10', kind: 'text', content: '你好，帮我看一下这笔订单。' },
      { id: 'kata-2', senderId: customerIdentity.id, senderName: '卡塔', initials: '卡', time: '15:11', ...supportOrderSample },
      { id: 'kata-3', senderId: supportIdentity.id, senderName: supportIdentity.name, initials: 'GM', time: '15:12', kind: 'text', content: '您好，已收到订单，我来为您处理。' },
      { id: 'kata-4', senderId: supportIdentity.id, senderName: supportIdentity.name, initials: supportIdentity.initials, time: '15:16', ...supportReviewSample },
    ],
  },
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
    id: 'room-ranked', name: '分组A', privacy: '公开', currentRole: 'owner', ownerType: 'club', clubId: 'club-001',
    channels: [
      { id: 'channel-main', name: '房间A', capacity: MAX_VOICE_CHANNEL_MEMBERS, privacy: '公开', password: '', members: [{ id: 'player', name: '林小满', initials: '满', role: 'owner', micOn: true, muted: false }, voiceMember(socialFriends[0], 'admin'), voiceMember(socialFriends[2]), voiceMember(socialFriends[4])] },
      { id: 'channel-warmup', name: '房间B', capacity: MAX_VOICE_CHANNEL_MEMBERS, privacy: '公开', password: '', members: [voiceMember(socialFriends[1]), voiceMember(socialFriends[3])] },
    ],
  },
  {
    id: 'room-weekend', name: '分组B', privacy: '公开', currentRole: 'admin', ownerType: 'personal', ownerId: 'friend-1',
    channels: [{ id: 'channel-weekend', name: '房间A', capacity: MAX_VOICE_CHANNEL_MEMBERS, privacy: '公开', password: '', members: [voiceMember(socialFriends[0], 'owner'), { id: 'player', name: '林小满', initials: '满', role: 'admin', micOn: true, muted: false }, voiceMember(socialFriends[2]), voiceMember(socialFriends[5])] }],
  },
  {
    id: 'room-friends', name: '分组C', privacy: '私密', currentRole: 'member', ownerType: 'personal', ownerId: 'friend-2',
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
  { id: 'invite-1', roomId: 'room-friends', roomName: '分组C', channelId: 'channel-friends', channelName: '房间A', inviter: '青柠汽水', inviterInitials: '柠', time: '刚刚' },
]

export type VoiceCallNotification = {
  id: string
  callerName: string
  callerInitials: string
  roomId: string
  channelId: string
  roomName: string
  channelName: string
}

export const initialVoiceCallNotifications: VoiceCallNotification[] = [
  { id: 'voice-call-001', callerName: '晚风', callerInitials: '风', roomId: 'room-ranked', channelId: 'channel-main', roomName: '分组A', channelName: '房间A' },
  { id: 'voice-call-002', callerName: '青柠汽水', callerInitials: '柠', roomId: 'room-ranked', channelId: 'channel-warmup', roomName: '分组A', channelName: '房间B' },
  { id: 'voice-call-003', callerName: '北岸', callerInitials: '北', roomId: 'room-weekend', channelId: 'channel-weekend', roomName: '分组B', channelName: '房间A' },
]

export const initialSupportQueue = [
  { id: 'support-user-1', name: '青柠汽水', initials: '柠' },
  { id: 'support-user-2', name: '北岸', initials: '北' },
  { id: 'support-user-3', name: '小熊饼干', initials: '熊' },
]

export type FixedMessageFeed = 'activities' | 'system' | 'groups'
export const fixedMessageFeeds: { id: FixedMessageFeed; title: string; summary: string }[] = [
  { id: 'activities', title: '活动公告', summary: '查看平台与俱乐部最新活动' },
  { id: 'system', title: '系统通知', summary: '服务规范、维护及账号消息' },
  { id: 'groups', title: '群通知', summary: '入群申请与处理结果' },
]
export const systemMessageNotifications = [
  { id: 'system-1', icon: 'shield', title: '账号登录提醒', summary: '您的账号已在当前 Windows 客户端登录。', time: '2026-10-29 14:00' },
  { id: 'system-2', icon: 'rules', title: '陪玩服务规范更新说明', summary: '服务评价与订单沟通规范将于本周更新，请留意平台公告。', time: '2026-10-27 16:30' },
  { id: 'system-3', icon: 'maintenance', title: '客户端维护时间调整', summary: '维护时段为 2026-10-28 23:30 至 2026-10-29 01:00。', time: '2026-10-27 12:00' },
] as const
export type GroupJoinRequest = { id: string; conversationId: string; groupName: string; applicantId: string; name: string; initials: string; reason: string; time: string; status: 'pending' | 'approved' | 'rejected' }
export const initialGroupJoinRequests: GroupJoinRequest[] = [
  { id: 'join-1', conversationId: 'group-squad', groupName: '周末五排小队', applicantId: 'friend-4', name: '一颗糖', initials: '糖', reason: '周末想和大家一起组队开黑。', time: '2026-10-29 14:20', status: 'pending' },
  { id: 'join-2', conversationId: 'group-squad', groupName: '周末五排小队', applicantId: 'friend-6', name: '阿澈', initials: '澈', reason: '朋友推荐，希望加入小队。', time: '2026-10-29 13:45', status: 'pending' },
]
