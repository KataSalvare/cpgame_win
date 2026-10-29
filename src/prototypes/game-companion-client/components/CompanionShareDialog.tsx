import { useState } from 'react'
import { Search } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import type { ProfileCardData } from './profileCardData'
import { socialFriends } from '../data/socialMockData'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'

export function CompanionShareDialog({ profile, onShare, onClose }: { profile: ProfileCardData; onShare: (friendIds: string[]) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sent, setSent] = useState(false)
  const friends = socialFriends.filter((friend) => friend.name.includes(query.trim()) || friend.profileId.toLowerCase().includes(query.trim().toLowerCase()))
  return <DialogPanel overlayId={`companion-share-${profile.userId}`} title="分享给好友" onClose={onClose} width={480} footer={sent ? <button type="button" className="client-button client-button--primary" onClick={onClose}>完成</button> : <><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" disabled={!selectedIds.length} onClick={() => { onShare(selectedIds); setSent(true) }}>发送{selectedIds.length > 0 ? `（${selectedIds.length}）` : ''}</button></>}>
    <div className="companion-share-preview"><AvatarMark initials={profile.initials} size="md" /><strong><UserNameWithLevel name={profile.name} identityId={profile.userId} /></strong></div>
    {sent ? <p className="companion-share-success" role="status">已分享给 {socialFriends.filter((friend) => selectedIds.includes(friend.id)).map((friend) => friend.name).join('、')}</p> : <>
      <label className="social-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索好友" aria-label="搜索分享好友" /></label>
      <div className="companion-share-friends" role="group" aria-label="选择分享好友">{friends.map((friend) => <label key={friend.id}><input type="checkbox" checked={selectedIds.includes(friend.id)} onChange={() => setSelectedIds((ids) => ids.includes(friend.id) ? ids.filter((id) => id !== friend.id) : [...ids, friend.id])} /><AvatarMark initials={friend.initials} size="sm" /><span><UserNameWithLevel name={friend.name} identityId={friend.profileId} /></span></label>)}{!friends.length && <p className="social-empty-inline">没有匹配的好友</p>}</div>
    </>}
  </DialogPanel>
}
