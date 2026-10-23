import { lazy } from 'react'
import type React from 'react'
import type { PrototypePreviewProps } from '@/prototypes/previewState'

export type PageCategory = 'frontend' | 'admin'

export interface PageStateOption {
  id: string
  label: string
}

export interface PageItem {
  path: string
  label: string
  entryView?: string
  component: React.ComponentType<PrototypePreviewProps>
  category: PageCategory
  dirName: string
  states: readonly PageStateOption[]
}

type PrototypeModule = { default?: React.ComponentType<PrototypePreviewProps> }
type PrototypeLoader = () => Promise<PrototypeModule>

const allModules = import.meta.glob<PrototypeModule>('../../src/prototypes/*/index.tsx')

const frontendModules: Record<string, PrototypeLoader> = {}
const adminModules: Record<string, PrototypeLoader> = {}

Object.entries(allModules).forEach(([path, mod]) => {
  const match = path.match(/\.\.\/\.\.\/src\/prototypes\/([^/]+)\//)
  if (match) {
    const dirName = match[1]
    if (dirName.includes('admin')) {
      adminModules[path] = mod
    } else {
      frontendModules[path] = mod
    }
  }
})

const demoPageStates: readonly PageStateOption[] = [
  { id: 'normal', label: '正常' },
  { id: 'loading', label: '加载中' },
  { id: 'empty', label: '空数据' },
  { id: 'error', label: '异常' },
]

type PageConfig = { path: string; label: string; states: readonly PageStateOption[]; entryView?: string }

const frontendPageConfig: Record<string, PageConfig | PageConfig[]> = {
  'game-companion-client': [
    { path: '/game-companion-client', label: '陪玩平台首页', entryView: 'home', states: demoPageStates },
    { path: '/game-companion-club-detail', label: '俱乐部详情', entryView: 'club-detail', states: demoPageStates },
    { path: '/game-companion-companion-detail', label: '陪玩详情', entryView: 'companion-detail', states: demoPageStates },
    { path: '/game-companion-checkout', label: '下单结算', entryView: 'checkout', states: demoPageStates },
    { path: '/game-companion-profile', label: '个人中心', entryView: 'profile', states: demoPageStates },
    { path: '/game-companion-wallet', label: '我的钱包', entryView: 'wallet', states: demoPageStates },
    { path: '/game-companion-orders', label: '我的订单', entryView: 'orders', states: demoPageStates },
    { path: '/game-companion-messages', label: '消息', entryView: 'messages', states: demoPageStates },
    { path: '/game-companion-voice-room', label: '语音房', entryView: 'voice-room', states: demoPageStates },
  ],
}

const adminPageConfig: Record<string, { path: string; label: string; states: readonly PageStateOption[] }> = {
  'DEMO-admin-windows-client-components': { path: '/demo/admin/windows-client-components', label: 'DEMO Windows 客户端组件', states: demoPageStates },
}

export const getDefaultComponent = (mod: unknown): React.ComponentType<PrototypePreviewProps> => {
  const moduleWithDefault = mod as { default?: React.ComponentType<PrototypePreviewProps> }
  return moduleWithDefault?.default || (() => null)
}

const getLazyComponent = (loader: PrototypeLoader): React.ComponentType<PrototypePreviewProps> => lazy(async () => {
  const mod = await loader()
  return { default: getDefaultComponent(mod) }
})

export const generatePages = (): PageItem[] => {
  const pages: PageItem[] = []

  Object.entries(frontendModules).forEach(([filePath, loader]) => {
    const match = filePath.match(/\.\.\/\.\.\/src\/prototypes\/([^/]+)\//)
    if (match) {
      const dirName = match[1]
      const config = frontendPageConfig[dirName]
      const pageConfigs = config ? Array.isArray(config) ? config : [config] : []
      pageConfigs.forEach((pageConfig) => pages.push({
        path: pageConfig.path,
        label: pageConfig.label,
        entryView: pageConfig.entryView,
        component: getLazyComponent(loader),
        category: 'frontend',
        dirName,
        states: pageConfig.states,
      }))
    }
  })

  Object.entries(adminModules).forEach(([filePath, loader]) => {
    const match = filePath.match(/\.\.\/\.\.\/src\/prototypes\/([^/]+)\//)
    if (match) {
      const dirName = match[1]
      const config = adminPageConfig[dirName]
      if (config) {
        pages.push({
          path: config.path,
          label: config.label,
          component: getLazyComponent(loader),
          category: 'admin',
          dirName,
          states: config.states,
        })
      }
    }
  })

  return pages
}

export const pages = generatePages()
