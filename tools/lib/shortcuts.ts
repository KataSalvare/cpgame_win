export type Theme = 'light' | 'dark'

export const DEFAULT_PROJECT_NAME = '项目原型预览'

export const loadProjectName = (): string => {
  try {
    const saved = localStorage.getItem('prototype-project-name')
    if (saved) {
      return saved
    }
  } catch {
    // ignore
  }
  return DEFAULT_PROJECT_NAME
}

export const saveProjectName = (name: string) => {
  try {
    localStorage.setItem('prototype-project-name', name)
  } catch {
    // ignore
  }
}

export const loadTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('prototype-theme')
    if (saved === 'dark' || saved === 'light') {
      return saved
    }
  } catch {
    // ignore
  }
  return 'light'
}

export const saveTheme = (theme: Theme) => {
  try {
    localStorage.setItem('prototype-theme', theme)
  } catch {
    // ignore
  }
}

export interface ShortcutConfig {
  copyToFigma: string
  copyToAxure: string
  openDoc: string
  selectElement: string
}

export const DEFAULT_SHORTCUTS: ShortcutConfig = {
  copyToFigma: 'ctrl+cmd+c',
  copyToAxure: 'ctrl+cmd+x',
  openDoc: 'ctrl+cmd+e',
  selectElement: 'ctrl+cmd+s',
}

export const AXURE_BRIDGE_URL = 'http://127.0.0.1:32767'

export const checkAxureBridge = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const response = await fetch(`${AXURE_BRIDGE_URL}/available`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    return response.ok
  } catch {
    return false
  }
}

export const loadShortcuts = (): ShortcutConfig => {
  try {
    const saved = localStorage.getItem('prototype-shortcuts')
    if (saved) {
      return { ...DEFAULT_SHORTCUTS, ...JSON.parse(saved) }
    }
  } catch {
    // ignore
  }
  return DEFAULT_SHORTCUTS
}

export const saveShortcuts = (shortcuts: ShortcutConfig) => {
  try {
    localStorage.setItem('prototype-shortcuts', JSON.stringify(shortcuts))
  } catch {
    // ignore
  }
}

export const getOS = (): 'mac' | 'windows' | 'linux' | 'unknown' => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('mac')) return 'mac'
  if (userAgent.includes('win')) return 'windows'
  if (userAgent.includes('linux')) return 'linux'
  return 'unknown'
}

export const formatShortcut = (shortcut: string): string => {
  const os = getOS()
  if (os === 'mac') {
    return shortcut
      .replace('ctrl', '⌃')
      .replace('cmd', '⌘')
      .replace('alt', '⌥')
      .replace('shift', '⇧')
      .toUpperCase()
  }
  return shortcut
    .replace('ctrl', 'Ctrl')
    .replace('alt', 'Alt')
    .replace('shift', 'Shift')
    .replace('cmd', 'Win')
}

export const parseShortcut = (shortcut: string): { ctrl: boolean; meta: boolean; alt: boolean; shift: boolean; key: string } => {
  const parts = shortcut.toLowerCase().split('+')
  return {
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('cmd') || parts.includes('meta'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    key: parts.find(p => !['ctrl', 'cmd', 'meta', 'alt', 'shift'].includes(p)) || '',
  }
}

let shortcutModalOpen = false
export const setShortcutModalOpen = (open: boolean) => {
  shortcutModalOpen = open
}
export const isShortcutModalOpen = (): boolean => shortcutModalOpen

export const matchShortcut = (e: KeyboardEvent, shortcut: string): boolean => {
  const parsed = parseShortcut(shortcut)
  const key = e.key.toLowerCase()

  const ctrlMatch = parsed.ctrl === e.ctrlKey
  const metaMatch = parsed.meta === e.metaKey
  const altMatch = parsed.alt === e.altKey
  const shiftMatch = parsed.shift === e.shiftKey
  const keyMatch = parsed.key === key

  return ctrlMatch && metaMatch && altMatch && shiftMatch && keyMatch
}
