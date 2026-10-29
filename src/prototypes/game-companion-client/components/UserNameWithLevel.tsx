import { getMockWealthLevel } from '../data/personalWealthLevelMockData'

type UserNameWithLevelProps = {
  name: string
  identityId: string
  className?: string
}

export function UserNameWithLevel({ name, identityId, className }: UserNameWithLevelProps) {
  const level = getMockWealthLevel(identityId)
  return <span className={['client-user-name', className].filter(Boolean).join(' ')}>
    <span className="client-user-name__text">{name}</span>
    <span className="client-user-level-badge" aria-label={`财富等级 V${level}`}>V{level}</span>
  </span>
}
