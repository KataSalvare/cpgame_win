import '@/prototypes/game-companion-client/workbench.css'
import '@/prototypes/game-companion-client/style.css'
import '@/prototypes/game-companion-client/high-fidelity.css'
import '@/prototypes/game-companion-client/order-tables.css'
import './table-guide.css'

const rows = [
  { id: 'GC-20261018-0051', name: '折光', initials: '折', club: '破晓竞技公会', service: '无畏契约 · 战术陪练', detail: '标准场 · 小时服务', status: '已完成', actions: ['联系客服', '再次下单', '评价订单'] },
  { id: 'GC-20261029-0001', name: '北纬三十度', initials: '北', club: '北境战术俱乐部', service: '无畏契约 · 团队上分', detail: '团队场 · 小时服务', status: '待支付', actions: ['支付订单', '取消订单'] },
  { id: 'GC-20261020-0084', name: '莓莓汽水', initials: '莓', club: '月光游戏社', service: '英雄联盟 · 轻松娱乐', detail: '娱乐局 · 小时服务', status: '服务中', actions: ['确认完成', '续订服务', '提前结束'] },
]

const statusGroups = [
  { title: '待处理', colors: '#AD650C / #FFF8ED / #F1D8B4', statuses: ['待支付', '待接单', '待服务', '待确认', '待玩家确认', '待陪玩确认', '待考核', '审核中', '待响应'] },
  { title: '进行中', colors: '#2F66C5 / #EFF6FF / #C8DDF6', statuses: ['服务中', '已加入候选名单'] },
  { title: '已完成', colors: '#287A4B / #EFF9F2 / #C8E7D1', statuses: ['已完成', '已通过'] },
  { title: '异常与退款', colors: '#C9362B / #FFF2F1 / #F2CFCA', statuses: ['退款', '未通过'] },
  { title: '中性', colors: '#667085 / #F4F5F7 / #D9DFE7', statuses: ['已暂停', '已取消', '已取消匹配'] },
]

export function TableGuide() {
  return <div className="companion-guide table-guide" data-prototype-palette="high-fidelity">
    <header className="guide-header"><div><span>黄黑陪玩平台 / UI 说明</span><h1>表格</h1></div><div className="guide-header-meta">Windows 客户端组件</div></header>
    <main className="guide-content">
      <div className="guide-section-title"><h2>订单表格</h2><span>实际尺寸 · 操作列容纳三个按钮</span></div>
      <div className="table-guide-stage game-companion-client"><section className="orders-list-card"><div className="orders-list" role="table" aria-label="订单表格示例">
        <div className="order-list-header" role="row"><span role="columnheader">订单号</span><span role="columnheader">陪玩信息</span><span role="columnheader">服务信息</span><span role="columnheader">时长</span><span className="order-price-columns" role="columnheader"><span>单价</span><span>实付</span></span><span role="columnheader">状态</span><span role="columnheader">操作</span></div>
        {rows.map(row => <div className="order-item" role="row" key={row.id}><div className="order-item__main"><span className="order-item__info"><strong>{row.id}</strong><small>2026-10-18 17:32</small></span><span className="order-item__companion"><span className="table-guide-avatar">{row.initials}</span><span className="order-item__companion-copy"><strong>{row.name}</strong><small>{row.club}</small></span></span><span className="order-item__service"><strong>{row.service}</strong><small>{row.detail}</small></span><span className="order-item__duration">1 小时</span><span className="order-item__price order-price-columns"><strong>190 金豆 / 小时</strong><strong>190 金豆</strong></span><span className="order-item__status" data-status={row.status}>{row.status}</span></div><div className="order-item__actions">{row.actions.map(action => <button type="button" key={action} className={`client-button client-button--${['支付订单', '确认完成'].includes(action) ? 'primary' : 'secondary'}`}>{action}</button>)}</div></div>)}
      </div></section></div>
      <div className="table-guide-specs"><section><h2>结构与间距</h2><dl><div><dt>表头</dt><dd>44 px · 浅灰背景</dd></div><div><dt>数据行</dt><dd>至少 80 px · 横向分隔线</dd></div><div><dt>字段间距</dt><dd>10 px · 内容与表头对齐</dd></div><div><dt>操作列</dt><dd>276 px · 至少三个按钮</dd></div></dl></section><section><h2>行内操作</h2><dl><div><dt>尺寸与间距</dt><dd>88 × 30 px · 间隔 6 px</dd></div><div><dt>文案</dt><dd>统一四个字</dd></div><div><dt>主要操作</dt><dd>黄色轻玻璃 · 深色文字</dd></div><div><dt>次要操作</dt><dd>白灰轻玻璃 · 细边框</dd></div></dl></section><section><h2>状态标签</h2><p>文字、圆点、浅底与边框组合表达状态。</p><p>下方列出当前订单、考核与匹配请求的全部展示值。</p></section></div>
      <div className="guide-section-title table-guide-status-title"><h2>状态枚举与样式</h2><span>文字 / 背景 / 边框</span></div>
      <div className="table-guide-status-grid">{statusGroups.map(group => <section key={group.title}><div className="table-guide-status-heading"><h3>{group.title}</h3><code>{group.colors}</code></div><div className="game-companion-client"><div className="orders-list table-guide-statuses">{group.statuses.map(status => <span className="order-item__status" data-status={status} key={status}>{status}</span>)}</div></div></section>)}</div>
      <p className="table-guide-status-note">“待用户确认”在玩家订单列表中显示为“待确认”；提前结束请求显示为“待陪玩确认”。</p>
    </main>
  </div>
}
