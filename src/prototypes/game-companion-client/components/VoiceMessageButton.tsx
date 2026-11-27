import { useEffect, useState } from 'react'
import { Play, Square } from 'lucide-react'
import type { VoiceMessage } from '../data/mockData'

type Props = {
  message: VoiceMessage
  label: string
  compact?: boolean
}

export function VoiceMessageButton({ message, label, compact = false }: Props) {
  const [playing, setPlaying] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => {
    if (playing && supported) window.speechSynthesis.cancel()
  }, [playing, supported])

  const togglePlayback = () => {
    if (!supported) return
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message.text)
    utterance.lang = 'zh-CN'
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)
    setPlaying(true)
    window.speechSynthesis.speak(utterance)
  }

  return <button
    type="button"
    className={`client-voice-button${compact ? ' client-voice-button--compact' : ''}${playing ? ' is-playing' : ''}`}
    onClick={(event) => { event.stopPropagation(); togglePlayback() }}
    disabled={!supported}
    aria-label={`${playing ? '停止' : '播放'}${label}，${message.duration}秒`}
    aria-pressed={playing}
    title={supported ? `${playing ? '停止' : '播放'}${label}` : '当前环境不支持语音播放'}
  >
    <span className="client-voice-button__icon" aria-hidden="true">{playing ? <Square size={12} fill="currentColor" /> : <Play size={13} fill="currentColor" />}</span>
    <span className="client-voice-button__wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
    <span className="client-voice-button__duration">{message.duration}″</span>
  </button>
}
