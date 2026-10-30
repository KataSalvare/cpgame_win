export type WoodpeckerTicketType = 'suggestion' | 'report'
export type WoodpeckerTicketStatus = '待处理' | '处理中' | '已处理'

export interface WoodpeckerTicket {
  id: string
  type: WoodpeckerTicketType
  status: WoodpeckerTicketStatus
  submittedAt: string
  reportedUser?: string
  reportedUserId?: string
  reason?: string
  description: string
  attachments: string[]
  anonymous: boolean
  response?: string
}

export interface PublicWoodpeckerRecord extends WoodpeckerTicket {
  reportedUser: string
  reportedUserId: string
  likes: number
  dislikes: number
  comments: number
}

export interface WoodpeckerUser {
  name: string
  id: string
}

export const woodpeckerMockUsers: WoodpeckerUser[] = [
  { name: '陪玩小禾', id: '862014' },
  { name: '陪玩阿远', id: '731520' },
  { name: '陪玩星河', id: '590163' },
]

export const woodpeckerReasons = ['假照套图', '未交抽成', '违反平台规定', '谈恋爱未上报', '其他', '考官/考核 投诉举报']

export const initialMyWoodpeckerTickets: WoodpeckerTicket[] = [
  {
    id: 'WD-20261030-014', type: 'report', status: '已处理', submittedAt: '2026-10-30 14:14',
    reportedUser: '陪玩小禾', reportedUserId: '862014', reason: '违反平台规定',
    description: '英雄联盟娱乐等级与报段位问题，请核实相关服务信息。', attachments: ['服务信息.png'], anonymous: true,
    response: '经核实，相关服务信息符合平台当前展示规则，工单已处理完成。',
  },
  {
    id: 'WD-20261030-009', type: 'suggestion', status: '处理中', submittedAt: '2026-10-30 13:23',
    description: '建议在服务开始前增加一次提醒，方便玩家确认服务内容。', attachments: [], anonymous: false,
  },
  {
    id: 'WD-20261029-021', type: 'report', status: '待处理', submittedAt: '2026-10-29 19:08',
    reportedUser: '陪玩阿远', reportedUserId: '731520', reason: '其他',
    description: '试音结束后长时间未收到回复，请协助核实。', attachments: ['聊天记录.png'], anonymous: false,
  },
]

export const publicWoodpeckerRecords: PublicWoodpeckerRecord[] = [
  {
    id: '公示-20261030-014', type: 'report', status: '已处理', submittedAt: '2026-10-30 14:14',
    reportedUser: '陪玩小禾', reportedUserId: '862014', reason: '违反平台规定',
    description: '英雄联盟娱乐等级与报段位问题，请核实相关服务信息。', attachments: ['服务信息.png'], anonymous: true,
    response: '经核实，相关服务信息符合平台当前展示规则，工单已处理完成。如有其他问题可再次提交。', likes: 0, dislikes: 0, comments: 0,
  },
  {
    id: '公示-20261029-008', type: 'report', status: '已处理', submittedAt: '2026-10-29 13:23',
    reportedUser: '陪玩阿远', reportedUserId: '731520', reason: '其他',
    description: '试音期间沟通体验反馈。', attachments: ['沟通记录.png'], anonymous: true,
    response: '已完成核实并与相关用户沟通，感谢反馈。', likes: 2, dislikes: 0, comments: 1,
  },
]
