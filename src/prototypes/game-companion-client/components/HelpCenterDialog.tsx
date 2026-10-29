import { ArrowLeft, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DialogPanel } from '@/components/WindowsClient'

const categories = [
  { name: '平台规范', articles: ['平台守则', '使用规范', '冻结规范', '社区交流规范', '账号使用规范', '内容发布规范', '违规行为说明', '申诉处理规范', '信息安全规范', '账号处罚说明', '平台管理规则', '未成年人保护说明'] },
  { name: '用户手册', articles: ['新手入门', '下单与匹配', '订单管理', '如何搜索陪玩', '如何收藏陪玩', '如何关注俱乐部', '如何编辑个人资料', '如何使用语音房', '如何发送消息', '如何查看公告', '如何管理好友', '如何设置通知'] },
  { name: '充值与提现', articles: ['如何充值', '提现说明', '钱包明细', '支持哪些支付方式', '充值未到账怎么办', '如何查看钻石余额', '糖豆如何兑换', '如何申请提现', '提现进度查询', '优惠券如何使用', '如何查看充值记录', '账户余额说明'] },
  { name: '订单与售后', articles: ['查看订单', '申请退款', '联系陪玩', '如何取消订单', '如何续单', '如何暂停服务', '如何评价订单', '订单状态说明', '提前结束服务', '如何申请售后', '订单金额说明', '联系平台客服'] },
  { name: '平台协议', articles: ['用户协议', '隐私政策', '服务协议', '充值服务说明', '退款规则说明', '个人信息保护说明', '未成年人保护说明', '账号注销说明', '平台规则说明', '信息使用说明', '第三方服务说明', '协议更新记录'] },
]

export function HelpCenterDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(categories[0].name)
  const [page, setPage] = useState(1)
  const [selectedArticle, setSelectedArticle] = useState<{ category: string; title: string } | null>(null)
  const filtered = useMemo(() => categories.flatMap((category) => category.articles
    .filter((title) => `${category.name}${title}`.includes(query.trim()))
    .map((title) => ({ category: category.name, title }))), [query])
  const activeArticles = query.trim() ? filtered : filtered.filter((article) => article.category === activeCategory)
  if (!open) return null
  return <DialogPanel overlayId="help-center" title="帮助中心" description="常见问题" onClose={onClose} width={760}>
    <div className="help-center-dialog">
      {selectedArticle && <div className="help-center-detail"><button type="button" className="help-center-back" onClick={() => setSelectedArticle(null)}><ArrowLeft size={16} />返回</button><div className="help-center-detail__category">{selectedArticle.category}</div><h2>{selectedArticle.title}</h2><p>这里展示“{selectedArticle.title}”的帮助说明。具体服务内容和处理规则以平台正式公布的信息为准。</p></div>}
      {!selectedArticle && <>
      <label className="help-center-search"><Search size={16} /><span className="sr-only">搜索帮助内容</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="搜索问题关键词" /></label>
      {!query.trim() && <div className="help-center-categories" role="tablist" aria-label="帮助内容分类">{categories.map((category) => <button key={category.name} type="button" role="tab" aria-selected={activeCategory === category.name} onClick={() => { setActiveCategory(category.name); setPage(1) }}>{category.name}</button>)}</div>}
      {activeArticles.length ? <section className="help-center-list" aria-label={query.trim() ? '搜索结果' : activeCategory}><header><h2>{query.trim() ? '搜索结果' : activeCategory}</h2><span>{activeArticles.length}篇内容</span></header>{activeArticles.slice((page - 1) * 10, page * 10).map((article, index) => <button className="help-center-list__item" type="button" key={`${article.category}-${article.title}`} onClick={() => setSelectedArticle(article)}><span className="help-center-list__number">{String((page - 1) * 10 + index + 1).padStart(2, '0')}</span><span className="help-center-list__copy"><strong>{article.title}</strong><small>点击查看{article.title}</small></span><ChevronRight size={16} /></button>)}{activeArticles.length > 10 && <nav className="help-center-pagination" aria-label="帮助内容分页"><button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={15} />上一页</button><span>{page} / {Math.ceil(activeArticles.length / 10)}</span><button type="button" disabled={page >= Math.ceil(activeArticles.length / 10)} onClick={() => setPage((current) => Math.min(Math.ceil(activeArticles.length / 10), current + 1))}>下一页<ChevronRight size={15} /></button></nav>}</section> : <div className="help-center-empty">没有找到相关问题</div>}
      </>}
    </div>
  </DialogPanel>
}
