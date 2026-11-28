const labels: Record<string, string> = {
  支付: '支付订单',
  续单: '续订服务',
  评价: '评价订单',
  抢单: '抢接订单',
  接受: '接受订单',
  拒绝: '拒绝订单',
  免单: '免单退款',
  同意提前结束: '同意结束',
  拒绝提前结束: '拒绝结束',
}

export function TableActionLabel({ action }: { action: string }) {
  const label = labels[action] ?? action
  if (label === action) return action
  return <><span className="table-action-label--grayscale">{action}</span><span className="table-action-label--high-fidelity">{label}</span></>
}
