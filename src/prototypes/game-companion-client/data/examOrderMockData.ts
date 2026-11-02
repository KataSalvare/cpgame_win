export type ExamOrderStatus = '待支付' | '待考核' | '审核中' | '已通过' | '未通过' | '已取消'
export type ExamSubmission = { images: string[]; recordingUrls: string[]; note: string; result: '已通过' | '未通过' }
export type ExamOrder = {
  id: string
  createdAt: string
  person: string
  personId: string
  initials: string
  gender: string
  age: number
  clubName: string
  game: string
  play: string
  level: string
  service: string
  status: ExamOrderStatus
  submission?: ExamSubmission
}

export const examCandidateOrders: ExamOrder[] = [
  { id: 'EX-C-1102-001', createdAt: '2026-11-02 10:20', person: '林间晚风', personId: 'examiner-001', initials: '晚风', gender: '女', age: 24, clubName: '北境战术俱乐部', game: '无畏契约', play: '默契排位', level: '进阶场', service: '按小时服务', status: '待支付' },
  { id: 'EX-C-1030-002', createdAt: '2026-10-30 16:35', person: '莓莓汽水', personId: 'examiner-002', initials: '莓莓', gender: '女', age: 22, clubName: '月光游戏社', game: '英雄联盟', play: '轻松娱乐', level: '娱乐局', service: '按小时服务', status: '待考核' },
  { id: 'EX-C-1029-003', createdAt: '2026-10-29 11:10', person: '星河教练', personId: 'examiner-003', initials: '星河', gender: '男', age: 27, clubName: '星河游戏俱乐部', game: '无畏契约', play: '技巧指导', level: '提升场', service: '按局服务', status: '审核中' },
  { id: 'EX-C-1025-004', createdAt: '2026-10-25 14:10', person: '北风教官', personId: 'examiner-004', initials: '北风', gender: '男', age: 28, clubName: '北境战术俱乐部', game: '英雄联盟', play: '默契排位', level: '熟练场', service: '按小时服务', status: '已通过' },
  { id: 'EX-C-1022-005', createdAt: '2026-10-22 09:40', person: '秋日教练', personId: 'examiner-005', initials: '秋日', gender: '女', age: 26, clubName: '月光游戏社', game: '无畏契约', play: '团队竞技', level: '标准场', service: '按局服务', status: '未通过' },
]

export const examProctorOrders: ExamOrder[] = [
  { id: 'EX-P-1101-001', createdAt: '2026-11-01 15:20', person: '小满', personId: 'candidate-001', initials: '小满', gender: '男', age: 25, clubName: '北境战术俱乐部', game: '无畏契约', play: '默契排位', level: '进阶场', service: '按小时服务', status: '待考核' },
  { id: 'EX-P-1030-002', createdAt: '2026-10-30 11:05', person: '卡塔', personId: 'candidate-002', initials: '卡塔', gender: '男', age: 26, clubName: '月光游戏社', game: '英雄联盟', play: '轻松娱乐', level: '娱乐局', service: '按小时服务', status: '审核中' },
  { id: 'EX-P-1028-003', createdAt: '2026-10-28 13:45', person: '晚风玩家', personId: 'candidate-003', initials: '晚风', gender: '女', age: 26, clubName: '星河游戏俱乐部', game: '无畏契约', play: '技巧指导', level: '提升场', service: '按局服务', status: '已通过' },
  { id: 'EX-P-1024-004', createdAt: '2026-10-24 10:15', person: '橘子汽水', personId: 'candidate-004', initials: '橘子', gender: '女', age: 22, clubName: '北境战术俱乐部', game: '英雄联盟', play: '默契排位', level: '熟练场', service: '按小时服务', status: '未通过' },
]
