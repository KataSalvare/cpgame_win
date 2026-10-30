import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'

const REPORT_TYPES = ['政治', '诈骗', '侮辱诽谤', '色情暴力', '侵权', '广告拉人', '其他原因']
const MAX_REPORT_IMAGES = 5
const MAX_REPORT_REASON_LENGTH = 500
type ReportImage = { id: string; name: string; url: string }

export function UserReportDialog({ overlayId, onClose, onSubmit }: { overlayId: string; onClose: () => void; onSubmit: () => void }) {
  const [reportType, setReportType] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reportImages, setReportImages] = useState<ReportImage[]>([])
  const reportImageInputRef = useRef<HTMLInputElement>(null)
  const reportImageUrlsRef = useRef(new Set<string>())

  useEffect(() => () => {
    reportImageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    reportImageUrlsRef.current.clear()
  }, [])

  const removeReportImage = (image: ReportImage) => {
    URL.revokeObjectURL(image.url)
    reportImageUrlsRef.current.delete(image.url)
    setReportImages((current) => current.filter((item) => item.id !== image.id))
  }

  const addReportImages = (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_REPORT_IMAGES - reportImages.length
    const nextImages = Array.from(files).filter((file) => file.type.startsWith('image/')).slice(0, remaining).map((file) => {
      const url = URL.createObjectURL(file)
      reportImageUrlsRef.current.add(url)
      return { id: `${file.name}-${url}`, name: file.name, url }
    })
    setReportImages((current) => [...current, ...nextImages])
  }

  return <DialogPanel overlayId={overlayId} title="举报用户" onClose={onClose} width={640} className="companion-report-dialog" footer={<><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" disabled={!reportType || !reportReason.trim()} onClick={onSubmit}>提交举报</button></>}>
    <fieldset className="companion-report-types">
      <legend>选择举报类型</legend>
      <div className="companion-report-types__options" role="radiogroup" aria-label="选择举报类型">{REPORT_TYPES.map((type) => {
        const selected = reportType === type
        return <button key={type} type="button" role="radio" aria-checked={selected} className={selected ? 'is-selected' : ''} onClick={() => setReportType(type)}>{type}</button>
      })}</div>
    </fieldset>
    <label className="companion-report-description"><span>描述举报原因<strong>*</strong></span><textarea value={reportReason} maxLength={MAX_REPORT_REASON_LENGTH} onChange={(event) => setReportReason(event.target.value)} placeholder="请描述举报原因，帮助我们更好地为您解决问题" /><small>{reportReason.length}/{MAX_REPORT_REASON_LENGTH}</small></label>
    <section className="companion-report-upload" aria-labelledby={`companion-report-upload-title-${overlayId}`}>
      <h3 id={`companion-report-upload-title-${overlayId}`}>上传凭证</h3>
      <p>可上传图片佐证，最多可传 5 张图片</p>
      <div className="companion-report-upload__list">
        {reportImages.map((image) => <div key={image.id} className="companion-report-upload__image"><img src={image.url} alt={image.name} /><button type="button" aria-label={`移除${image.name}`} onClick={() => removeReportImage(image)}><X size={13} /></button></div>)}
        {reportImages.length < MAX_REPORT_IMAGES && <button type="button" className="companion-report-upload__add" onClick={() => reportImageInputRef.current?.click()}><ImagePlus size={19} /><span>上传图片</span></button>}
      </div>
      <input ref={reportImageInputRef} className="companion-report-upload__input" type="file" accept="image/*" multiple onChange={(event) => { addReportImages(event.target.files); event.target.value = '' }} aria-label="选择举报凭证图片" />
    </section>
  </DialogPanel>
}
