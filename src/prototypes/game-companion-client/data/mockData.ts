import reviewMatchImage from '../assets/mock-review-match.svg'

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
  talentCategories?: ('popular' | 'star')[]
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
  images?: string[]
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
  { id: 'club-001', name: '北境战术俱乐部', initials: '北境', selfOperated: true, rating: 4.9, tags: ['竞技强队', '语音开黑'], intro: '专注团队协作与战术复盘，陪伴队友熟悉地图点位、沟通节奏与临场决策。无论日常上分还是组队磨合，都能找到稳定队友，一起复盘每一局并逐步提升。', gameIds: ['valorant', 'pubg', 'cs2', 'dota2', 'overwatch', 'delta-force'], companionCount: 34, featured: true, followed: true },
  { id: 'club-002', name: '月光游戏社', initials: '月光', selfOperated: true, rating: 4.8, tags: ['轻松娱乐', '新手友好'], intro: '轻松组队，快乐开黑，欢迎不同水平的玩家加入。这里注重友好交流与舒适节奏，可以一起熟悉玩法、探索新套路，也能在忙碌之余享受没有压力的游戏时光。', gameIds: ['lol', 'apex', 'genshin', 'wow', 'starcraft2'], companionCount: 36, featured: true, followed: false },
  { id: 'club-003', name: '破晓竞技公会', initials: '破晓', selfOperated: false, rating: 4.8, tags: ['赛事陪练', '竞技强队'], intro: '拥有多赛季竞技经验，擅长结合对局情况提供清晰有效的配合建议。队伍会一起梳理战术思路、复盘关键回合，帮助成员找到适合自己的节奏，稳步提升实战表现。', gameIds: ['valorant', 'naraka', 'fortnite', 'rainbow6'], companionCount: 19, featured: true, followed: true },
  { id: 'club-004', name: '像素漫游俱乐部', initials: '像素', selfOperated: false, rating: 4.7, tags: ['周末组队', '轻松娱乐'], intro: '周末固定车队，喜欢探索地图、发现隐藏路线，也会分享每次组队里的有趣瞬间。无论是熟悉玩法还是临时约战，都欢迎加入，一起认识新朋友，享受轻松自在的游戏时光。', gameIds: ['pubg', 'apex', 'minecraft'], companionCount: 24, featured: true, followed: false },
  { id: 'club-005', name: '星火集结地', initials: '星火', selfOperated: true, rating: 4.7, tags: ['语音开黑', '新手友好'], intro: '欢迎不同水平的玩家，一起熟悉玩法和团队节奏。成员可以分享实用技巧、交流每局心得，也能按自己的时间轻松组队，从基础配合开始慢慢找到默契与乐趣。', gameIds: ['lol', 'naraka', 'genshin', 'minecraft'], companionCount: 31, featured: false, followed: false },
  { id: 'club-006', name: '雾港战队', initials: '雾港', selfOperated: false, rating: 4.6, tags: ['赛事陪练', '周末组队'], intro: '保持稳定开黑，重视清晰沟通与团队协作。队友会根据每局情况交流打法、复盘关键选择，也欢迎周末一起组队挑战新目标，在默契配合中享受持续进步的过程。', gameIds: ['valorant', 'apex', 'cs2', 'overwatch', 'rainbow6'], companionCount: 16, featured: false, followed: false },
]

