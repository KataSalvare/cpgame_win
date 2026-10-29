import { UserRound } from 'lucide-react'

export function AvatarMark({ initials, size = 'md', imageUrl }: { initials: string; size?: 'sm' | 'md' | 'lg'; imageUrl?: string }) {
  return <span className={`client-avatar client-avatar--${size}`} aria-hidden="true">
    {imageUrl ? <img src={imageUrl} alt="" /> : initials || <UserRound size={size === 'lg' ? 28 : 18} />}
  </span>
}
