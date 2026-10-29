export type WealthLevel = {
  level: number
  requiredWealth: number
  profileStyle: string
  entranceEffect: string
  weeklyGift: string
  giftDiscount: string
}

export const currentWealthLevel = 4
export const currentWealthValue = 8600

const fixedMockLevels: Record<string, number> = {
  player: 4,
  'P-102860': 4,
  'P-102861': 5,
  'P-102862': 5,
  'P-102863': 4,
  'P-102864': 2,
  'P-102865': 3,
  'P-102866': 3,
  '林小满': 4,
  '晚风玩家': 4,
  '林间晚风': 5,
  '晚风': 5,
  '莓莓汽水': 5,
  '青柠汽水': 5,
  '北纬三十度': 4,
  '北岸': 4,
  '松果同学': 3,
  '折光': 4,
  '云端指挥官': 3,
  '晚睡选手': 3,
  '汽水不加冰': 2,
  '凌晨四点': 2,
  '一颗糖': 2,
  '小熊饼干': 3,
  'companion-001': 5,
  'P-001': 5,
  'companion-002': 4,
  'P-002': 4,
  'companion-003': 3,
  'P-003': 3,
  'companion-004': 5,
  'P-004': 5,
  'companion-005': 3,
  'P-005': 3,
  'companion-006': 4,
  'P-006': 4,
  'companion-007': 2,
  'P-007': 2,
  'companion-008': 3,
  'P-008': 3,
  'companion-009': 2,
  'P-009': 2,
  'friend-1': 5,
  'friend-2': 5,
  'friend-3': 4,
  'friend-4': 2,
  'friend-5': 3,
  'friend-6': 3,
}

export function getMockWealthLevel(identityId: string): number {
  const knownLevel = fixedMockLevels[identityId]
  if (knownLevel) return knownLevel
  const hash = [...identityId].reduce((total, character) => total + character.charCodeAt(0), 0)
  return hash % 6 + 1
}

export const wealthLevels: WealthLevel[] = [
  { level: 1, requiredWealth: 0, profileStyle: '基础标识', entranceEffect: '—', weeklyGift: '—', giftDiscount: '—' },
  { level: 2, requiredWealth: 1000, profileStyle: '进阶标识', entranceEffect: '基础进场效果', weeklyGift: '—', giftDiscount: '—' },
  { level: 3, requiredWealth: 3000, profileStyle: '银色标识', entranceEffect: '基础进场效果', weeklyGift: '每周 1 份', giftDiscount: '—' },
  { level: 4, requiredWealth: 6000, profileStyle: '金色标识', entranceEffect: '进阶进场效果', weeklyGift: '每周 2 份', giftDiscount: '—' },
  { level: 5, requiredWealth: 12000, profileStyle: '星耀标识', entranceEffect: '专属进场效果', weeklyGift: '每周 3 份', giftDiscount: '赠礼 95 折' },
  { level: 6, requiredWealth: 30000, profileStyle: '典藏标识', entranceEffect: '典藏进场效果', weeklyGift: '每周 5 份', giftDiscount: '赠礼 9 折' },
]
