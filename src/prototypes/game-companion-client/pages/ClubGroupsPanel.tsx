import { useState } from 'react'
import { Check, ChevronRight, MessageCircle, UsersRound } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import type { Club } from '../data/mockData'
import type { ClubGroup, ClubGroupMembership } from '../data/clubGroupMockData'
import { AvatarMark } from '../components/AvatarMark'

type Props = {
  club: Club
  groups: ClubGroup[]
  onApply: (groupId: string, reason: string) => void
  onOpenChat: (groupId: string) => void
}

const membershipLabel: Record<ClubGroupMembership, string> = {
  joined: '已加入',
  'not-joined': '未加入',
  pending: '申请已提交',
}

export function ClubGroupsPanel({ club, groups, onApply, onOpenChat }: Props) {
  const [applyingGroup, setApplyingGroup] = useState<ClubGroup | null>(null)
  const [reason, setReason] = useState('')

  const submitApplication = () => {
    if (!applyingGroup || !reason.trim()) return
    onApply(applyingGroup.id, reason.trim())
    setApplyingGroup(null)
    setReason('')
  }

  return <div className="club-groups-panel">
    <div className="club-groups-panel__intro">
      <span className="client-eyebrow">俱乐部社群</span>
      <h2>{club.name}群聊</h2>
      <p>选择群聊，与俱乐部成员交流和组队。</p>
    </div>
    <div className="club-group-list">
      {groups.map((group) => <article className="club-group-card" key={group.id}>
        <AvatarMark initials={group.initials} size="md" />
        <div className="club-group-card__body">
          <div className="club-group-card__title"><h3>{group.name}</h3><span className={`client-badge club-group-card__status club-group-card__status--${group.membership}`}>{membershipLabel[group.membership]}</span></div>
          <p>{group.description}</p>
          <div className="club-group-card__meta"><span>{group.gameName}</span><span><UsersRound size={13} />{group.memberCount} 人</span></div>
          {group.membership === 'joined' ? <button type="button" className="client-button client-button--primary club-group-card__action" onClick={() => onOpenChat(group.id)}><MessageCircle size={14} />进入群聊<ChevronRight size={14} /></button>
            : group.membership === 'pending' ? <button type="button" className="client-button client-button--secondary club-group-card__action" disabled><Check size={14} />等待审核</button>
            : <button type="button" className="client-button client-button--secondary club-group-card__action" onClick={() => { setApplyingGroup(group); setReason('') }}>申请加入</button>}
        </div>
      </article>)}
      {groups.length === 0 && <div className="client-inline-empty"><p>这个俱乐部暂时没有群聊</p></div>}
    </div>
    {applyingGroup && <DialogPanel overlayId="club-group-application" title="申请加入群聊" description={`申请加入「${applyingGroup.name}」，请填写加入理由。`} onClose={() => setApplyingGroup(null)} width={500} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setApplyingGroup(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={submitApplication} disabled={!reason.trim()}>提交申请</button></>}>
      <label className="club-group-application-field">加入理由<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={120} rows={4} placeholder="介绍一下你自己，或说明想加入群聊的原因" /></label>
      <div className="club-group-application-count">{reason.length}/120</div>
    </DialogPanel>}
  </div>
}
