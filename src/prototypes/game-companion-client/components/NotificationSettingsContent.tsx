import { useEffect, useRef, useState } from 'react'
import { notificationSounds, type NotificationChannel, type NotificationPreference, type NotificationPreferences } from '../data/personalSettingsMockData'

const options: { key: NotificationChannel; label: string }[] = [
  { key: 'privateMessages', label: '私聊消息' },
  { key: 'groupMessages', label: '群聊消息' },
  { key: 'orderUpdates', label: '订单消息' },
  { key: 'calls', label: '呼叫通知' },
  { key: 'matches', label: '匹配通知' },
  { key: 'roomEntry', label: '进房提示' },
]

export function NotificationSettingsContent({ preferences, onChange }: { preferences: NotificationPreferences; onChange: (preferences: NotificationPreferences) => void }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<NotificationChannel | null>(null)
  const [error, setError] = useState('')
  useEffect(() => () => { audio.current?.pause() }, [])

  function stop() {
    audio.current?.pause()
    audio.current = null
    setPlaying(null)
  }
  function update(key: NotificationChannel, patch: Partial<NotificationPreference>) {
    if (playing === key) stop()
    setError('')
    onChange({ ...preferences, [key]: { ...preferences[key], ...patch } })
  }
  async function preview(key: NotificationChannel) {
    if (playing === key) { stop(); return }
    stop()
    setError('')
    const preference = preferences[key]
    const sound = notificationSounds.find((item) => item.id === preference.soundId) ?? notificationSounds[0]
    const player = new Audio(sound.src)
    audio.current = player
    player.volume = preference.volume / 100
    player.onended = () => { if (audio.current === player) stop() }
    setPlaying(key)
    try { await player.play() } catch {
      if (audio.current === player) { stop(); setError('声音播放失败，请重新试音。') }
    }
  }

  return <>
    <table className="personal-notification-table">
      <thead><tr><th scope="col">通知类型</th><th scope="col">文字提醒</th><th scope="col">音效提醒</th><th scope="col">声音文件</th><th scope="col">音量</th></tr></thead>
      <tbody>{options.map(({ key, label }) => {
        const preference = preferences[key]
        return <tr key={key}>
          <th scope="row">{label}</th>
          <td><input type="checkbox" aria-label={`${label}文字提醒`} checked={preference.text} onChange={(event) => update(key, { text: event.target.checked })} /></td>
          <td><input type="checkbox" aria-label={`${label}音效提醒`} checked={preference.sound} onChange={(event) => update(key, { sound: event.target.checked })} /></td>
          <td><div className="personal-notification-sound"><select aria-label={`${label}声音文件`} value={preference.soundId} disabled={!preference.sound} onChange={(event) => update(key, { soundId: event.target.value })}>{notificationSounds.map((sound) => <option key={sound.id} value={sound.id}>{sound.label}</option>)}</select><button type="button" className="client-button client-button--secondary" disabled={!preference.sound || preference.volume === 0} aria-label={`${label}${playing === key ? '停止试音' : '试音'}`} onClick={() => void preview(key)}>{playing === key ? '停止' : '试音'}</button></div></td>
          <td><div className="personal-notification-volume"><input type="range" min="0" max="100" aria-label={`${label}音量`} value={preference.volume} disabled={!preference.sound} onChange={(event) => update(key, { volume: Number(event.target.value) })} /><output>{preference.volume}%</output></div></td>
        </tr>
      })}</tbody>
    </table>
    {error && <p className="personal-setting-error" role="alert">{error}</p>}
  </>
}
