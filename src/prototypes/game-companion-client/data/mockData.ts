export type Game = { id: string; name: string; shortName: string }

export type Banner = {
  id: string
  eyebrow: string
  title: string
  description: string
  actionLabel: string
}

export type Club = {
  id: string
  name: string
  initials: string
  selfOperated: boolean
  rating: number
  tags: string[]
  intro: string
  gameIds: string[]
  companionCount: number
  featured: boolean
  followed: boolean
}

export type Companion = {
  realNameVerified: boolean
  id: string
  clubId: string
  name: string
  initials: string
  gender: '女' | '男'
  age: number
  rating: number
  onlineStatus: '在线' | '离线'
  status: '接单中' | '服务中' | '暂不接单'
  region: string
  tags: string[]
  intro: string
  voiceMessage?: VoiceMessage
  gameIds: string[]
  orderCount: number
}

export type Service = {
  id: string
  gameId: string
  playName: string
  levelName: string
  orderCount: number
  rating: number
  price: number
  unit: '小时' | '局'
  canAcceptOrders: boolean
  voiceMessage?: VoiceMessage
}

export type VoiceMessage = { text: string; duration: number }

export type Review = {
  id: string
  author: string
  initials: string
  rating: number
  date: string
  game: string
  content: string
}

export type Gift = { id: string; name: string; initials: string; count: number; description: string; price: number }

export const games: Game[] = [
  { id: 'all', name: '全部游戏', shortName: '全部' },
  { id: 'valorant', name: '无畏契约', shortName: 'VAL' },
  { id: 'lol', name: '英雄联盟', shortName: 'LOL' },
  { id: 'pubg', name: '绝地求生', shortName: 'PUBG' },
  { id: 'naraka', name: '永劫无间', shortName: 'NAR' },
  { id: 'apex', name: 'Apex 英雄', shortName: 'APEX' },
  { id: 'cs2', name: 'Counter-Strike 2', shortName: 'CS2' },
  { id: 'dota2', name: 'DOTA2', shortName: 'DOTA' },
  { id: 'overwatch', name: '守望先锋', shortName: 'OW' },
  { id: 'delta-force', name: '三角洲行动', shortName: '三角洲' },
  { id: 'genshin', name: '原神', shortName: '原神' },
  { id: 'wow', name: '魔兽世界', shortName: '魔兽' },
  { id: 'starcraft2', name: '星际争霸 II', shortName: 'SC2' },
  { id: 'fortnite', name: 'Fortnite', shortName: 'FN' },
  { id: 'rainbow6', name: '彩虹六号：围攻', shortName: 'R6' },
  { id: 'minecraft', name: '我的世界', shortName: 'MC' },
]

export const banners: Banner[] = [
  { id: 'banner-01', eyebrow: '本周推荐', title: '找到一起开黑的好队友', description: '按游戏发现活跃俱乐部，浏览成员与服务资料。', actionLabel: '俱乐部精选' },
  { id: 'banner-02', eyebrow: '游戏专题', title: '战术配合，从默契开始', description: '查看不同游戏的俱乐部与陪玩成员。', actionLabel: '热门游戏' },
  { id: 'banner-03', eyebrow: '俱乐部推荐', title: '每一局，都有合拍的人', description: '从俱乐部介绍和成员资料，找到适合自己的选择。', actionLabel: '精选内容' },
]

export const clubTags = ['竞技强队', '轻松娱乐', '语音开黑', '周末组队', '赛事陪练', '新手友好']

