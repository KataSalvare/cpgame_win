import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Bot, ChevronRight, CircleHelp, FileText, Headset, SearchCheck, Send, ShieldAlert } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'

type SupportMessage = { id: number; role: 'user' | 'assistant'; text: string }

const suggestedQuestions = [
  { title: '如何查看订单？' },
  { title: '如何联系陪玩？' },
  { title: '如何申请退款？' },
]

const quickActions = [
  { label: '订单查询', icon: SearchCheck, question: '我想查询订单' },
  { label: '退款咨询', icon: FileText, question: '我想咨询退款' },
  { label: '常见问题', icon: CircleHelp, question: '请查看常见问题' },
]

export function PlatformSupportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<SupportMessage[]>([])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    inputRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const dialog = dialogRef.current.closest<HTMLElement>('[role="dialog"]')
      const focusable = [...(dialog ?? dialogRef.current).querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open, onClose])

  useEffect(() => {
    if (messageListRef.current) messageListRef.current.scrollTop = messageListRef.current.scrollHeight
  }, [messages])

  if (!open) return null

  const replyFor = (question: string) => {
    if (question.includes('订单')) return '可前往「我的订单」查看订单状态和详情。'
    if (question.includes('退款')) return '请提供订单号咨询，具体退款条件和处理结果以平台规则为准。'
    if (question.includes('陪玩')) return '在大神资料或订单详情中点击「聊一聊」，即可进入对应会话。'
    return '请描述你遇到的问题；如涉及订单，请附上订单号，方便后续处理。'
  }

  const ask = (question: string) => {
    const text = question.trim()
    if (!text) return
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text },
      { id: Date.now() + 1, role: 'assistant', text: replyFor(text) },
    ])
    setDraft('')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    ask(draft)
  }

  return <DialogPanel
    overlayId="platform-support"
    title="平台客服"
    description="超速电竞 · 客服中心"
    onClose={onClose}
    width={720}
    className="client-support-dialog-panel"
    draggable
  >
    <section className="client-support-dialog" ref={dialogRef} aria-label="平台客服对话">
      <div className="client-support-dialog__notice"><ShieldAlert size={16} aria-hidden="true" /><p>请勿向他人提供验证码或账户密码；交易请在平台内完成。</p></div>
      <div className="client-support-dialog__messages" ref={messageListRef} aria-live="polite" aria-label="对话记录">
        <div className="client-support-message client-support-message--assistant">
          <span className="client-support-message__avatar" aria-hidden="true"><Bot size={16} /></span>
          <div className="client-support-message__body"><p>您好，请问有什么可以帮助您？</p><small>平台客服</small></div>
        </div>
        <div className="client-support-guide">
          <div className="client-support-guide__heading"><Headset size={15} aria-hidden="true" /><strong>常见问题</strong></div>
          {suggestedQuestions.map((item) => <button type="button" key={item.title} onClick={() => ask(item.title)}>{item.title}<ChevronRight size={15} aria-hidden="true" /></button>)}
        </div>
        {messages.map((message) => <div key={message.id} className={`client-support-message client-support-message--${message.role}`}>
          {message.role === 'assistant' && <span className="client-support-message__avatar" aria-hidden="true"><Bot size={16} /></span>}
          <div className="client-support-message__body"><p>{message.text}</p>{message.role === 'assistant' && <small>平台客服</small>}</div>
        </div>)}
      </div>
      <div className="client-support-dialog__quick-actions" aria-label="快捷问题">
        {quickActions.map(({ label, icon: Icon, question }) => <button type="button" key={label} onClick={() => ask(question)}><Icon size={18} aria-hidden="true" /><span>{label}</span></button>)}
      </div>
      <form className="client-support-dialog__composer" onSubmit={submit}>
        <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="输入客服问题" placeholder="输入问题或订单号…" />
        <button type="submit" disabled={!draft.trim()}><Send size={15} aria-hidden="true" />发送</button>
      </form>
    </section>
  </DialogPanel>
}
