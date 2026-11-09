export type GroupMemberMock = {
  id: string
  name: string
  initials: string
  profileId: string
  online: boolean
}

const extraMemberNames = [
  '星河漫游', '云朵收藏家', '晚风不晚', '柚子海', '微光同学',
  '南风知我意', '小岛来信', '月亮邮差', '山野听风', '雾里看花',
  '橘子汽水', '清醒梦境', '银河便利店', '青山见我', '糖霜薄荷',
  '春日迟迟', '蓝莓气泡', '夜航船', '落日放映厅', '白昼流星',
]

function createExtraMembers(prefix: string): GroupMemberMock[] {
  return extraMemberNames.map((name, index) => {
    const number = String(index + 1).padStart(2, '0')
    return { id: `${prefix}-member-${number}`, name, initials: name.slice(-1), profileId: `P-${prefix.toUpperCase()}-${number}`, online: index % 4 !== 1 }
  })
}

export const groupMembersMockData: Record<string, GroupMemberMock[]> = {
  'group-squad': createExtraMembers('squad'),
  'group-ordinary': createExtraMembers('ordinary'),
}

export const groupMemberExtraIds = Object.fromEntries(
  Object.entries(groupMembersMockData).map(([conversationId, members]) => [conversationId, members.map((member) => member.id)]),
)