export const clubs: Club[] = [
  { id: 'club-001', name: '北境战术俱乐部', initials: '北境', selfOperated: true, rating: 4.98, tags: ['竞技强队', '语音开黑'], intro: '专注团队协作与战术复盘，寻找稳定队友一起提升。', gameIds: ['valorant', 'pubg', 'cs2', 'dota2', 'overwatch', 'delta-force'], companionCount: 28, featured: true, followed: true },
  { id: 'club-002', name: '月光游戏社', initials: '月光', selfOperated: true, rating: 4.96, tags: ['轻松娱乐', '新手友好'], intro: '轻松组队，友好交流，让每一局都更有趣。', gameIds: ['lol', 'apex', 'genshin', 'wow', 'starcraft2'], companionCount: 36, featured: true, followed: false },
  { id: 'club-003', name: '破晓竞技公会', initials: '破晓', selfOperated: false, rating: 4.93, tags: ['赛事陪练', '竞技强队'], intro: '多赛季竞技经验，提供清晰有效的配合建议。', gameIds: ['valorant', 'naraka', 'fortnite', 'rainbow6'], companionCount: 19, featured: true, followed: true },
  { id: 'club-004', name: '像素漫游俱乐部', initials: '像素', selfOperated: false, rating: 4.91, tags: ['周末组队', '轻松娱乐'], intro: '周末固定车队，喜欢探索地图与分享游戏乐趣。', gameIds: ['pubg', 'apex', 'minecraft'], companionCount: 24, featured: true, followed: false },
  { id: 'club-005', name: '星火集结地', initials: '星火', selfOperated: true, rating: 4.89, tags: ['语音开黑', '新手友好'], intro: '欢迎不同水平的玩家，一起熟悉玩法和团队节奏。', gameIds: ['lol', 'naraka', 'genshin', 'minecraft'], companionCount: 31, featured: false, followed: false },
  { id: 'club-006', name: '雾港战队', initials: '雾港', selfOperated: false, rating: 4.87, tags: ['赛事陪练', '周末组队'], intro: '稳定在线的多人开黑团队，重视沟通与协作。', gameIds: ['valorant', 'apex', 'cs2', 'overwatch', 'rainbow6'], companionCount: 16, featured: false, followed: false },
]

export const companions: Companion[] = [
  { id: 'companion-001', realNameVerified: true, onlineStatus: '在线', clubId: 'club-001', name: '林间晚风', initials: '晚风', gender: '女', age: 24, rating: 4.99, status: '接单中', region: '上海', tags: ['战术指挥', '温柔耐心', '稳定在线'], intro: '擅长信息沟通和团队配合，节奏清晰，交流轻松。', voiceMessage: { text: '你好，我是林间晚风，擅长信息沟通和团队配合，期待和你一起开黑。', duration: 8 }, gameIds: ['valorant', 'pubg'], orderCount: 1286 },
  { id: 'companion-002', realNameVerified: true, onlineStatus: '在线', clubId: 'club-001', name: '北纬三十度', initials: '北纬', gender: '男', age: 27, rating: 4.96, status: '服务中', region: '杭州', tags: ['团队协作', '思路清晰'], intro: '熟悉多种地图点位，重视沟通和复盘。', gameIds: ['valorant', 'apex'], orderCount: 986 },
  { id: 'companion-003', realNameVerified: true, onlineStatus: '离线', clubId: 'club-001', name: '云端指挥官', initials: '云端', gender: '女', age: 29, rating: 4.94, status: '接单中', region: '成都', tags: ['赛事经验', '耐心教学'], intro: '从基础配合到进阶战术，按你的节奏来。', gameIds: ['pubg', 'valorant'], orderCount: 764 },
  { id: 'companion-004', realNameVerified: true, onlineStatus: '在线', clubId: 'club-002', name: '莓莓汽水', initials: '莓莓', gender: '女', age: 22, rating: 4.98, status: '接单中', region: '广州', tags: ['轻松聊天', '新手友好'], intro: '喜欢轻松开黑，也乐于陪你熟悉游戏。', voiceMessage: { text: '嗨，我是莓莓汽水，喜欢轻松聊天和愉快开黑。', duration: 6 }, gameIds: ['lol', 'apex'], orderCount: 1520 },
  { id: 'companion-005', realNameVerified: true, onlineStatus: '离线', clubId: 'club-002', name: '晚睡选手', initials: '晚睡', gender: '男', age: 26, rating: 4.92, status: '暂不接单', region: '重庆', tags: ['娱乐开黑', '声音好听'], intro: '主打轻松氛围和稳定配合。', gameIds: ['lol', 'naraka'], orderCount: 602 },
  { id: 'companion-006', realNameVerified: true, onlineStatus: '在线', clubId: 'club-003', name: '折光', initials: '折光', gender: '男', age: 31, rating: 4.97, status: '接单中', region: '北京', tags: ['高阶战术', '赛事陪练'], intro: '专注高阶对局沟通与复盘建议。', voiceMessage: { text: '你好，我是折光，专注高阶对局沟通和复盘建议。', duration: 6 }, gameIds: ['valorant', 'naraka'], orderCount: 1108 },
  { id: 'companion-007', realNameVerified: true, onlineStatus: '在线', clubId: 'club-004', name: '汽水不加冰', initials: '汽水', gender: '女', age: 35, rating: 4.91, status: '接单中', region: '南京', tags: ['周末组队', '轻松娱乐'], intro: '熟悉地图探索与队伍协作，气氛轻松。', gameIds: ['pubg', 'apex'], orderCount: 835 },
  { id: 'companion-008', realNameVerified: true, onlineStatus: '在线', clubId: 'club-005', name: '松果同学', initials: '松果', gender: '女', age: 28, rating: 4.95, status: '接单中', region: '苏州', tags: ['耐心教学', '新手友好'], intro: '陪你从基础熟悉玩法，循序渐进提升。', gameIds: ['lol', 'naraka'], orderCount: 712 },
  { id: 'companion-009', realNameVerified: true, onlineStatus: '离线', clubId: 'club-006', name: '凌晨四点', initials: '凌晨', gender: '男', age: 41, rating: 4.90, status: '接单中', region: '武汉', tags: ['稳定在线', '团队协作'], intro: '擅长多人配合，注重沟通和游戏体验。', gameIds: ['valorant', 'apex'], orderCount: 558 },
]

