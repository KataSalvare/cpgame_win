import { useState, type KeyboardEvent, type FormEvent } from 'react'
import { ArrowLeft, Bell, Folder, FolderOpen, FolderPen, Keyboard, RotateCcw, X } from 'lucide-react'
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
  const [editingPath, setEditingPath] = useState<null | 'screenRecordingPath' | 'roomRecordingPath'>(null)
  const [pathDraft, setPathDraft] = useState('')
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
  const confirmPath = (event: FormEvent) => {
    event.preventDefault()
    const normalized = pathDraft.trim().replaceAll('/', '\\')
    if (!isAbsoluteWindowsPath(normalized)) { setError('请输入有效的 Windows 文件夹绝对路径。'); return }
    if (editingPath) setDraft(current => ({ ...current, [editingPath]: normalized }))
    setEditingPath(null); setError(''); setFeedback('路径已更新，请保存设置使其生效')
  }
  const pathLabel = editingPath === 'screenRecordingPath' ? '屏幕录制本地路径' : '房间录音本地路径'
  return <div className="client-content system-settings-page">
    <div className="system-settings-page__heading"><button type="button" className="client-back-link" onClick={onBack} aria-label="返回"><ArrowLeft size={16} /></button><h1>系统设置</h1><button type="button" className="client-button client-button--secondary" onClick={() => { setDraft(defaultSystemSettings); onSave(defaultSystemSettings); onUpdateNotifications(initialNotificationPreferences); setCapturing(false); setError(''); setFeedback('已恢复默认设置') }}><RotateCcw size={14} />恢复默认</button></div>
    <form onSubmit={save}>
      <section className="client-card system-settings-card"><h2><Keyboard size={18} />语音快捷键</h2><div className="system-settings-row"><label id="push-to-talk-label">按键发言</label><div><button type="button" className={`client-button client-button--secondary system-shortcut${capturing ? ' is-capturing' : ''}`} aria-label={capturing ? '录入按键发言快捷键' : `按键发言快捷键：${draft.pushToTalkShortcut}`} aria-pressed={capturing} onClick={() => { setCapturing(true); setFeedback('') }} onKeyDown={captureShortcut} onBlur={() => setCapturing(false)}>{capturing ? '请按下快捷键…' : draft.pushToTalkShortcut}</button>{capturing && <small role="status">按 Esc 取消</small>}</div></div></section>
      <section className="client-card system-settings-card"><h2><Folder size={18} />文件保存位置</h2>
        <div className="system-settings-row"><label>屏幕录制本地路径</label><div className="system-settings-path"><input aria-label="屏幕录制本地路径" value={draft.screenRecordingPath} readOnly spellCheck={false} /><button type="button" className="client-button client-button--secondary system-path-action" onClick={() => { setEditingPath('screenRecordingPath'); setPathDraft(draft.screenRecordingPath); setError('') }}><FolderPen size={15} />更改</button><button type="button" className="client-button client-button--secondary system-path-action" aria-label="打开屏幕录制文件夹" title="打开文件夹" onClick={() => openFolder(draft.screenRecordingPath)}><FolderOpen size={16} />打开</button></div></div>
        <div className="system-settings-row"><label>房间录音本地路径</label><div className="system-settings-path"><input aria-label="房间录音本地路径" value={draft.roomRecordingPath} readOnly spellCheck={false} /><button type="button" className="client-button client-button--secondary system-path-action" onClick={() => { setEditingPath('roomRecordingPath'); setPathDraft(draft.roomRecordingPath); setError('') }}><FolderPen size={15} />更改</button><button type="button" className="client-button client-button--secondary system-path-action" aria-label="打开房间录音文件夹" title="打开文件夹" onClick={() => openFolder(draft.roomRecordingPath)}><FolderOpen size={16} />打开</button></div></div>
      </section>
      <AudioSettingsContent settings={draft} onChange={next => { setDraft(next); setFeedback('') }} />
      <section className="client-card system-settings-card"><h2><Bell size={18} />通知设置</h2><NotificationSettingsContent preferences={notifications} onChange={onUpdateNotifications} /></section>
      {error && <p role="alert" className="personal-setting-error">{error}</p>}
      <footer className="system-settings-footer"><button type="submit" className="client-button client-button--primary" disabled={capturing}>保存设置</button></footer>
    </form>
    {folderPreview && <NotificationToast variant="neutral" title="打开文件夹（演示）" message={folderPreview} onDismiss={() => setFolderPreview('')} />}
    {feedback && <NotificationToast variant="success" message={feedback} onDismiss={() => setFeedback('')} />}
    {editingPath && <div className="system-path-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setEditingPath(null) }}><form className="system-path-dialog" role="dialog" aria-modal="true" aria-labelledby="system-path-dialog-title" onSubmit={confirmPath}>
      <header><h2 id="system-path-dialog-title">更改{pathLabel}</h2><button type="button" className="client-icon-button" aria-label="关闭" onClick={() => setEditingPath(null)}><X size={16} /></button></header>
      <label htmlFor="system-path-edit">文件夹路径</label><input id="system-path-edit" autoFocus value={pathDraft} onChange={event => { setPathDraft(event.target.value); setError('') }} spellCheck={false} />
      {error && <p role="alert" className="personal-setting-error">{error}</p>}
      <footer><button type="button" className="client-button client-button--secondary" onClick={() => setEditingPath(null)}>取消</button><button type="submit" className="client-button client-button--primary">确认更改</button></footer>
    </form></div>}
  </div>
}
