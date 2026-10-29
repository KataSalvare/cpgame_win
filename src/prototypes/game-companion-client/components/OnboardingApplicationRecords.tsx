import { useState } from 'react'
import { DialogPanel } from '@/components/WindowsClient'
import { UserNameWithLevel } from './UserNameWithLevel'
import type { OnboardingApplication } from '../data/onboardingApplicationMockData'

const formatTime = (time: string) => new Date(time).toLocaleString('zh-CN', { hour12: false })
export function OnboardingApplicationRecords({ records }: { records: OnboardingApplication[] }) {
  const [selected, setSelected] = useState<OnboardingApplication | null>(null)
  return <section className="client-card onboarding-records">
    <h3>入驻申请记录</h3>
    {records.length ? <table><thead><tr><th scope="col">申请类型</th><th scope="col">申请内容</th><th scope="col">申请时间</th><th scope="col">状态</th><th scope="col">操作</th></tr></thead><tbody>{records.map(record => <tr key={record.id}><td>{record.kind}</td><td><strong>{record.summary}</strong><small>{record.content.filter(item => item.label === '考核服务' || item.label === '经营主体名称').map(item => item.value).join(' · ')}</small></td><td><time dateTime={record.submittedAt}>{formatTime(record.submittedAt)}</time></td><td><span className="client-badge">{record.status}</span></td><td><button type="button" className="client-button client-button--secondary" onClick={() => setSelected(record)}>查看申请</button></td></tr>)}</tbody></table> : <p className="personal-setting-empty">暂无入驻申请记录</p>}
    {selected && <DialogPanel overlayId="onboarding-record-detail" title="入驻申请详情" width={640} onClose={() => setSelected(null)} footer={<button type="button" className="client-button client-button--secondary" onClick={() => setSelected(null)}>关闭</button>}><dl className="onboarding-record-detail"><div><dt>申请类型</dt><dd>{selected.kind}</dd></div><div><dt>申请时间</dt><dd>{formatTime(selected.submittedAt)}</dd></div><div><dt>状态</dt><dd>{selected.status}</dd></div>{selected.content.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.label === '考官' && item.value ? <UserNameWithLevel name={item.value} identityId={item.value} /> : item.value || '未填写'}</dd></div>)}</dl></DialogPanel>}
  </section>
}