const createServices = (companionId: string, gameIds: string[]): Service[] => {
  const plays = ['默契排位', '战术陪练', '轻松娱乐', '进阶复盘', '团队上分', '基础教学', '地图熟悉', '双人组队']
  const levels = ['进阶场', '标准场', '娱乐局', '提升场', '团队场', '入门场', '熟练场', '默契场']
  return Array.from({ length: 45 }, (_, index) => ({
    id: `${companionId}-service-${index + 1}`,
    gameId: gameIds[index % gameIds.length],
    playName: plays[index % plays.length],
    levelName: levels[index % levels.length],
    orderCount: 96 + index * 11,
    rating: Number((4.82 + (index % 7) * 0.02).toFixed(2)),
    price: 80 + (index % 15) * 10,
    unit: index % 3 === 1 ? '局' : '小时',
    canAcceptOrders: index % 9 !== 8,
    ...(index % 11 === 0 ? { voiceMessage: { text: `这项服务是${plays[index % plays.length]}，欢迎来一起体验。`, duration: 5 + (index % 5) } } : {}),
  }))
}

export const servicesByCompanion: Record<string, Service[]> = Object.fromEntries(
  companions.map((companion) => [companion.id, createServices(companion.id, companion.gameIds)])
)

export const reviews: Review[] = [
  { id: 'review-01', author: '一颗小行星', initials: '星', rating: 5, date: '2026-10-20', game: '无畏契约', content: '沟通很顺畅，战术思路清楚，整场节奏很舒服。' },
  { id: 'review-02', author: '白日做梦', initials: '白', rating: 5, date: '2026-10-18', game: '绝地求生', content: '配合很默契，也会及时交流信息，体验不错。' },
  { id: 'review-03', author: '橘子海', initials: '橘', rating: 4.9, date: '2026-10-16', game: '无畏契约', content: '耐心又细致，复盘建议对我很有帮助。' },
  { id: 'review-04', author: '北方来信', initials: '北', rating: 5, date: '2026-10-12', game: '无畏契约', content: '氛围轻松，沟通清晰，下次还会一起玩。' },
]

export const gifts: Gift[] = [
  { id: 'gift-01', name: '星光徽章', initials: '星', count: 126, description: '一份闪亮的认可', price: 10 },
  { id: 'gift-02', name: '热烈掌声', initials: '掌', count: 98, description: '为精彩配合喝彩', price: 20 },
  { id: 'gift-03', name: '能量补给', initials: '能', count: 76, description: '继续保持好状态', price: 50 },
  { id: 'gift-04', name: '默契搭档', initials: '默', count: 42, description: '送给合拍的队友', price: 88 },
  { id: 'gift-05', name: '胜利烟花', initials: '烟', count: 31, description: '为精彩胜利庆祝', price: 188 },
  { id: 'gift-06', name: '星河守护', initials: '河', count: 18, description: '送给最默契的伙伴', price: 520 },
]

export const regions = ['上海', '北京', '广州', '杭州', '成都', '南京', '重庆', '苏州', '武汉']