const homeClubMockData: Club[] = [
  { id: 'home-club-007', name: '远星集结', initials: '远星', selfOperated: false, rating: 4.8, tags: ['竞技强队', '周末组队'], intro: '和队友一起制定目标、练习配合，在轻松交流中享受每一场对局。', gameIds: ['valorant', 'apex', 'pubg'], companionCount: 22, featured: true, followed: false },
  { id: 'home-club-008', name: '云上茶话会', initials: '云上', selfOperated: true, rating: 4.7, tags: ['轻松娱乐', '语音开黑'], intro: '欢迎不同水平的玩家加入，找个舒服的节奏一起游戏、聊天和探索新玩法。', gameIds: ['lol', 'genshin', 'minecraft'], companionCount: 18, featured: true, followed: false },
  { id: 'home-club-009', name: '晨星训练营', initials: '晨星', selfOperated: false, rating: 4.9, tags: ['赛事陪练', '新手友好'], intro: '从基础操作到团队战术，陪你逐步熟悉游戏节奏并积累实战经验。', gameIds: ['valorant', 'rainbow6', 'cs2'], companionCount: 26, featured: true, followed: false },
  { id: 'home-club-010', name: '周末冒险团', initials: '冒险', selfOperated: false, rating: 4.6, tags: ['周末组队', '轻松娱乐'], intro: '一起组队探索地图与新玩法，享受随时开局的周末时光。', gameIds: ['pubg', 'minecraft', 'fortnite'], companionCount: 15, featured: true, followed: false },
  { id: 'home-club-011', name: '破风战术社', initials: '破风', selfOperated: true, rating: 4.8, tags: ['竞技强队', '赛事陪练'], intro: '重视信息沟通和临场协作，和队友一起复盘细节、持续提升。', gameIds: ['valorant', 'dota2', 'delta-force'], companionCount: 30, featured: true, followed: false },
  { id: 'home-club-012', name: '星河游乐场', initials: '星河', selfOperated: false, rating: 4.7, tags: ['语音开黑', '新手友好'], intro: '轻松认识新队友，分享游戏乐趣，按自己的节奏开始每一局。', gameIds: ['lol', 'apex', 'wow'], companionCount: 20, featured: true, followed: false },
]
export const homepageClubs: Club[] = [...clubs, ...homeClubMockData]

export const companions: Companion[] = [
  { id: 'companion-001', realNameVerified: true, talentCategories: ['popular', 'star'], onlineStatus: '在线', clubId: 'club-001', name: '林间晚风', initials: '晚风', gender: '女', age: 24, rating: 4.99, status: '接单中', region: '上海', tags: ['战术指挥', '温柔耐心', '稳定在线'], intro: '擅长信息沟通和团队配合，节奏清晰，交流轻松。', voiceMessage: { text: '你好，我是林间晚风，擅长信息沟通和团队配合，期待和你一起开黑。', duration: 8 }, gameIds: ['valorant', 'pubg'], orderCount: 1286 },
  { id: 'companion-002', realNameVerified: true, talentCategories: ['popular'], onlineStatus: '在线', clubId: 'club-001', name: '北纬三十度', initials: '北纬', gender: '男', age: 27, rating: 4.96, status: '服务中', region: '杭州', tags: ['团队协作', '思路清晰'], intro: '熟悉多种地图点位，重视沟通和复盘。', gameIds: ['valorant', 'apex'], orderCount: 986 },
  { id: 'companion-003', realNameVerified: true, onlineStatus: '离线', clubId: 'club-001', name: '云端指挥官', initials: '云端', gender: '女', age: 29, rating: 4.94, status: '接单中', region: '成都', tags: ['赛事经验', '耐心教学'], intro: '从基础配合到进阶战术，按你的节奏来。', gameIds: ['pubg', 'valorant'], orderCount: 764 },
  { id: 'companion-004', realNameVerified: true, talentCategories: ['popular', 'star'], onlineStatus: '在线', clubId: 'club-002', name: '莓莓汽水', initials: '莓莓', gender: '女', age: 22, rating: 4.98, status: '接单中', region: '广州', tags: ['轻松聊天', '新手友好'], intro: '喜欢轻松开黑，也乐于陪你熟悉游戏。', voiceMessage: { text: '嗨，我是莓莓汽水，喜欢轻松聊天和愉快开黑。', duration: 6 }, gameIds: ['lol', 'apex'], orderCount: 1520 },
  { id: 'companion-005', realNameVerified: true, onlineStatus: '离线', clubId: 'club-002', name: '晚睡选手', initials: '晚睡', gender: '男', age: 26, rating: 4.92, status: '暂不接单', region: '重庆', tags: ['娱乐开黑', '声音好听'], intro: '主打轻松氛围和稳定配合。', gameIds: ['lol', 'naraka'], orderCount: 602 },
  { id: 'companion-006', realNameVerified: true, talentCategories: ['popular', 'star'], onlineStatus: '在线', clubId: 'club-003', name: '折光', initials: '折光', gender: '男', age: 31, rating: 4.97, status: '接单中', region: '北京', tags: ['高阶战术', '赛事陪练'], intro: '专注高阶对局沟通与复盘建议。', voiceMessage: { text: '你好，我是折光，专注高阶对局沟通和复盘建议。', duration: 6 }, gameIds: ['valorant', 'naraka'], orderCount: 1108 },
  { id: 'companion-007', realNameVerified: true, onlineStatus: '在线', clubId: 'club-004', name: '汽水不加冰', initials: '汽水', gender: '女', age: 35, rating: 4.91, status: '接单中', region: '南京', tags: ['周末组队', '轻松娱乐'], intro: '熟悉地图探索与队伍协作，气氛轻松。', gameIds: ['pubg', 'apex'], orderCount: 835 },
  { id: 'companion-008', realNameVerified: true, onlineStatus: '在线', clubId: 'club-005', name: '松果同学', initials: '松果', gender: '女', age: 28, rating: 4.95, status: '接单中', region: '苏州', tags: ['耐心教学', '新手友好'], intro: '陪你从基础熟悉玩法，循序渐进提升。', gameIds: ['lol', 'naraka'], orderCount: 712 },
  { id: 'companion-009', realNameVerified: true, onlineStatus: '离线', clubId: 'club-006', name: '凌晨四点', initials: '凌晨', gender: '男', age: 41, rating: 4.90, status: '接单中', region: '武汉', tags: ['稳定在线', '团队协作'], intro: '擅长多人配合，注重沟通和游戏体验。', gameIds: ['valorant', 'apex'], orderCount: 558 },
]

