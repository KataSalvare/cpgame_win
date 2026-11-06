import { UserRound } from 'lucide-react'

export function AvatarMark({ initials, size = 'md', imageUrl }: { initials: string; size?: 'sm' | 'md' | 'lg' | 'xl'; imageUrl?: string }) {
  return <span className={`client-avatar client-avatar--${size}`} aria-hidden="true">
    {imageUrl ? <img src={imageUrl} alt="" /> : initials || <UserRound size={size === 'xl' ? 56 : size === 'lg' ? 28 : 18} />}
  </span>
}
