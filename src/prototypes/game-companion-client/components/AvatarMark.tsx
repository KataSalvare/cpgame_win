import { UserRound } from 'lucide-react'
import avatar1 from '../assets/avatar-preview-1.webp'
import avatar2 from '../assets/avatar-preview-2.webp'
import avatar3 from '../assets/avatar-preview-3.webp'
import avatar4 from '../assets/avatar-preview-4.webp'
import demoAvatar from '../assets/demo-avatar.webp'

const previewAvatars: Record<string, string> = { 风: avatar1, 晚风: avatar1, 满: avatar2, 北: avatar3, 柠: avatar4 }

export function AvatarMark({ initials, size = 'md', imageUrl, isDemoUser = false }: { initials: string; size?: 'sm' | 'md' | 'lg' | 'xl'; imageUrl?: string; isDemoUser?: boolean }) {
  const previewAvatar = !imageUrl ? (isDemoUser ? demoAvatar : previewAvatars[initials]) : undefined
  return <span className={`client-avatar client-avatar--${size}`} aria-hidden="true">
    {imageUrl ? <img src={imageUrl} alt="" /> : <><span className="client-avatar__fallback">{initials || <UserRound size={size === 'xl' ? 56 : size === 'lg' ? 28 : 18} />}</span>{previewAvatar && <img className="client-avatar__preview" src={previewAvatar} alt="" />}</>}
  </span>
}
