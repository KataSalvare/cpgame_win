import React, { useEffect, useRef, useState } from 'react'
import { Keyboard, XIcon, RotateCcw } from 'lucide-react'
import {
  DEFAULT_SHORTCUTS,
  formatShortcut,
  getOS,
  saveShortcuts,
  setShortcutModalOpen,
  type ShortcutConfig,
} from '../lib/shortcuts'
import { ANNOTATION_MARKER_COLOR_OPTIONS, getAnnotationMarkerColor } from '../lib/annotations'
import { useToolEntrance } from '../hooks/useToolEntrance'

type ShortcutKey = Exclude<keyof ShortcutConfig, 'markerColor'>

interface ShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: ShortcutConfig
  onSave: (shortcuts: ShortcutConfig) => void
}

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({
  isOpen,
  onClose,
  shortcuts,
  onSave,
}) => {
  const [editingShortcuts, setEditingShortcuts] = useState<ShortcutConfig>(() => shortcuts)
  const [recordingKey, setRecordingKey] = useState<ShortcutKey | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const os = getOS()

  useToolEntrance(overlayRef, overlayRef, isOpen, { scale: 1, y: 0, duration: 0.2 })
  useToolEntrance(overlayRef, dialogRef, isOpen, { y: 8, scale: 0.97, duration: 0.22 })

  useEffect(() => {
    setShortcutModalOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!recordingKey) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (!e.ctrlKey && !e.metaKey) return

      const parts: string[] = []
      if (e.ctrlKey) parts.push('ctrl')
      if (e.metaKey) parts.push('cmd')
      if (e.altKey) parts.push('alt')
      if (e.shiftKey) parts.push('shift')

      const key = e.key.toLowerCase()
      if (key.length === 1 && /[a-z0-9]/.test(key)) {
        parts.push(key)
        setEditingShortcuts(prev => ({ ...prev, [recordingKey]: parts.join('+') }))
        setRecordingKey(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [recordingKey])

  if (!isOpen) return null

  const shortcutLabels: Record<ShortcutKey, string> = {
    copyToFigma: '复制到 Figma',
    copyToAxure: '复制到 Axure',
    openDoc: '查看文档',
    selectElement: '批注模式',
  }

  const textPrimary = 'text-[var(--tool-text)]'
  const textSecondary = 'text-[var(--tool-text-muted)]'
  const textMuted = 'text-[var(--tool-text-subtle)]'
  const borderClass = 'border-[var(--tool-border)]'
  const surfaceClass = 'bg-[var(--tool-surface)]'
  const hoverSurface = 'hover:bg-[var(--tool-surface-hover)]'

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        className={[
          'relative w-[520px] max-w-[92vw] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border tool-panel-light dark:tool-panel-dark',
          'bg-[var(--tool-surface)] border-[var(--tool-border)]',
        ].join(' ')}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-5 bg-[var(--tool-surface-raised)]">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--tool-brand-soft)]">
              <Keyboard className="tool-accent" size={22} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${textPrimary}`}>快捷键设置</h2>
              <p className={`text-xs mt-0.5 ${textMuted}`}>
                检测到系统: {os === 'mac' ? 'macOS' : os === 'windows' ? 'Windows' : os === 'linux' ? 'Linux' : '未知'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-xl tool-control ${textSecondary} ${hoverSurface} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]`}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* 快捷键列表 */}
        <div className="p-6 space-y-3 overflow-y-auto">
          {(Object.keys(shortcutLabels) as ShortcutKey[]).map((key) => (
            <div
              key={key}
              className={`flex items-center justify-between p-4 rounded-xl border tool-control ${
                recordingKey === key
                  ? 'border-current tool-accent bg-current/[0.04]'
                  : `${borderClass} bg-[var(--tool-surface-muted)]`
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--tool-brand-soft)] text-[var(--tool-brand)] text-[10px] font-bold">
                  {shortcutLabels[key].charAt(0)}
                </span>
                <span className={`text-sm font-semibold ${textPrimary}`}>{shortcutLabels[key]}</span>
              </div>
              <button
                onClick={() => setRecordingKey(recordingKey === key ? null : key)}
                className={[
                  'px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all duration-200 min-w-[140px] text-center',
                  recordingKey === key
                    ? 'tool-accent-bg text-white shadow-sm animate-pulse motion-reduce:animate-none'
                    : 'bg-[var(--tool-surface)] text-[var(--tool-text)] border border-[var(--tool-border)] hover:bg-[var(--tool-surface-hover)]',
                ].join(' ')}
              >
                {recordingKey === key ? '按下快捷键...' : formatShortcut(editingShortcuts[key])}
              </button>
            </div>
          ))}

          {/* 批注角标颜色 */}
          <div className={`p-4 rounded-xl border ${borderClass} bg-[var(--tool-surface-muted)]`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-sm font-semibold ${textPrimary}`}>批注角标颜色</span>
                <p className={`mt-1 text-xs ${textMuted}`}>选择页面批注序号的展示颜色</p>
              </div>
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1 ring-white/80 dark:ring-black/30"
                style={{ backgroundColor: getAnnotationMarkerColor(editingShortcuts.markerColor) }}
              >
                1
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ANNOTATION_MARKER_COLOR_OPTIONS.map((option) => {
                const selected = editingShortcuts.markerColor === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setEditingShortcuts((prev) => ({ ...prev, markerColor: option.value }))}
                    aria-pressed={selected}
                    className={[
                      'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 tool-control',
                      selected
                        ? 'border-[var(--tool-brand)] bg-[var(--tool-surface)] shadow-sm'
                        : `${borderClass} bg-[var(--tool-surface)] ${hoverSurface}`,
                    ].join(' ')}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1 ring-white/80 dark:ring-black/30"
                      style={{ backgroundColor: option.color }}
                    >
                      1
                    </span>
                    <span className={textPrimary}>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 提示 */}
          <div className="mt-4 p-4 rounded-xl border border-[var(--tool-brand)]/20 bg-[var(--tool-brand-soft)]">
            <p className={`text-xs font-bold mb-2 tool-accent`}>提示</p>
            <div className={`text-xs space-y-1 ${textSecondary}`}>
              <p>• 快捷键必须包含 Ctrl (Windows) 或 ⌘ (Mac)</p>
              <p>• 可组合 Shift、Alt 等修饰键</p>
              <p>• 点击按钮后按下新的快捷键即可设置</p>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className={`flex items-center justify-between px-6 py-4 bg-[var(--tool-surface-raised)] ${surfaceClass}`}>
          <button
            onClick={() => setEditingShortcuts(DEFAULT_SHORTCUTS)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${textSecondary} ${hoverSurface}`}
          >
            <RotateCcw size={13} />
            恢复默认
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${textSecondary} ${hoverSurface}`}
            >
              取消
            </button>
            <button
              onClick={() => {
                onSave(editingShortcuts)
                saveShortcuts(editingShortcuts)
                onClose()
              }}
              className="px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 tool-accent-bg text-white hover:opacity-90 shadow-sm"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
