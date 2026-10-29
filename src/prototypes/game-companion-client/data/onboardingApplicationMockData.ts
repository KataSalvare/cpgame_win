export type OnboardingApplication = {
  id: string
  kind: '陪玩入驻' | '俱乐部入驻'
  summary: string
  submittedAt: string
  status: '待考核' | '审核中' | '已通过' | '未通过'
  content: { label: string; value: string }[]
}
export type OnboardingSubmission = Pick<OnboardingApplication, 'kind' | 'summary' | 'status' | 'content'>
export const initialOnboardingApplications: OnboardingApplication[] = [
  { id: 'application-003', kind: '陪玩入驻', summary: '北境战术俱乐部 · 无畏契约', submittedAt: '2026-10-29T10:20:00+08:00', status: '待考核', content: [{ label: '申请俱乐部', value: '北境战术俱乐部' }, { label: '申请游戏', value: '无畏契约' }, { label: '考核服务', value: '默契排位 / 进阶场 / 按小时服务' }, { label: '考官', value: '林间晚风' }, { label: '考核费用', value: '500 钻石（已支付）' }] },
  { id: 'application-002', kind: '俱乐部入驻', summary: '星河游戏俱乐部', submittedAt: '2026-10-28T16:35:00+08:00', status: '审核中', content: [{ label: '经营主体名称', value: '星河互动（示例）' }, { label: '俱乐部名称', value: '星河游戏俱乐部' }, { label: '店长姓名', value: '林小满' }, { label: '当月流水（元）', value: '12000' }, { label: '入驻申请表', value: '入驻申请表.pdf' }, { label: '营业执照', value: '营业执照示例.png' }] },
  { id: 'application-001', kind: '陪玩入驻', summary: '月光游戏社 · 英雄联盟', submittedAt: '2026-10-25T14:10:00+08:00', status: '已通过', content: [{ label: '申请俱乐部', value: '月光游戏社' }, { label: '申请游戏', value: '英雄联盟' }, { label: '考核服务', value: '轻松娱乐 / 娱乐局 / 按小时服务' }, { label: '考官', value: '莓莓汽水' }, { label: '考核费用', value: '500 钻石（已支付）' }] },
]
