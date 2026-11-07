import type { Club, Companion, Service } from './mockData'

const extraClubSeeds = [
  ['club-qm-001', '赤曜战队', '赤曜'],
  ['club-qm-002', '极夜先锋', '极夜'],
  ['club-qm-003', '风暴前线', '风暴'],
  ['club-qm-004', '白塔竞技社', '白塔'],
  ['club-qm-005', '霜刃俱乐部', '霜刃'],
  ['club-qm-006', '苍穹作战室', '苍穹'],
  ['club-qm-007', '银翼小队', '银翼'],
  ['club-qm-008', '烬火集结地', '烬火'],
  ['club-qm-009', '星轨战术组', '星轨'],
  ['club-qm-010', '深空突击队', '深空'],
  ['club-qm-011', '黎明攻坚社', '黎明'],
  ['club-qm-012', '逐风竞技团', '逐风'],
] as const

export const quickMatchClubs: Club[] = extraClubSeeds.map(([id, name, initials], index) => ({
  id,
  name,
  initials,
  selfOperated: false,
  rating: 4.6,
  tags: ['竞技强队'],
  intro: '专注团队配合与战术交流。',
  gameIds: ['valorant'],
  companionCount: 8 + index,
  featured: false,
  followed: false,
}))

export const quickMatchCompanions: Companion[] = extraClubSeeds.map(([clubId, name, initials], index) => ({
  id: `companion-qm-${String(index + 1).padStart(3, '0')}`,
  realNameVerified: true,
  onlineStatus: '在线',
  clubId,
  name: `${name}陪玩`,
  initials,
  gender: index % 2 === 0 ? '女' : '男',
  age: 22 + index % 8,
  rating: 4.9,
  status: '接单中',
  region: '杭州',
  tags: ['默契配合', '稳定在线'],
  intro: '熟悉团队配合，沟通清晰。',
  gameIds: ['valorant'],
  orderCount: 120 + index * 16,
}))

export const quickMatchServicesByCompanion: Record<string, Service[]> = Object.fromEntries(
  quickMatchCompanions.map((companion, index) => [companion.id, [
    { id: `${companion.id}-service-001`, gameId: 'valorant', playName: '默契排位', levelName: '进阶场', orderCount: 36 + index, rating: 4.9, price: 80 + index * 5, unit: '小时', canAcceptOrders: true },
    { id: `${companion.id}-service-002`, gameId: 'valorant', playName: '默契排位', levelName: '标准场', orderCount: 28 + index, rating: 4.88, price: 70 + index * 5, unit: '局', canAcceptOrders: true },
    { id: `${companion.id}-service-003`, gameId: 'valorant', playName: '轻松娱乐', levelName: '娱乐局', orderCount: 19 + index, rating: 4.86, price: 60 + index * 5, unit: '小时', canAcceptOrders: true },
  ]]),
)
