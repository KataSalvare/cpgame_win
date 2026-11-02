import { useState } from 'react'
import { DialogPanel } from '@/components/WindowsClient'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'
import type { ExamOrder, ExamSubmission } from '../data/examOrderMockData'

export function ExamOrderDetailPanel({ order, role, onPay, onCancel, onContact, onSubmit }: {
  order: ExamOrder
  role: '考生订单' | '考官订单'
  onPay: () => void
  onCancel: () => void
  onContact: () => void
  onSubmit: (submission: ExamSubmission) => void
}) {
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [submissionOpen, setSubmissionOpen] = useState(false)
  const title = role === '考生订单' ? '考官信息' : '考生信息'
  return <>
    <div className="order-detail-panel exam-order-detail">
      <section className="order-detail-status-card"><strong className="order-detail-status-card__status">{order.status}</strong><span className="order-detail-status-card__id">{order.id}</span><span className="order-detail-status-card__created">创建时间 {order.createdAt}</span></section>
      <section className="order-detail-section"><div className="order-detail-section__heading"><span className="client-eyebrow">{title}</span></div><div className="order-detail-companion"><AvatarMark initials={order.initials} size="md" /><div><strong><UserNameWithLevel name={order.person} identityId={order.personId} /></strong><span>{order.clubName}</span></div></div></section>
      <section className="order-detail-section"><div className="order-detail-section__heading"><span className="client-eyebrow">考试信息</span></div><div className="order-detail-facts"><span>游戏</span><strong>{order.game}</strong><span>玩法</span><strong>{order.play}</strong><span>等级</span><strong>{order.level}</strong><span>服务</span><strong>{order.service}</strong><span>考核费用</span><strong>500 钻石</strong></div></section>
      {order.submission && <section className="order-detail-section"><div className="order-detail-section__heading"><span className="client-eyebrow">考核资料</span></div><div className="exam-submission-summary"><span>考核结果：{order.submission.result}</span>{order.submission.recordingUrls.map((url, index) => <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer">录屏地址 {index + 1}</a>)}{order.submission.note && <p>{order.submission.note}</p>}{order.submission.images.length > 0 && <div className="exam-submission-summary__images">{order.submission.images.map((src, index) => <img src={src} alt={`考核资料 ${index + 1}`} key={`${order.id}-image-${index}`} />)}</div>}</div></section>}
      <footer className="order-detail-actions exam-order-detail__actions">
        {role === '考生订单' && order.status === '待支付' && <><button type="button" className="client-button client-button--secondary" onClick={() => setCancelConfirm(true)}>取消订单</button><ExamOrderPayButton onPay={onPay} /></>}
        {role === '考生订单' && ['已通过', '未通过'].includes(order.status) && <button type="button" className="client-button client-button--primary" onClick={onContact}>联系客服</button>}
        {role === '考官订单' && order.status === '待考核' && <button type="button" className="client-button client-button--primary" onClick={() => setSubmissionOpen(true)}>提交考核资料</button>}
      </footer>
    </div>
    {cancelConfirm && <DialogPanel overlayId="exam-order-cancel-confirm" title="取消考核订单" onClose={() => setCancelConfirm(false)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setCancelConfirm(false)}>返回</button><button type="button" className="client-button client-button--primary" onClick={() => { onCancel(); setCancelConfirm(false) }}>确认取消</button></>}><p>确认取消这笔考核订单吗？取消后订单将关闭。</p></DialogPanel>}
    {submissionOpen && <ExamSubmissionDialog order={order} onClose={() => setSubmissionOpen(false)} onSubmit={submission => { onSubmit(submission); setSubmissionOpen(false) }} />}
  </>
}

export function ExamOrderPayButton({ onPay }: { onPay: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  return <>
    <button type="button" className="client-button client-button--primary" onClick={() => setConfirmOpen(true)}>支付</button>
    {confirmOpen && <DialogPanel overlayId="exam-order-payment-confirm" title="支付" onClose={() => setConfirmOpen(false)} width={380} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setConfirmOpen(false)}>返回</button><button type="button" className="client-button client-button--primary" onClick={() => { setConfirmOpen(false); onPay() }}>确认支付</button></>}><p>确认支付500钻石吗？</p></DialogPanel>}
  </>
}

export function ExamSubmissionDialog({ order, onClose, onSubmit }: { order: ExamOrder; onClose: () => void; onSubmit: (submission: ExamSubmission) => void }) {
  const [images, setImages] = useState<string[]>([])
  const [recordingUrls, setRecordingUrls] = useState<string[]>([''])
  const [note, setNote] = useState('')
  const [result, setResult] = useState<ExamSubmission['result'] | ''>('')
  const [imageError, setImageError] = useState('')
  const validUrls = recordingUrls.every(url => !url.trim() || isValidUrl(url.trim()))
  const canSubmit = Boolean(result) && validUrls
  const addImages = (files: File[]) => {
    const remaining = 9 - images.length
    const accepted = files.filter(file => file.type.startsWith('image/')).slice(0, remaining)
    if (files.length > remaining) setImageError('最多添加9张图片')
    else setImageError('')
    accepted.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => { if (typeof reader.result === 'string') setImages(current => current.length < 9 ? [...current, reader.result as string] : current) }
      reader.readAsDataURL(file)
    })
  }
  return <DialogPanel overlayId="exam-order-submission" title="提交考核资料" onClose={onClose} width={600} footer={<><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" disabled={!canSubmit} onClick={() => onSubmit({ images, recordingUrls: recordingUrls.map(url => url.trim()).filter(Boolean), note: note.trim(), result: result as ExamSubmission['result'] })}>提交资料</button></>}>
    <div className="exam-submission-form">
      <p className="exam-submission-form__order">{order.id} · {order.person} · {order.game} · {order.play}</p>
      <div className="exam-submission-field"><span>考核图片 <small>{images.length}/9</small></span><div className="exam-submission-images">{images.map((src, index) => <figure key={`${order.id}-${index}`}><img src={src} alt={`考核图片 ${index + 1}`} /><button type="button" aria-label={`移除考核图片 ${index + 1}`} onClick={() => setImages(current => current.filter((_, imageIndex) => imageIndex !== index))}>移除</button></figure>)}{images.length < 9 && <label className="exam-submission-upload"><span>＋</span>添加图片<input type="file" accept="image/*" multiple aria-label="添加考核图片" onChange={event => { addImages(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = '' }} /></label>}</div>{imageError && <small role="alert">{imageError}</small>}</div>
      <div className="exam-submission-field"><span>录屏地址</span>{recordingUrls.map((url, index) => <div className="exam-submission-url" key={`url-${index}`}><input type="url" value={url} aria-label={`录屏地址 ${index + 1}`} aria-invalid={Boolean(url.trim()) && !isValidUrl(url.trim())} placeholder="https://" onChange={event => setRecordingUrls(current => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />{recordingUrls.length > 1 && <button type="button" onClick={() => setRecordingUrls(current => current.filter((_, itemIndex) => itemIndex !== index))}>删除</button>}</div>)}<button type="button" className="exam-submission-add-url" onClick={() => setRecordingUrls(current => [...current, ''])}>添加录屏地址</button>{!validUrls && <small role="alert">请输入有效的 URL 地址</small>}</div>
      <label className="exam-submission-field">备注<textarea rows={3} value={note} onChange={event => setNote(event.target.value)} placeholder="填写考核说明" /></label>
      <fieldset className="exam-submission-result"><legend>考核结果</legend>{(['已通过', '未通过'] as const).map(value => <label key={value}><input type="radio" name="exam-result" checked={result === value} onChange={() => setResult(value)} />{value}</label>)}</fieldset>
      <small>图片在本地预览；录屏地址、备注和结果仅用于本地演示。</small>
    </div>
  </DialogPanel>
}

function isValidUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' } catch { return false }
}
