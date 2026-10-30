import { useRef, useState } from 'react'
import { CalendarDays, ImagePlus, Search, ThumbsDown, ThumbsUp, TreeDeciduous, X } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'
import { PageStatePanel } from '../components/PageStatePanel'
import { AvatarMark } from '../components/AvatarMark'
import { initialMyWoodpeckerTickets, publicWoodpeckerRecords, woodpeckerMockUsers, woodpeckerReasons, type PublicWoodpeckerRecord, type WoodpeckerTicket, type WoodpeckerTicketType, type WoodpeckerUser } from '../data/woodpeckerMockData'

type Props = {
  pageState: 'normal' | 'loading' | 'empty' | 'error'
  onRetry: () => void
}

type Tab = 'mine' | 'public'
type TicketFilter = '全部工单' | '建议工单' | '啄木鸟工单'

export function WoodpeckerPage({ pageState, onRetry }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('mine')
  const [activeFilter, setActiveFilter] = useState<TicketFilter>('全部工单')
  const [tickets, setTickets] = useState(initialMyWoodpeckerTickets)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [ticketType, setTicketType] = useState<WoodpeckerTicketType>('suggestion')
  const [reason, setReason] = useState('')
  const [reportedUser, setReportedUser] = useState('')
  const [reportedUserResult, setReportedUserResult] = useState<WoodpeckerUser | null>(null)
  const [reportedUserSearched, setReportedUserSearched] = useState(false)
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [anonymous, setAnonymous] = useState(true)
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const visibleTickets = tickets.filter((ticket) => activeFilter === '全部工单' || (activeFilter === '建议工单' ? ticket.type === 'suggestion' : ticket.type === 'report'))
  const visiblePublicRecords = publicWoodpeckerRecords.filter((record) => {
    const keyword = appliedSearch.trim().toLocaleLowerCase()
    return !keyword || record.reportedUser.toLocaleLowerCase().includes(keyword) || record.reportedUserId.toLocaleLowerCase().includes(keyword)
  })
  const canSubmit = Boolean(description.trim()) && (ticketType === 'suggestion' || Boolean(reason && reportedUserResult))

  const searchReportedUser = () => {
    const keyword = reportedUser.trim().toLocaleLowerCase()
    const match = keyword ? woodpeckerMockUsers.find((user) => user.name.toLocaleLowerCase() === keyword || user.id.toLocaleLowerCase() === keyword) ?? null : null
    setReportedUserResult(match)
    setReportedUserSearched(true)
  }

  const resetForm = () => {
    setFormOpen(false)
    setTicketType('suggestion')
    setReason('')
    setReportedUser('')
    setReportedUserResult(null)
    setReportedUserSearched(false)
    setDescription('')
    setAttachments([])
    setAnonymous(true)
  }

  const submitTicket = () => {
    if (!canSubmit) return
    const now = new Date()
    const submittedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const ticket: WoodpeckerTicket = {
      id: `WD-${Date.now()}`,
      type: ticketType,
      status: '待处理',
      submittedAt,
      ...(ticketType === 'report' && reportedUserResult ? { reportedUser: reportedUserResult.name, reportedUserId: reportedUserResult.id, reason, anonymous } : { anonymous: false }),
      description: description.trim(),
      attachments,
    }
    setTickets((current) => [ticket, ...current])
    setActiveTab('mine')
    setActiveFilter('全部工单')
    resetForm()
  }

  const addAttachments = (files: FileList | null) => {
    if (!files) return
    setAttachments((current) => [...current, ...Array.from(files).map((file) => file.name)].slice(0, 5))
  }

  if (pageState !== 'normal') return <div className="client-content woodpecker-state"><PageStatePanel state={pageState} title={pageState === 'empty' ? '暂无工单' : '啄木鸟暂不可用'} description={pageState === 'loading' ? '正在加载工单…' : pageState === 'error' ? '暂时无法加载，请重试。' : '当前没有可显示的工单。'} actionLabel={pageState === 'error' ? '重新加载' : '查看全部'} onAction={onRetry} /></div>

  return <div className="client-content woodpecker-page">
    <header className="client-page-heading woodpecker-page__heading"><h1>啄木鸟</h1>{activeTab === 'mine' && <button type="button" className="client-button client-button--primary" onClick={() => setFormOpen(true)}>我要建议/举报</button>}</header>

    <div className="woodpecker-tabs" role="tablist" aria-label="啄木鸟分类">
      <button type="button" role="tab" aria-selected={activeTab === 'mine'} className={activeTab === 'mine' ? 'is-active' : ''} onClick={() => setActiveTab('mine')}>我的啄木鸟</button>
      <button type="button" role="tab" aria-selected={activeTab === 'public'} className={activeTab === 'public' ? 'is-active' : ''} onClick={() => setActiveTab('public')}>啄木鸟公示</button>
    </div>

    {activeTab === 'mine' ? <section className="woodpecker-panel" role="tabpanel" aria-label="我的啄木鸟">
      <div className="woodpecker-filter-row" role="group" aria-label="工单类型">
        {(['全部工单', '建议工单', '啄木鸟工单'] as const).map((filter) => <button key={filter} type="button" className={`woodpecker-filter${activeFilter === filter ? ' is-active' : ''}`} aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
        <span className="woodpecker-count">{visibleTickets.length} 条</span>
      </div>
      {visibleTickets.length ? <div className="woodpecker-ticket-list">{visibleTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</div> : <div className="woodpecker-empty"><TreeDeciduous size={30} /><strong>暂无{activeFilter === '全部工单' ? '' : activeFilter.replace('工单', '')}工单</strong></div>}
    </section> : <section className="woodpecker-panel" role="tabpanel" aria-label="啄木鸟公示">
      <form className="woodpecker-search" onSubmit={(event) => { event.preventDefault(); setAppliedSearch(search) }}><label htmlFor="woodpecker-search-input">搜索被售后人昵称或 ID</label><input id="woodpecker-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索被售后人昵称或 ID" /><button type="submit" className="client-button client-button--secondary">搜索</button></form>
      {visiblePublicRecords.length ? <div className="woodpecker-ticket-list woodpecker-ticket-list--public">{visiblePublicRecords.map((record) => <PublicRecordCard key={record.id} record={record} feedback={feedback[record.id] ?? null} onFeedback={(value) => setFeedback((current) => ({ ...current, [record.id]: current[record.id] === value ? null : value }))} />)}</div> : <div className="woodpecker-empty"><TreeDeciduous size={30} /><strong>没有匹配的公示工单</strong></div>}
    </section>}

    {formOpen && <DialogPanel overlayId="woodpecker-submit" title="售后申请" width={680} className="woodpecker-dialog" onClose={resetForm} footer={<><button type="button" className="client-button client-button--secondary" onClick={resetForm}>取消</button><button type="button" className="client-button client-button--primary" disabled={!canSubmit} onClick={submitTicket}>提交</button></>}>
      <div className="woodpecker-form">
        <fieldset className="woodpecker-form__fieldset"><legend><span aria-hidden="true">*</span>售后类型</legend><div className="woodpecker-choice-row">
          <label className={ticketType === 'suggestion' ? 'is-selected' : ''}><input type="radio" name="woodpecker-type" checked={ticketType === 'suggestion'} onChange={() => setTicketType('suggestion')} />意见建议</label>
          <label className={ticketType === 'report' ? 'is-selected' : ''}><input type="radio" name="woodpecker-type" checked={ticketType === 'report'} onChange={() => setTicketType('report')} />啄木鸟（举报）</label>
        </div></fieldset>
        {ticketType === 'report' && <>
          <label className="woodpecker-form__field"><span><b aria-hidden="true">*</b>售后原因</span><select value={reason} onChange={(event) => setReason(event.target.value)}><option value="">请选择售后原因</option>{woodpeckerReasons.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="woodpecker-form__field"><label htmlFor="woodpecker-reported-user"><b aria-hidden="true">*</b>被售后人</label><form className="woodpecker-user-search" onSubmit={(event) => { event.preventDefault(); searchReportedUser() }}><input id="woodpecker-reported-user" value={reportedUser} onChange={(event) => { setReportedUser(event.target.value); setReportedUserResult(null); setReportedUserSearched(false) }} placeholder="请输入完整昵称或 ID" /><button type="submit" className="client-button client-button--secondary" aria-label="搜索用户"><Search size={15} />搜索</button></form>
            {reportedUserResult ? <div className="woodpecker-user-result" role="status"><AvatarMark initials={reportedUserResult.name.slice(0, 1)} size="sm" /><span>{reportedUserResult.name}</span><span>{reportedUserResult.id}</span></div> : reportedUserSearched && <p className="woodpecker-user-not-found" role="status">未找到用户</p>}
          </div>
        </>}
        <label className="woodpecker-form__field"><span><b aria-hidden="true">*</b>补充说明</span><textarea value={description} maxLength={200} onChange={(event) => setDescription(event.target.value)} placeholder="请输入补充说明，最多输入200字" /><small>{description.length}/200</small></label>
        <section className="woodpecker-attachments" aria-labelledby="woodpecker-attachments-label"><div id="woodpecker-attachments-label">附件说明</div><div className="woodpecker-attachments__list">
          {attachments.map((file, index) => <span className="woodpecker-attachment" key={`${file}-${index}`}>{file}<button type="button" aria-label={`移除附件 ${file}`} onClick={() => setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))}><X size={13} /></button></span>)}
          {attachments.length < 5 && <button type="button" className="woodpecker-attachments__add" onClick={() => fileRef.current?.click()}><ImagePlus size={19} /><span>上传图片</span></button>}
          <input ref={fileRef} className="woodpecker-file-input" type="file" accept="image/*" multiple aria-label="选择投诉图片附件" onChange={(event) => { addAttachments(event.target.files); event.target.value = '' }} />
        </div></section>
        {ticketType === 'report' && <div className="woodpecker-anonymous-group"><label className="woodpecker-anonymous"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />匿名提交</label><p>尊敬的用户，工单处理完成后将公示7天，期间其他用户可查看。如不愿公开信息，可选择匿名提交，但附件中的隐私信息请自行打码。公示期满后工单将不再对外展示。</p></div>}
      </div>
    </DialogPanel>}
  </div>
}

function TicketCard({ ticket, showResponse = true }: { ticket: WoodpeckerTicket; showResponse?: boolean }) {
  return <article className="woodpecker-ticket client-card">
    <header className="woodpecker-ticket__header"><strong>{ticket.type === 'suggestion' ? '建议工单' : '啄木鸟工单'}</strong><span className={`woodpecker-status woodpecker-status--${ticket.status === '已处理' ? 'done' : 'pending'}`}>{ticket.status}</span><time><CalendarDays size={14} />{ticket.submittedAt}</time></header>
    <dl className="woodpecker-ticket__fields">
      <div><dt>售后类型</dt><dd>{ticket.type === 'suggestion' ? '意见建议' : '啄木鸟工单（举报）'}</dd></div>
      {ticket.reason && <div><dt>售后原因</dt><dd>{ticket.reason}</dd></div>}
      {ticket.reportedUser && <div><dt>被售后人</dt><dd>{ticket.anonymous ? '匿名提交' : ticket.reportedUserId || ticket.reportedUser}</dd></div>}
      <div><dt>补充说明</dt><dd>{ticket.description}</dd></div>
    </dl>
    {ticket.attachments.length > 0 && <div className="woodpecker-ticket__attachments" aria-label="附件">{ticket.attachments.map((attachment) => <span key={attachment}>{attachment}</span>)}</div>}
    {showResponse && ticket.response && <section className="woodpecker-response"><h3>官方处理回复</h3><p>{ticket.response}</p></section>}
    <footer className="woodpecker-ticket__footer"><span>工单号 {ticket.id}</span></footer>
  </article>
}

function PublicRecordCard({ record, feedback, onFeedback }: { record: PublicWoodpeckerRecord; feedback: 'like' | 'dislike' | null; onFeedback: (value: 'like' | 'dislike') => void }) {
  return <article className="woodpecker-ticket woodpecker-ticket--public client-card">
    <header className="woodpecker-ticket__header"><div className="woodpecker-submitter"><AvatarMark initials={record.anonymous ? '' : record.reportedUser.slice(0, 1)} size="sm" /><strong>{record.anonymous ? '匿名提交' : '用户提交'}</strong></div><span className="woodpecker-ticket__time"><CalendarDays size={14} />{record.submittedAt} 处理</span></header>
    <dl className="woodpecker-ticket__fields">
      <div><dt>售后类型</dt><dd>啄木鸟工单</dd></div>
      <div><dt>被售后人</dt><dd className="woodpecker-user-identity"><AvatarMark initials={record.reportedUser.slice(0, 1)} size="sm" /><span>{record.reportedUser}</span><span className="woodpecker-user-identity__id">{record.reportedUserId}</span></dd></div>
      {record.reason && <div><dt>售后原因</dt><dd>{record.reason}</dd></div>}
      <div><dt>补充说明</dt><dd>{record.description}</dd></div>
    </dl>
    {record.attachments.length > 0 && <div className="woodpecker-ticket__attachments" aria-label="附件">{record.attachments.map((attachment) => <span key={attachment}>{attachment}</span>)}</div>}
    <section className="woodpecker-response"><h3>官方处理回复</h3><p>{record.response}</p><div className="woodpecker-response__feedback"><button type="button" aria-label="有帮助" aria-pressed={feedback === 'like'} onClick={() => onFeedback('like')}><ThumbsUp size={15} />{record.likes + (feedback === 'like' ? 1 : 0)}</button><button type="button" aria-label="没帮助" aria-pressed={feedback === 'dislike'} onClick={() => onFeedback('dislike')}><ThumbsDown size={15} />{record.dislikes + (feedback === 'dislike' ? 1 : 0)}</button></div></section>
    {record.comments > 0 && <footer className="woodpecker-ticket__footer"><span>{record.comments} 条评论</span></footer>}
  </article>
}
