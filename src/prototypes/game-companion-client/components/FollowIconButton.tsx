import { Star } from 'lucide-react'

export function FollowIconButton({ followed, name, onToggle }: { followed: boolean; name: string; onToggle: () => void }) {
  const label = followed ? '已关注，点击取消关注' : '关注'
  return <button type="button" className="client-icon-button client-follow-button" aria-label={`${label}${name}`} title={label} aria-pressed={followed} onClick={onToggle}><Star size={17} fill={followed ? 'currentColor' : 'none'} /></button>
}