const createCompanionMock = (id: string, clubId: string, name: string, initials: string, gender: Companion['gender'], age: number, rating: number, status: Companion['status'], onlineStatus: Companion['onlineStatus'], region: string, tags: string[], intro: string, gameIds: string[], orderCount: number, talentCategories?: Companion['talentCategories']): Companion => ({ realNameVerified: true, id, clubId, name, initials, gender, age, rating, status, onlineStatus, region, tags, intro, gameIds, orderCount, ...(talentCategories ? { talentCategories } : {}) })

export const northernClubCompanionMockData: Companion[] = [
  createCompanionMock('club-north-101', 'club-001', '霜刃', '霜刃', '男', 25, 4.93, '接单中', '在线', '北京', ['点位教学', '团队协作'], '熟悉常用地图路线，擅长把复杂战术拆成清晰步骤。', ['valorant', 'cs2'], 684),
  createCompanionMock('club-north-102', 'club-001', '白桦微光', '白桦', '女', 23, 4.95, '接单中', '在线', '哈尔滨', ['耐心陪练', '语音开黑'], '沟通节奏轻松，适合一起练习基础配合和信息交流。', ['valorant', 'pubg'], 592),
  createCompanionMock('club-north-103', 'club-001', '荒原信号', '荒原', '男', 30, 4.91, '服务中', '在线', '沈阳', ['战术复盘', '稳定在线'], '注重对局复盘和团队协同，陪你寻找更合适的决策节奏。', ['pubg', 'delta-force'], 531),
  createCompanionMock('club-north-104', 'club-001', '雪线以北', '雪线', '女', 28, 4.92, '接单中', '离线', '长春', ['进阶复盘', '细节教学'], '熟悉多类地图点位，愿意耐心讲解每个回合的思路。', ['valorant', 'overwatch'], 478),
  createCompanionMock('club-north-105', 'club-001', '极光来信', '极光', '女', 21, 4.90, '接单中', '在线', '大连', ['轻松组队', '氛围友好'], '喜欢轻松开黑，也会及时交流有用的游戏信息。', ['pubg', 'apex'], 426),
  createCompanionMock('club-north-106', 'club-001', '北岸回声', '北岸', '男', 33, 4.94, '暂不接单', '离线', '天津', ['团队指挥', '赛后复盘'], '擅长整理团队信息，结束后一起回看关键决策。', ['cs2', 'dota2'], 389),
]

