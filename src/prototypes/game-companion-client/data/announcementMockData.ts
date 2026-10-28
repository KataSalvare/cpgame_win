import platformEventCover from '../assets/announcement-platform-event.svg'
import clubEventCover from '../assets/announcement-club-event.svg'

export type AnnouncementCategory = '平台活动' | '规则更新' | '紧急通知' | '处罚通知' | '俱乐部活动'

export type Announcement = {
  id: string
  category: AnnouncementCategory
  title: string
  summary: string
  publishedAt: string
  content: string[]
  coverImage?: string
  coverAlt?: string
  clubId?: string
}

export const platformAnnouncementCategories: AnnouncementCategory[] = ['平台活动', '规则更新', '紧急通知']
export const clubAnnouncementCategories: AnnouncementCategory[] = ['处罚通知', '俱乐部活动', '紧急通知']

export const platformAnnouncements: Announcement[] = [
  { id: 'platform-event-01', category: '平台活动', title: '周末组队挑战开启', summary: '和好友完成组队挑战，领取活动奖励。', publishedAt: '2026-10-28 10:00', content: ['周末组队挑战现已开启。活动期间完成指定场次，即可在活动页领取对应奖励。', '活动进度以客户端页面展示为准。'], coverImage: platformEventCover, coverAlt: '周末组队挑战活动头图' },
  { id: 'platform-rules-01', category: '规则更新', title: '陪玩服务规范更新说明', summary: '服务评价与订单沟通规范将于本周更新。', publishedAt: '2026-10-27 16:30', content: ['为提升服务体验，平台更新了陪玩服务规范与订单沟通指引。', '请在开始服务前确认订单内容；如遇问题，可通过订单页面查看处理入口。'], },
  { id: 'platform-urgent-01', category: '紧急通知', title: '客户端维护时间调整', summary: '今晚维护时间调整为 23:30 至次日 01:00。', publishedAt: '2026-10-27 12:00', content: ['客户端维护时间调整为 2026 年 10 月 28 日 23:30 至 10 月 29 日 01:00。维护期间，部分服务可能暂时无法使用。', '维护完成后请重新启动客户端。'], },
  { id: 'platform-event-02', category: '平台活动', title: '新玩家见面礼活动', summary: '完成新手任务可领取平台见面礼。', publishedAt: '2026-10-25 09:00', content: ['活动期间完成新手任务，即可领取平台见面礼。每个账号限领取一次。'], },
]

export const clubAnnouncements: Announcement[] = [
  { id: 'club-penalty-01', clubId: 'club-001', category: '处罚通知', title: '成员违规处理结果公示', summary: '关于近期成员违规行为的处理说明。', publishedAt: '2026-10-27 18:00', content: ['经俱乐部核实，成员「示例成员」因违反俱乐部行为规范，已暂停接单资格。', '俱乐部将持续维护公平、友善的组队环境。'], },
  { id: 'club-event-01', clubId: 'club-001', category: '俱乐部活动', title: '本周五晚间水友赛报名', summary: '周五 20:00 举办水友赛，欢迎报名参加。', publishedAt: '2026-10-26 14:00', content: ['本周五 20:00 举办俱乐部水友赛，报名截止时间为周五 18:00。', '请前往俱乐部群聊联系管理员登记。'], coverImage: clubEventCover, coverAlt: '俱乐部水友赛活动头图' },
  { id: 'club-urgent-01', clubId: 'club-001', category: '紧急通知', title: '接待大厅临时关闭', summary: '接待大厅将于今晚 22:00 临时维护。', publishedAt: '2026-10-25 20:15', content: ['接待大厅将于今晚 22:00 至 22:30 进行临时维护，期间暂时无法进入。给你带来不便，敬请谅解。'], },
  { id: 'club-event-02', clubId: 'club-001', category: '俱乐部活动', title: '新赛季陪玩招募', summary: '俱乐部开放新赛季成员申请。', publishedAt: '2026-10-23 11:20', content: ['俱乐部现开放新赛季成员申请，欢迎符合条件的玩家提交入驻申请。具体要求请联系俱乐部客服。'], },
]
