export type ClubGroupMembership = 'joined' | 'not-joined' | 'pending'

export type ClubGroup = {
  id: string
  clubId: string
  name: string
  initials: string
  description: string
  memberCount: number
  gameName: string
  membership: ClubGroupMembership
  applicationReason?: string
}

export const clubGroups: ClubGroup[] = [
  { id: 'north-tactics', clubId: 'club-001', name: '北境战术交流组', initials: '战', description: '战术复盘、排位组队，欢迎一起交流。', memberCount: 126, gameName: '无畏契约', membership: 'joined' },
  { id: 'north-casual', clubId: 'club-001', name: '北境休闲开黑群', initials: '休', description: '轻松组队，日常开黑和活动通知。', memberCount: 86, gameName: '绝地求生', membership: 'not-joined' },
  { id: 'north-newcomer', clubId: 'club-001', name: '北境新手互助群', initials: '新', description: '新手交流与基础玩法答疑。', memberCount: 54, gameName: '无畏契约', membership: 'not-joined' },
  { id: 'moon-casual', clubId: 'club-002', name: '月光游戏社开黑群', initials: '月', description: '找队友、聊玩法，一起轻松开黑。', memberCount: 103, gameName: '英雄联盟', membership: 'joined' },
  { id: 'dawn-team', clubId: 'club-003', name: '破晓赛事训练群', initials: '破', description: '赛事训练安排与队伍协作交流。', memberCount: 72, gameName: '永劫无间', membership: 'not-joined' },
]