export const talentsPageCompanionMockData: Companion[] = [
  createCompanionMock('talent-page-101', 'club-002', '橘子海', '橘海', '女', 24, 4.96, '接单中', '在线', '厦门', ['温柔耐心', '轻松聊天'], '擅长把游戏节奏放慢一点，边玩边熟悉新内容。', ['lol', 'genshin'], 892, ['popular']),
  createCompanionMock('talent-page-102', 'club-003', '长夜星河', '星河', '男', 29, 4.98, '接单中', '在线', '上海', ['赛事经验', '战术分析'], '熟悉高阶对局和团队决策，赛后复盘清晰有条理。', ['valorant', 'cs2'], 1186, ['popular', 'star']),
  createCompanionMock('talent-page-103', 'club-004', '薄荷气泡', '薄荷', '女', 22, 4.94, '服务中', '在线', '杭州', ['新手友好', '活跃气氛'], '喜欢轻松组队，能陪你一起熟悉地图和常见玩法。', ['apex', 'minecraft'], 746, ['popular']),
  createCompanionMock('talent-page-104', 'club-005', '逆风翻盘', '逆风', '男', 27, 4.99, '接单中', '在线', '成都', ['高阶指挥', '临场判断'], '擅长临场沟通与战术调整，保持清楚稳定的团队节奏。', ['dota2', 'lol'], 1032, ['star']),
  createCompanionMock('talent-page-105', 'club-006', '月见山', '月见', '女', 26, 4.95, '接单中', '离线', '南京', ['耐心教学', '路线熟悉'], '从基础路线开始陪练，逐步建立地图理解和配合习惯。', ['pubg', 'naraka'], 638, ['popular']),
  createCompanionMock('talent-page-106', 'club-002', '深海蓝', '深蓝', '男', 32, 4.97, '服务中', '在线', '青岛', ['团队配合', '稳定在线'], '注重队伍信息同步，熟悉多种团队配合打法。', ['overwatch', 'valorant'], 974, ['star']),
  createCompanionMock('talent-page-107', 'club-003', '晚风邮局', '邮局', '女', 20, 4.93, '接单中', '在线', '苏州', ['声音亲切', '轻松娱乐'], '开黑氛围自在，愿意陪你体验不同模式和角色。', ['genshin', 'wow'], 582),
  createCompanionMock('talent-page-108', 'club-004', '青空计划', '青空', '男', 35, 4.96, '暂不接单', '离线', '武汉', ['战术复盘', '多年经验'], '擅长从关键回合分析选择，提供清楚实用的复盘思路。', ['rainbow6', 'fortnite'], 816, ['star']),
]
export const directoryCompanions: Companion[] = [...companions, ...northernClubCompanionMockData, ...talentsPageCompanionMockData]

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
  directoryCompanions.map((companion) => [companion.id, createServices(companion.id, companion.gameIds)])
)

export const reviews: Review[] = [
  { id: 'review-01', author: '一颗小行星', initials: '星', rating: 5, date: '2026-10-20', game: '无畏契约', content: '沟通很顺畅，战术思路清楚，整场节奏很舒服。每次开局都会根据队伍情况制定合适思路，过程中及时同步信息，也会耐心解答问题。结束后还会一起复盘关键回合，整个体验轻松又有收获，下次组队还会优先选择。', images: [reviewMatchImage] },
  { id: 'review-02', author: '白日做梦', initials: '白', rating: 5, date: '2026-10-18', game: '绝地求生', content: '配合很默契，也会及时交流信息，体验不错。' },
  { id: 'review-03', author: '橘子海', initials: '橘', rating: 3, date: '2026-10-16', game: '无畏契约', content: '耐心又细致，复盘建议对我很有帮助。' },
  { id: 'review-04', author: '北方来信', initials: '北', rating: 5, date: '2026-10-12', game: '无畏契约', content: '氛围轻松，沟通清晰，下次还会一起玩。' },
  { id: 'review-05', author: '山野来客', initials: '山', rating: 2, date: '2026-10-08', game: '绝地求生', content: '本次配合和沟通没有达到预期。' },
]

export const clubReviews: Review[] = [
  { id: 'club-review-01', author: '一颗小行星', initials: '星', rating: 5, date: '2026-10-20', game: '无畏契约', content: '沟通很顺畅，战术思路清楚，整场节奏很舒服。每次开局都会根据队伍情况制定合适思路，过程中及时同步信息，也会耐心解答问题。结束后还会一起复盘关键回合，整个体验轻松又有收获，下次组队还会优先选择。', images: [reviewMatchImage] },
  { id: 'club-review-02', author: '白日做梦', initials: '白', rating: 5, date: '2026-10-18', game: '绝地求生', content: '配合很默契，也会及时交流信息，体验不错。' },
  { id: 'club-review-03', author: '橘子海', initials: '橘', rating: 3, date: '2026-10-16', game: '无畏契约', content: '耐心又细致，复盘建议对我很有帮助。' },
  { id: 'club-review-04', author: '北方来信', initials: '北', rating: 5, date: '2026-10-12', game: '无畏契约', content: '氛围轻松，沟通清晰，下次还会一起玩。' },
  { id: 'club-review-05', author: '山野来客', initials: '山', rating: 2, date: '2026-10-08', game: '绝地求生', content: '本次配合和沟通没有达到预期。' },
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
