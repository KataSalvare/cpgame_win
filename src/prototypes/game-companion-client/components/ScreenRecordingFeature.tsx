import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Circle, CircleStop, Pause, Play, Video } from 'lucide-react'
import { DialogPanel, NotificationToast } from '@/components/WindowsClient'

type RecordingState = 'idle' | 'recording' | 'paused'

const skipPromptStorageKey = 'game-companion-screen-recording-skip-prompt'

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

export function ScreenRecordingFeature() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [promptOpen, setPromptOpen] = useState(false)
  const [skipPrompt, setSkipPrompt] = useState(() => window.sessionStorage.getItem(skipPromptStorageKey) === 'true')
  const [skipPromptChecked, setSkipPromptChecked] = useState(false)
  const [recordingEnded, setRecordingEnded] = useState(false)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const entryButtonRef = useRef<HTMLButtonElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    left: number
    top: number
    scaleX: number
    scaleY: number
    container: HTMLElement
  } | null>(null)
  const [floatingPosition, setFloatingPosition] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    if (recordingState !== 'recording') return
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recordingState])

  useEffect(() => {
    if (!recordingEnded) return
    const timeout = window.setTimeout(() => setRecordingEnded(false), 3200)
    return () => window.clearTimeout(timeout)
  }, [recordingEnded])

  useEffect(() => {
    if (!promptOpen) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    startButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setPromptOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const dialog = document.querySelector<HTMLElement>('[data-overlay="screen-recording-prompt"] [role="dialog"]')
      const focusable = [...(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)') ?? [])]
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
  }, [promptOpen])

  const startRecording = () => {
    const entryButton = entryButtonRef.current
    const container = entryButton?.closest<HTMLElement>('.windows-client-frame')
    if (entryButton && container) {
      const containerRect = container.getBoundingClientRect()
      const buttonRect = entryButton.getBoundingClientRect()
      const scaleX = containerRect.width / container.clientWidth || 1
      const scaleY = containerRect.height / container.clientHeight || 1
      const toolbarWidth = 280
      const toolbarHeight = 52
      const maxLeft = Math.max(8, container.clientWidth - toolbarWidth - 8)
      const maxTop = Math.max(48, container.clientHeight - toolbarHeight - 8)
      const left = Math.min(Math.max(8, (buttonRect.right - containerRect.left) / scaleX - toolbarWidth), maxLeft)
      const top = Math.min(Math.max(48, (buttonRect.bottom - containerRect.top) / scaleY + 8), maxTop)
      setFloatingPosition({ left, top })
    }
    setElapsedSeconds(0)
    setRecordingEnded(false)
    setRecordingState('recording')
    setPromptOpen(false)
  }

  const openRecording = () => {
    if (recordingState !== 'idle') return
    if (skipPrompt) {
      startRecording()
      return
    }
    setSkipPromptChecked(false)
    setPromptOpen(true)
  }

  const updateSkipPrompt = (checked: boolean) => {
    setSkipPromptChecked(checked)
    setSkipPrompt(checked)
    if (checked) window.sessionStorage.setItem(skipPromptStorageKey, 'true')
    else window.sessionStorage.removeItem(skipPromptStorageKey)
  }

  const endRecording = () => {
    setRecordingState('idle')
    setRecordingEnded(true)
  }

  const startDragging = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    const container = event.currentTarget.closest<HTMLElement>('.windows-client-frame')
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const floatRect = event.currentTarget.getBoundingClientRect()
    const scaleX = containerRect.width / container.clientWidth || 1
    const scaleY = containerRect.height / container.clientHeight || 1
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: (floatRect.left - containerRect.left) / scaleX,
      top: (floatRect.top - containerRect.top) / scaleY,
      scaleX,
      scaleY,
      container,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const dragFloatingToolbar = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const maxLeft = drag.container.clientWidth - event.currentTarget.offsetWidth - 8
    const maxTop = drag.container.clientHeight - event.currentTarget.offsetHeight - 8
    const left = Math.min(Math.max(8, drag.left + (event.clientX - drag.startX) / drag.scaleX), maxLeft)
    const top = Math.min(Math.max(48, drag.top + (event.clientY - drag.startY) / drag.scaleY), maxTop)
    setFloatingPosition({ left, top })
  }

  const stopDragging = (event: PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
  }

  return <>
    <button
      ref={entryButtonRef}
      type="button"
      className={`screen-recording-entry${recordingState !== 'idle' ? ' is-active' : ''}`}
      onClick={openRecording}
      disabled={recordingState !== 'idle'}
      data-tooltip={recordingState === 'recording' ? `录制中 ${formatDuration(elapsedSeconds)}` : recordingState === 'paused' ? `已暂停 ${formatDuration(elapsedSeconds)}` : '屏幕录制'}
      aria-label={recordingState === 'recording' ? `屏幕录制中，${formatDuration(elapsedSeconds)}` : recordingState === 'paused' ? `屏幕录制已暂停，${formatDuration(elapsedSeconds)}` : '屏幕录制'}
    >
      {recordingState === 'recording' ? <Circle size={13} fill="currentColor" aria-hidden="true" /> : <Video size={15} aria-hidden="true" />}
    </button>

    {promptOpen && <DialogPanel
      overlayId="screen-recording-prompt"
      title="屏幕录制"
      description="开始后可在悬浮工具条暂停或结束录制。"
      width={440}
      onClose={() => setPromptOpen(false)}
      footer={<>
        <button type="button" className="client-button client-button--secondary" onClick={() => setPromptOpen(false)}>取消</button>
        <button ref={startButtonRef} type="button" className="client-button client-button--primary" onClick={startRecording}>开始录制</button>
      </>}
    >
      <label className="screen-recording-prompt__skip">
        <input type="checkbox" checked={skipPromptChecked} onChange={(event) => updateSkipPrompt(event.target.checked)} />
        <span>本次会话不再提醒</span>
      </label>
    </DialogPanel>}

    {recordingState !== 'idle' && <section
      className="screen-recording-float"
      aria-label="屏幕录制控制，可拖动"
      onPointerDown={startDragging}
      onPointerMove={dragFloatingToolbar}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      style={floatingPosition ? { left: floatingPosition.left, top: floatingPosition.top, right: 'auto', bottom: 'auto' } : undefined}
    >
      <span className={`screen-recording-float__indicator${recordingState === 'paused' ? ' is-paused' : ''}`} aria-hidden="true" />
      <div className="screen-recording-float__info">
        <strong>{recordingState === 'recording' ? '录制中' : '已暂停'}</strong>
        <time>{formatDuration(elapsedSeconds)}</time>
      </div>
      <button
        type="button"
        className="screen-recording-float__button"
        onClick={() => setRecordingState((state) => state === 'recording' ? 'paused' : 'recording')}
        aria-label={recordingState === 'recording' ? '暂停录制' : '继续录制'}
        title={recordingState === 'recording' ? '暂停录制' : '继续录制'}
      >{recordingState === 'recording' ? <Pause size={16} /> : <Play size={16} />}</button>
      <button type="button" className="screen-recording-float__button screen-recording-float__button--end" onClick={endRecording} aria-label="结束录制" title="结束录制"><CircleStop size={17} /></button>
    </section>}

    {recordingEnded && <NotificationToast variant="success" message="录制结束" onDismiss={() => setRecordingEnded(false)} className="screen-recording-toast" />}
  </>
}
