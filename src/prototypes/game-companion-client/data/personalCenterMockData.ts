export type PersonalVisitRecord = {
  id: string
  name: string
  initials: string
  detail: string
  time: string
}

export type ReceivedGiftRecord = {
  id: string
  sender: string
  initials: string
  giftName: string
  giftInitials: string
  count: number
  game: string
  time: string
}

export const profileFootprints: PersonalVisitRecord[] = [
  { id: 'footprint-01', name: '林间晚风', initials: '晚风', detail: '陪玩主页 · 无畏契约', time: '今天 20:16' },
  { id: 'footprint-02', name: '莓莓汽水', initials: '莓莓', detail: '陪玩主页 · 英雄联盟', time: '今天 18:42' },
  { id: 'footprint-03', name: '松果同学', initials: '松果', detail: '玩家主页', time: '昨天 22:08' },
  { id: 'footprint-04', name: '折光', initials: '折光', detail: '陪玩主页 · 无畏契约', time: '昨天 19:35' },
]

export const profileVisitors: PersonalVisitRecord[] = [
  { id: 'visitor-01', name: '青柠汽水', initials: '柠', detail: '玩家主页', time: '今天 21:02' },
  { id: 'visitor-02', name: '云端指挥官', initials: '云端', detail: '陪玩主页', time: '今天 17:26' },
  { id: 'visitor-03', name: '北岸', initials: '北', detail: '玩家主页', time: '昨天 23:14' },
]

export const profileRoomVisits: PersonalVisitRecord[] = [
  { id: 'room-visit-01', name: '今晚冲分', initials: '冲', detail: '主频道 · 无畏契约', time: '今天 20:40' },
  { id: 'room-visit-02', name: '周末五排', initials: '五', detail: '五排集合 · 英雄联盟', time: '昨天 21:18' },
  { id: 'room-visit-03', name: '好友闲聊', initials: '友', detail: '主频道', time: '昨天 16:50' },
]

export const receivedGiftRecords: ReceivedGiftRecord[] = [
  { id: 'received-gift-01', sender: '青柠汽水', initials: '柠', giftName: '星光徽章', giftInitials: '星', count: 3, game: '无畏契约', time: '今天 20:05' },
  { id: 'received-gift-02', sender: '北岸', initials: '北', giftName: '热烈掌声', giftInitials: '掌', count: 1, game: '英雄联盟', time: '昨天 22:12' },
  { id: 'received-gift-03', sender: '一颗小行星', initials: '星', giftName: '能量补给', giftInitials: '能', count: 2, game: '绝地求生', time: '10月25日 19:46' },
]
