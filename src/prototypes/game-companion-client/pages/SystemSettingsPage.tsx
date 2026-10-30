import { useState, type KeyboardEvent, type FormEvent } from 'react'
import { ArrowLeft, Bell, Folder, FolderOpen, Keyboard, RotateCcw } from 'lucide-react'
import { NotificationToast } from '@/components/WindowsClient'

import { AudioSettingsContent } from '../components/AudioSettingsContent'
import { NotificationSettingsContent } from '../components/NotificationSettingsContent'
import { initialNotificationPreferences, type NotificationPreferences } from '../data/personalSettingsMockData'
import { defaultSystemSettings, type ClientSystemSettings } from '../data/systemSettingsMockData'

const isAbsoluteWindowsPath = (value: string) => /^(?:[a-z]:\\|\\\\[^\\]+\\[^\\]+)/i.test(value) && !/[<>"|?*]/.test(value) && ![...value].some(character => character.charCodeAt(0) < 32) && !value.slice(2).includes(':')
export function SystemSettingsPage({ settings, onSave, notifications, onUpdateNotifications, onBack }: { settings: ClientSystemSettings; notifications: NotificationPreferences; onUpdateNotifications: (preferences: NotificationPreferences) => void; onSave: (settings: ClientSystemSettings) => void; onBack: () => void }) {
  const [draft, setDraft] = useState(settings)
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [folderPreview, setFolderPreview] = useState('')
  const openFolder = (path: string) => {
    const normalized = path.trim().replaceAll('/', '\\')
    setFeedback(''); setFolderPreview('')
    if (!isAbsoluteWindowsPath(normalized)) { setError('请输入有效的文件夹绝对路径。'); return }
    setError(''); setFolderPreview(normalized)
  }
  const captureShortcut = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!capturing) return
    event.preventDefault()
    event.stopPropagation()
    if (event.key === 'Escape') { setCapturing(false); return }
    if (event.repeat || ['Control', 'Alt', 'Shift', 'Meta'].includes(event.key) || event.nativeEvent.isComposing) return
    const key = event.code === 'Space' ? 'Space' : event.key.length === 1 ? event.key.toUpperCase() : event.key
    if (!/^(?:[A-Z0-9]|F(?:[1-9]|1[0-2])|Space|Tab|Enter|Backspace|Delete|Insert|Home|End|PageUp|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.test(key)) { setError('请选择字母、数字、功能键或方向键。'); return }
    const shortcut = [event.ctrlKey && 'Ctrl', event.altKey && 'Alt', event.shiftKey && 'Shift', event.metaKey && 'Win', key].filter(Boolean).join(' + ')
    setDraft(current => ({ ...current, pushToTalkShortcut: shortcut }))
    setError(''); setCapturing(false); setFeedback('')
  }
  const save = (event: FormEvent) => {
    event.preventDefault()
    const next = { ...draft, screenRecordingPath: draft.screenRecordingPath.trim().replaceAll('/', '\\'), roomRecordingPath: draft.roomRecordingPath.trim().replaceAll('/', '\\') }
    if (!isAbsoluteWindowsPath(next.screenRecordingPath)) { setError('请输入有效的屏幕录制绝对路径，例如 D:\\Recordings\\Screen。'); return }
    if (!isAbsoluteWindowsPath(next.roomRecordingPath)) { setError('请输入有效的房间录音绝对路径，例如 D:\\Recordings\\Room。'); return }
    setDraft(next); onSave(next); setError(''); setFeedback('系统设置已保存')
  }
  return <div className="client-content system-settings-page">
    <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={15} />返回</button>
    <div className="client-section-heading"><h1>系统设置</h1><button type="button" className="client-button client-button--secondary" onClick={() => { setDraft(defaultSystemSettings); onSave(defaultSystemSettings); onUpdateNotifications(initialNotificationPreferences); setCapturing(false); setError(''); setFeedback('已恢复默认设置') }}><RotateCcw size={14} />恢复默认</button></div>
    <form onSubmit={save}>
      <section className="client-card system-settings-card"><h2><Keyboard size={18} />语音快捷键</h2><div className="system-settings-row"><label id="push-to-talk-label">按键发言</label><div><button type="button" className={`client-button client-button--secondary system-shortcut${capturing ? ' is-capturing' : ''}`} aria-label={capturing ? '录入按键发言快捷键' : `按键发言快捷键：${draft.pushToTalkShortcut}`} aria-pressed={capturing} onClick={() => { setCapturing(true); setFeedback('') }} onKeyDown={captureShortcut} onBlur={() => setCapturing(false)}>{capturing ? '请按下快捷键…' : draft.pushToTalkShortcut}</button>{capturing && <small role="status">按 Esc 取消</small>}</div></div></section>
      <section className="client-card system-settings-card"><h2><Folder size={18} />文件保存位置</h2>
        <div className="system-settings-row"><label htmlFor="screen-recording-path">屏幕录制本地路径</label><div className="system-settings-path"><input id="screen-recording-path" value={draft.screenRecordingPath} onChange={event => { setDraft(current => ({ ...current, screenRecordingPath: event.target.value })); setError(''); setFeedback('') }} spellCheck={false} /><button type="button" className="client-button client-button--secondary system-folder-button" aria-label="打开屏幕录制文件夹" title="打开文件夹" onClick={() => openFolder(draft.screenRecordingPath)}><FolderOpen size={17} /></button></div></div>
        <div className="system-settings-row"><label htmlFor="room-recording-path">房间录音本地路径</label><div className="system-settings-path"><input id="room-recording-path" value={draft.roomRecordingPath} onChange={event => { setDraft(current => ({ ...current, roomRecordingPath: event.target.value })); setError(''); setFeedback('') }} spellCheck={false} /><button type="button" className="client-button client-button--secondary system-folder-button" aria-label="打开房间录音文件夹" title="打开文件夹" onClick={() => openFolder(draft.roomRecordingPath)}><FolderOpen size={17} /></button></div></div>
      </section>
      <AudioSettingsContent settings={draft} onChange={next => { setDraft(next); setFeedback('') }} />
      <section className="client-card system-settings-card"><h2><Bell size={18} />通知设置</h2><NotificationSettingsContent preferences={notifications} onChange={onUpdateNotifications} /></section>
      {error && <p role="alert" className="personal-setting-error">{error}</p>}
      <footer className="system-settings-footer"><button type="submit" className="client-button client-button--primary" disabled={capturing}>保存设置</button></footer>
    </form>
    {folderPreview && <NotificationToast variant="neutral" title="打开文件夹（演示）" message={folderPreview} onDismiss={() => setFolderPreview('')} />}
    {feedback && <NotificationToast variant="success" message={feedback} onDismiss={() => setFeedback('')} />}
  </div>
}
