import { UserRound } from 'lucide-react'

export function AvatarMark({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`client-avatar client-avatar--${size}`} aria-hidden="true">
    {initials || <UserRound size={size === 'lg' ? 28 : 18} />}
  </span>
}
